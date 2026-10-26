/**
 * Elden Ring: Nightreign Seed Finder - Interactive Pan & Zoom Map Viewer
 */

const COORD_DIMENSIONS = {
  Default: [1536, 1536],
  Mountaintop: [1536, 1536],
  Crater: [1536, 1536],
  "Rotted Woods": [1536, 1536],
  Noklateo: [1536, 1536],
  "Great Hollow": [1254, 1254],
};

const COORD_FILES = {
  Default: "coordinates/basic_layout.json",
  Mountaintop: "coordinates/mountaintop_layout.json",
  Crater: "coordinates/crater_layout.json",
  "Rotted Woods": "coordinates/rotted_woods_layout.json",
  Noklateo: "coordinates/noklateo_layout.json",
  "Great Hollow": "coordinates/great_hollow_layout.json",
};

const MAP_IMAGES = {
  Default: "images/patterns_blank/default_map.png",
  Mountaintop: "images/patterns_blank/mountaintop_map.png",
  Crater: "images/patterns_blank/crater_map.png",
  "Rotted Woods": "images/patterns_blank/rotted_woods_map.png",
  Noklateo: "images/patterns_blank/noklateo_map.png",
  "Great Hollow": "images/patterns_blank/great_hollow_map.png",
};

export class MapViewer {
  constructor(viewportEl, options = {}) {
    this.viewport = viewportEl;
    this.surface = viewportEl.querySelector(".map-surface");
    this.stage = viewportEl.querySelector(".map-stage");
    this.bgImage = viewportEl.querySelector(".map-bg-image");
    this.overlay = viewportEl.querySelector(".map-overlay");
    this.tooltip = viewportEl.querySelector(".map-tooltip");

    this.onMarkerClick = options.onMarkerClick || (() => {});
    this.onSpawnClick = options.onSpawnClick || (() => {});

    // Pan & Zoom state
    this.scale = 1.0;
    this.minScale = 0.4;
    this.maxScale = 4.0;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;
    this.lastTouchDist = 0;

    // Layout data cache
    this.coordsData = {};
    this.currentShifting = "Default";

    this.initEvents();
  }

  async loadCoords(shifting) {
    if (this.coordsData[shifting]) return this.coordsData[shifting];

    const path = COORD_FILES[shifting] || COORD_FILES["Default"];
    try {
      const res = await fetch(path);
      const data = await res.json();
      this.coordsData[shifting] = data;
      return data;
    } catch (e) {
      console.error(`Failed to load coords for ${shifting}:`, e);
      return {};
    }
  }

  async setMapVariant(shifting) {
    this.currentShifting = shifting;
    const imgPath = MAP_IMAGES[shifting] || MAP_IMAGES["Default"];
    this.bgImage.src = imgPath;

    // Reset pan and zoom to fit nicely in viewport
    requestAnimationFrame(() => {
      this.resetView();
    });
  }

  showResolvedImage(seedId, nightlord) {
    const padId = String(seedId).padStart(3, "0");
    const nl = (nightlord || "").toLowerCase().replace(/\s+/g, "_");

    // Local image path
    const localPath = `images/patterns_by_nightlord/${nl}/${padId}.jpg`;
    // Remote upstream fallback
    const remotePath = `https://thefifthmatt.github.io/nightreign/pattern/${padId}.jpg`;

    // Attempt local first, fallback to remote if load fails
    const testImg = new Image();
    testImg.onload = () => {
      this.bgImage.src = localPath;
    };
    testImg.onerror = () => {
      this.bgImage.src = remotePath;
    };
    testImg.src = localPath;

    // Hide pins on resolved seed image so user can inspect the full map details clearly
    this.overlay.style.display = "none";
  }

  showInteractiveMap() {
    this.overlay.style.display = "block";
    const imgPath = MAP_IMAGES[this.currentShifting] || MAP_IMAGES["Default"];
    this.bgImage.src = imgPath;
  }

  /**
   * Render markers based on current coords, candidates, and applied observations
   */
  async renderMarkers(engine) {
    const shifting = this.currentShifting;
    const coords = await this.loadCoords(shifting);
    const [dimW, dimH] = COORD_DIMENSIONS[shifting] || [1536, 1536];

    this.overlay.innerHTML = "";

    const confirmedCols = new Set(engine.observations.map((o) => o.col));
    const availableSpawns = new Set(engine.getAvailableSpawnPoints());
    const isSpawnConfirmed = confirmedCols.has("Spawn Point");

    const explicitSpawns = coords["Spawn Point"] || null;

    // Helper to get % position
    const getPos = (ox, oy) => ({
      left: `${(ox / dimW) * 100}%`,
      top: `${(oy / dimH) * 100}%`,
    });

    // 1. Minor Bases & Spawn Pins
    const minorBases = coords["Minor Base"] || {};
    for (const [name, [ox, oy]] of Object.entries(minorBases)) {
      const pos = getPos(ox, oy);

      // Minor base box marker
      const mibEl = document.createElement("div");
      mibEl.className = `map-marker marker-mib ${
        confirmedCols.has(name) ? "confirmed" : ""
      }`;
      mibEl.style.left = pos.left;
      mibEl.style.top = pos.top;
      mibEl.dataset.name = name;
      mibEl.dataset.category = "Minor Base";

      mibEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onMarkerClick(name, "Minor Base", e);
      });
      this.attachTooltip(mibEl, name);
      this.overlay.appendChild(mibEl);

      // Spawn Pin (for base maps where spawn corresponds to Minor Base {name})
      if (!explicitSpawns) {
        const spawnName = name.replace(/^Minor Base\s+/, "");
        const isCandidateSpawn = availableSpawns.has(spawnName);

        // Only show if it's currently a valid candidate spawn point
        if (
          isCandidateSpawn &&
          (!isSpawnConfirmed ||
            engine.observations.some(
              (o) => o.col === "Spawn Point" && o.val === spawnName
            ))
        ) {
          const isThisSpawnConfirmed = engine.observations.some(
            (o) => o.col === "Spawn Point" && o.val === spawnName
          );

          const spawnEl = document.createElement("div");
          spawnEl.className = `map-marker marker-spawn ${
            isThisSpawnConfirmed ? "confirmed" : ""
          }`;
          // Position pin directly above the minor base
          spawnEl.style.left = pos.left;
          spawnEl.style.top = `calc(${pos.top} - 18px)`;
          spawnEl.dataset.spawn = spawnName;

          spawnEl.innerHTML = `
            <svg viewBox="0 0 24 24">
              <polygon points="12,22 3,5 21,5" />
            </svg>
          `;

          spawnEl.addEventListener("click", (e) => {
            e.stopPropagation();
            this.onSpawnClick(spawnName, e);
          });
          this.attachTooltip(spawnEl, `Spawn: ${spawnName}`);
          this.overlay.appendChild(spawnEl);
        }
      }
    }

    // 2. Explicit Spawn Points (Great Hollow)
    if (explicitSpawns) {
      for (const [name, [ox, oy]] of Object.entries(explicitSpawns)) {
        if (!availableSpawns.has(name)) continue;
        if (
          isSpawnConfirmed &&
          !engine.observations.some(
            (o) => o.col === "Spawn Point" && o.val === name
          )
        ) {
          continue;
        }

        const pos = getPos(ox, oy);
        const isThisSpawnConfirmed = engine.observations.some(
          (o) => o.col === "Spawn Point" && o.val === name
        );

        const spawnEl = document.createElement("div");
        spawnEl.className = `map-marker marker-spawn ${
          isThisSpawnConfirmed ? "confirmed" : ""
        }`;
        spawnEl.style.left = pos.left;
        spawnEl.style.top = pos.top;
        spawnEl.dataset.spawn = name;

        spawnEl.innerHTML = `
          <svg viewBox="0 0 24 24">
            <polygon points="12,22 3,5 21,5" />
          </svg>
        `;

        spawnEl.addEventListener("click", (e) => {
          e.stopPropagation();
          this.onSpawnClick(name, e);
        });
        this.attachTooltip(spawnEl, `Spawn: ${name}`);
        this.overlay.appendChild(spawnEl);
      }
    }

    // 3. Major Bases
    const majorBases = coords["Major Base"] || {};
    for (const [name, [ox, oy]] of Object.entries(majorBases)) {
      const pos = getPos(ox, oy);
      const mabEl = document.createElement("div");
      mabEl.className = `map-marker marker-mab ${
        confirmedCols.has(name) ? "confirmed" : ""
      }`;
      mabEl.style.left = pos.left;
      mabEl.style.top = pos.top;
      mabEl.dataset.name = name;
      mabEl.dataset.category = "Major Base";

      mabEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onMarkerClick(name, "Major Base", e);
      });
      this.attachTooltip(mabEl, name);
      this.overlay.appendChild(mabEl);
    }

    // 4. Field Bosses
    const fieldBosses = coords["Field Boss"] || {};
    for (const [name, [ox, oy]] of Object.entries(fieldBosses)) {
      const pos = getPos(ox, oy);
      const fbEl = document.createElement("div");
      fbEl.className = `map-marker marker-fb ${
        confirmedCols.has(name) ? "confirmed" : ""
      }`;
      fbEl.style.left = pos.left;
      fbEl.style.top = pos.top;
      fbEl.dataset.name = name;
      fbEl.dataset.category = "Field Boss";

      fbEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onMarkerClick(name, "Field Boss", e);
      });
      this.attachTooltip(fbEl, name);
      this.overlay.appendChild(fbEl);
    }

    // 5. Evergaols (Base Maps)
    const evergaols = coords["Evergaol"] || {};
    for (const [name, [ox, oy]] of Object.entries(evergaols)) {
      const pos = getPos(ox, oy);
      const evEl = document.createElement("div");
      evEl.className = `map-marker marker-ev ${
        confirmedCols.has(name) ? "confirmed" : ""
      }`;
      evEl.style.left = pos.left;
      evEl.style.top = pos.top;
      evEl.dataset.name = name;
      evEl.dataset.category = "Evergaol";

      evEl.addEventListener("click", (e) => {
        e.stopPropagation();
        this.onMarkerClick(name, "Evergaol", e);
      });
      this.attachTooltip(evEl, name);
      this.overlay.appendChild(evEl);
    }
  }

  attachTooltip(el, text) {
    el.addEventListener("mouseenter", (e) => {
      this.tooltip.textContent = text;
      this.tooltip.style.display = "block";
      this.updateTooltipPos(e);
    });
    el.addEventListener("mousemove", (e) => this.updateTooltipPos(e));
    el.addEventListener("mouseleave", () => {
      this.tooltip.style.display = "none";
    });
  }

  updateTooltipPos(e) {
    const rect = this.viewport.getBoundingClientRect();
    this.tooltip.style.left = `${e.clientX - rect.left}px`;
    this.tooltip.style.top = `${e.clientY - rect.top}px`;
  }

  // =========================================================================
  // Pan & Zoom Implementation
  // =========================================================================

  initEvents() {
    // Mouse Wheel Zoom
    this.viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = this.viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoomAtPoint(mouseX, mouseY, zoomFactor);
    }, { passive: false });

    // Drag to Pan
    this.viewport.addEventListener("mousedown", (e) => {
      // Don't drag if clicking interactive marker or control button
      if (e.target.closest(".map-marker") || e.target.closest(".map-floating-controls") || e.target.closest(".poi-popover")) {
        return;
      }
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      this.viewport.classList.add("is-dragging");
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.viewport.classList.remove("is-dragging");
      }
    });

    // Touch Support (Drag + Pinch Zoom)
    this.viewport.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        this.isDragging = true;
        this.startX = touch.clientX - this.translateX;
        this.startY = touch.clientY - this.translateY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        this.lastTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.viewport.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const touch = e.touches[0];
        this.translateX = touch.clientX - this.startX;
        this.translateY = touch.clientY - this.startY;
        this.updateTransform();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (this.lastTouchDist > 0) {
          const factor = dist / this.lastTouchDist;
          const rect = this.viewport.getBoundingClientRect();
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          this.zoomAtPoint(midX, midY, factor);
        }
        this.lastTouchDist = dist;
      }
    }, { passive: true });

    this.viewport.addEventListener("touchend", () => {
      this.isDragging = false;
      this.lastTouchDist = 0;
    });

    // Handle Window Resize
    window.addEventListener("resize", () => {
      this.clampTranslation();
      this.updateTransform();
    });
  }

  zoomAtPoint(x, y, factor) {
    const oldScale = this.scale;
    const newScale = Math.min(Math.max(this.scale * factor, this.minScale), this.maxScale);
    if (newScale === oldScale) return;

    // Zoom centered on the point
    this.translateX = x - (x - this.translateX) * (newScale / oldScale);
    this.translateY = y - (y - this.translateY) * (newScale / oldScale);
    this.scale = newScale;

    this.updateTransform();
  }

  zoomIn() {
    const rect = this.viewport.getBoundingClientRect();
    this.zoomAtPoint(rect.width / 2, rect.height / 2, 1.25);
  }

  zoomOut() {
    const rect = this.viewport.getBoundingClientRect();
    this.zoomAtPoint(rect.width / 2, rect.height / 2, 0.8);
  }

  resetView() {
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;
    if (vw === 0 || vh === 0) return;

    const stageSize = 1200; // base stage width & height
    const padding = 20;

    const scaleX = (vw - padding * 2) / stageSize;
    const scaleY = (vh - padding * 2) / stageSize;
    this.scale = Math.min(scaleX, scaleY, 1.0);

    const renderedSize = stageSize * this.scale;
    this.translateX = (vw - renderedSize) / 2;
    this.translateY = (vh - renderedSize) / 2;

    this.updateTransform();
  }

  clampTranslation() {
    // Keep at least part of the map visible in the viewport
    const stageSize = 1200 * this.scale;
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;

    const margin = 100;
    this.translateX = Math.min(Math.max(this.translateX, -stageSize + margin), vw - margin);
    this.translateY = Math.min(Math.max(this.translateY, -stageSize + margin), vh - margin);
  }

  updateTransform() {
    this.surface.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }
}

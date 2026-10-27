/**
 * Elden Ring: Nightreign Seed Finder - UI Controller
 */

import {
  NIGHTLORD_ORDER,
  SHIFTING_EARTH_ORDER,
  UNKNOWN_NIGHTLORD,
  GH_SHIFTING_LABEL,
} from "./engine.js";

const NIGHTLORD_ICONS = {
  Gladius: "ERN_Icon_Target_Tricephalos.png",
  Adel: "ERN_Icon_Target_Gaping_Jaw.png",
  Gnoster: "ERN_Icon_Target_Sentient_Pest.png",
  Maris: "ERN_Icon_Target_Augur.png",
  Libra: "ERN_Icon_Target_Equilibrious_Beast.png",
  Fulghor: "ERN_Icon_Target_Darkdrift_Knight.png",
  Caligo: "ERN_Icon_Target_Fissure_in_the_Fog.png",
  Heolstor: "ERN_Icon_Target_Night_Aspect.png",
  Harmonia: "ERN_Icon_Target_Balancers.png",
  Dreglord: "ERN_Icon_Target_Dreglord.png",
};

const SHIFTING_ICONS = {
  Crater: "ERN_Shifting_Earth_Crater.png",
  Mountaintop: "ERN_Shifting_Earth_Mountaintop.png",
  "Rotted Woods": "ERN_Shifting_Earth_Rotted_Woods.png",
  Noklateo: "ERN_Shifting_Earth_Noklateo.png",
  "Great Hollow": "ERN_Shifting_Earth_Great_Hollow.png",
};

export class UIController {
  constructor(app) {
    this.app = app;

    // Elements
    this.screenStep1 = document.getElementById("screen-step1");
    this.screenStep2 = document.getElementById("screen-step2");
    this.btnProceed = document.getElementById("btn-proceed");
    this.btnBack = document.getElementById("btn-back");

    this.gridNightlords = document.getElementById("grid-nightlords");
    this.gridShifting = document.getElementById("grid-shifting");

    this.candidateBadge = document.getElementById("candidate-badge");
    this.chipNightlord = document.getElementById("chip-nightlord");
    this.chipShifting = document.getElementById("chip-shifting");

    this.infoContainer = document.getElementById("seed-info-rows");
    this.obsContainer = document.getElementById("observations-list");
    this.contradictionEl = document.getElementById("contradiction-banner");
    this.resolutionEl = document.getElementById("resolution-banner");
    this.resolvedSeedId = document.getElementById("resolved-seed-id");
    this.btnCopySeed = document.getElementById("btn-copy-seed");
    this.btnToggleMap = document.getElementById("btn-toggle-map");

    this.poiSelect = document.getElementById("poi-search-select");

    // Popover
    this.popoverEl = document.getElementById("poi-popover");
    this.popoverTitle = document.getElementById("popover-title");
    this.popoverOptions = document.getElementById("popover-options");
    this.popoverClose = document.getElementById("popover-close");

    // Map control buttons
    this.btnZoomIn = document.getElementById("btn-zoom-in");
    this.btnZoomOut = document.getElementById("btn-zoom-out");
    this.btnResetView = document.getElementById("btn-reset-view");
    this.btnUndo = document.getElementById("btn-undo");
    this.btnClear = document.getElementById("btn-clear-all");

    // Selected context in Step 1
    this.selectedNightlord = NIGHTLORD_ORDER[0];
    this.selectedShifting = SHIFTING_EARTH_ORDER[0];
    this.showingResolvedImage = false;

    this.initStep1();
    this.initStep2Events();
  }

  // =========================================================================
  // Step 1: Context Selection Screen
  // =========================================================================

  initStep1() {
    // 1. Render Nightlords
    this.gridNightlords.innerHTML = "";
    const allNl = [...NIGHTLORD_ORDER, UNKNOWN_NIGHTLORD];

    allNl.forEach((name) => {
      const card = document.createElement("div");
      card.className = `choice-card ${
        name === this.selectedNightlord ? "selected" : ""
      }`;
      card.dataset.name = name;

      const iconFile = NIGHTLORD_ICONS[name];
      if (iconFile) {
        card.innerHTML = `
          <img src="images/icons_nightlord/${iconFile}" alt="${name}" loading="lazy" />
          <div class="card-title">${name}</div>
        `;
      } else {
        // Unknown
        card.innerHTML = `
          <div class="icon-placeholder">?</div>
          <div class="card-title">${name}</div>
        `;
      }

      card.addEventListener("click", () => {
        this.selectedNightlord = name;
        this.gridNightlords
          .querySelectorAll(".choice-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      });

      this.gridNightlords.appendChild(card);
    });

    // 2. Render Shifting Earth Events
    this.gridShifting.innerHTML = "";
    SHIFTING_EARTH_ORDER.forEach((name) => {
      const card = document.createElement("div");
      card.className = `choice-card ${
        name === this.selectedShifting ? "selected" : ""
      }`;
      card.dataset.name = name;

      const iconFile = SHIFTING_ICONS[name];
      if (iconFile) {
        card.innerHTML = `
          <img src="images/icons_shifting_earth/${iconFile}" alt="${name}" loading="lazy" />
          <div class="card-title">${name}</div>
        `;
      } else {
        // Default emblem
        card.innerHTML = `
          <div class="icon-placeholder">⚔</div>
          <div class="card-title">${name}</div>
        `;
      }

      card.addEventListener("click", () => {
        this.selectedShifting = name;
        this.gridShifting
          .querySelectorAll(".choice-card")
          .forEach((c) => c.classList.remove("selected"));
        card.classList.add("selected");
      });

      this.gridShifting.appendChild(card);
    });

    // Start Button
    this.btnProceed.addEventListener("click", () => {
      this.app.startDiscovery(this.selectedNightlord, this.selectedShifting);
    });
  }

  // =========================================================================
  // Step 2: Interactive Filtering Screen
  // =========================================================================

  initStep2Events() {
    this.btnBack.addEventListener("click", () => {
      this.showScreen("step1");
    });

    this.btnZoomIn.addEventListener("click", () => this.app.mapViewer.zoomIn());
    this.btnZoomOut.addEventListener("click", () => this.app.mapViewer.zoomOut());
    this.btnResetView.addEventListener("click", () => this.app.mapViewer.resetView());

    this.btnUndo.addEventListener("click", () => {
      this.app.engine.undoLastObservation();
      this.app.onFilterChange();
    });

    this.btnClear.addEventListener("click", () => {
      this.app.engine.clearObservations();
      this.app.onFilterChange();
    });

    // Popover Close
    this.popoverClose.addEventListener("click", () => this.hidePopover());
    window.addEventListener("click", (e) => {
      if (
        this.popoverEl.style.display !== "none" &&
        !this.popoverEl.contains(e.target) &&
        !e.target.closest(".map-marker")
      ) {
        this.hidePopover();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hidePopover();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        this.app.engine.undoLastObservation();
        this.app.onFilterChange();
      }
    });

    // Copy Seed ID
    this.btnCopySeed.addEventListener("click", () => {
      const id = this.resolvedSeedId.textContent.trim();
      navigator.clipboard.writeText(id).then(() => {
        const orig = this.btnCopySeed.textContent;
        this.btnCopySeed.textContent = "Copied!";
        setTimeout(() => (this.btnCopySeed.textContent = orig), 1500);
      });
    });

    // Toggle Seed Map Image vs Interactive Pin Map
    this.btnToggleMap.addEventListener("click", () => {
      const resolved = this.app.engine.getResolvedSeed();
      if (!resolved) return;

      this.showingResolvedImage = !this.showingResolvedImage;
      if (this.showingResolvedImage) {
        this.app.mapViewer.showResolvedImage(resolved.ID, resolved.Nightlord);
        this.btnToggleMap.textContent = "🗺 View Interactive Pins";
      } else {
        this.app.mapViewer.showInteractiveMap();
        this.btnToggleMap.textContent = "📜 View Resolved Seed Map";
      }
    });

    // Quick POI search select dropdown
    this.poiSelect.addEventListener("change", (e) => {
      const col = e.target.value;
      if (col) {
        this.showPopoverForCol(col, e);
        this.poiSelect.value = "";
      }
    });
  }

  showScreen(screen) {
    if (screen === "step1") {
      this.screenStep1.style.display = "flex";
      this.screenStep2.style.display = "none";
    } else {
      this.screenStep1.style.display = "none";
      this.screenStep2.style.display = "flex";
      requestAnimationFrame(() => {
        this.app.mapViewer.resetView();
      });
    }
  }

  updateHeader() {
    this.chipNightlord.textContent = this.app.engine.selectedNightlord;
    this.chipShifting.textContent = this.app.engine.selectedShifting;
  }

  updateCandidates(count, isContradiction, isResolved) {
    this.candidateBadge.textContent = `Candidates: ${count}`;
    this.candidateBadge.classList.remove("resolved", "contradiction", "pulse");

    // Trigger subtle pulse
    void this.candidateBadge.offsetWidth;
    this.candidateBadge.classList.add("pulse");

    if (isResolved) {
      this.candidateBadge.classList.add("resolved");
    } else if (isContradiction) {
      this.candidateBadge.classList.add("contradiction");
    }
  }

  updateSeedInfo(summary) {
    this.infoContainer.innerHTML = "";

    for (const [key, { value, confirmed }] of Object.entries(summary)) {
      const row = document.createElement("div");
      row.className = "info-row";

      const keyEl = document.createElement("div");
      keyEl.className = "info-key";
      keyEl.textContent = key + ":";

      const valEl = document.createElement("div");
      valEl.className = `info-val ${confirmed ? "confirmed" : ""}`;
      valEl.textContent = confirmed ? `✓ ${value}` : value;

      row.appendChild(keyEl);
      row.appendChild(valEl);
      this.infoContainer.appendChild(row);
    }
  }

  updateObservations(observations) {
    this.obsContainer.innerHTML = "";

    if (observations.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-obs-hint";
      empty.textContent = "Click any map marker or spawn pin to narrow seeds.";
      this.obsContainer.appendChild(empty);
      return;
    }

    observations.forEach((obs, index) => {
      const pill = document.createElement("div");
      pill.className = "obs-pill";

      pill.innerHTML = `
        <div class="obs-content">
          <span class="obs-key">${obs.col}</span>
          <span class="obs-val">${obs.val}</span>
        </div>
        <div class="obs-remove" title="Remove observation">✕</div>
      `;

      pill.querySelector(".obs-remove").addEventListener("click", () => {
        this.app.engine.removeObservation(index);
        this.app.onFilterChange();
      });

      this.obsContainer.appendChild(pill);
    });
  }

  updateBanners(isContradiction, isResolved, resolvedSeed) {
    // Contradiction
    if (isContradiction) {
      this.contradictionEl.style.display = "flex";
      this.contradictionEl.querySelector(".btn-rollback").onclick = () => {
        this.app.engine.undoLastObservation();
        this.app.onFilterChange();
      };
    } else {
      this.contradictionEl.style.display = "none";
    }

    // Resolution
    if (isResolved && resolvedSeed) {
      this.resolutionEl.style.display = "flex";
      const padId = String(resolvedSeed.ID).padStart(3, "0");
      this.resolvedSeedId.textContent = `#${padId}`;

      // Automatically switch map view to resolved seed overview image
      if (!this.showingResolvedImage) {
        this.showingResolvedImage = true;
        this.app.mapViewer.showResolvedImage(
          resolvedSeed.ID,
          resolvedSeed.Nightlord
        );
        this.btnToggleMap.textContent = "🗺 View Interactive Pins";
      }
    } else {
      this.resolutionEl.style.display = "none";
      if (this.showingResolvedImage) {
        this.showingResolvedImage = false;
        this.app.mapViewer.showInteractiveMap();
      }
    }
  }

  populatePoiDropdown(engine) {
    this.poiSelect.innerHTML = '<option value="">-- Quick Select POI --</option>';
    if (engine.filteredCandidates.length === 0) return;

    // Collect all candidate columns that have variation
    const firstRow = engine.filteredCandidates[0];
    const candidateCols = Object.keys(firstRow).filter(
      (c) =>
        c !== "ID" &&
        c !== "Nightlord" &&
        c !== "Shifting Earth"
    );

    const sortedCols = candidateCols.sort();
    sortedCols.forEach((col) => {
      const opt = document.createElement("option");
      opt.value = col;
      opt.textContent = col;
      this.poiSelect.appendChild(opt);
    });
  }

  // =========================================================================
  // Floating POI Popover
  // =========================================================================

  showPopover(name, category, clientX, clientY, targetRect = null) {
    const options = this.app.engine.getAvailableOptionsForCol(name);
    if (options.length === 0) return;

    this.popoverTitle.textContent = name;
    this.popoverOptions.innerHTML = "";

    options.forEach(({ value, count }) => {
      const optEl = document.createElement("div");
      optEl.className = "popover-option";
      optEl.innerHTML = `
        <span class="opt-label">${value}</span>
        <span class="opt-count">${count} seeds</span>
      `;

      optEl.addEventListener("click", () => {
        this.hidePopover();
        this.app.engine.addObservation(name, value);
        this.app.onFilterChange();
      });

      this.popoverOptions.appendChild(optEl);
    });

    // Display invisibly first to accurately measure rendered dimensions
    this.popoverEl.style.visibility = "hidden";
    this.popoverEl.style.display = "flex";
    this.popoverEl.style.left = "0px";
    this.popoverEl.style.top = "0px";

    const popRect = this.popoverEl.getBoundingClientRect();
    const popW = popRect.width;
    const popH = popRect.height;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    let posX, posY;

    // 1. Calculate Horizontal Position (posX)
    if (targetRect) {
      // Prefer placing to the right of the marker
      if (targetRect.right + 10 + popW <= vw - margin) {
        posX = targetRect.right + 10;
      } else if (targetRect.left - 10 - popW >= margin) {
        // Flip to the left of the marker if right side overflows
        posX = targetRect.left - 10 - popW;
      } else {
        // Screen is narrow or marker is centered; center popover
        posX = Math.max(margin, (vw - popW) / 2);
      }
      posY = targetRect.top + targetRect.height / 2 - popH / 2;
    } else {
      // Position relative to click point
      if (clientX + 14 + popW <= vw - margin) {
        posX = clientX + 14;
      } else if (clientX - 14 - popW >= margin) {
        posX = clientX - 14 - popW;
      } else {
        posX = Math.max(margin, (vw - popW) / 2);
      }
      posY = clientY - popH / 2;
    }

    // 2. Adjust Vertical Position (posY) to stay within screen
    if (posY + popH > vh - margin) {
      posY = vh - popH - margin;
    }
    if (posY < margin) {
      posY = margin;
    }

    // 3. Strict clamping against viewport boundaries
    posX = Math.max(margin, Math.min(vw - popW - margin, posX));
    posY = Math.max(margin, Math.min(vh - popH - margin, posY));

    this.popoverEl.style.left = `${Math.round(posX)}px`;
    this.popoverEl.style.top = `${Math.round(posY)}px`;
    this.popoverEl.style.visibility = "visible";
  }

  showPopoverForCol(col, event) {
    const targetRect = event?.target?.getBoundingClientRect ? event.target.getBoundingClientRect() : null;
    const x = targetRect ? targetRect.right + 10 : window.innerWidth / 2;
    const y = targetRect ? targetRect.top : window.innerHeight / 2;
    this.showPopover(col, "POI", x, y, targetRect);
  }

  hidePopover() {
    this.popoverEl.style.display = "none";
  }
}


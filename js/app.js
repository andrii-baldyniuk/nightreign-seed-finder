/**
 * Elden Ring: Nightreign Seed Finder - Application Root & Orchestrator
 */

import { SeedEngine } from "./engine.js";
import { MapViewer } from "./map-viewer.js";
import { UIController } from "./ui.js?v=20261027-1";

export class App {
  constructor() {
    this.engine = new SeedEngine();
    this.mapViewer = null;
    this.ui = null;
  }

  async init() {
    // 1. Initialize data engine
    await this.engine.init();

    // 2. Initialize interactive map viewer
    const viewportEl = document.querySelector(".map-viewport");
    this.mapViewer = new MapViewer(viewportEl, {
      onMarkerClick: (name, category, event) => {
        const targetRect = event?.target ? event.target.getBoundingClientRect() : null;
        this.ui.showPopover(name, category, event.clientX, event.clientY, targetRect);
      },
      onSpawnClick: (spawnName) => {
        this.engine.addObservation("Spawn Point", spawnName);
        this.onFilterChange();
      },
    });

    // 3. Initialize UI controller
    this.ui = new UIController(this);
  }

  /**
   * Transition from Step 1 context selection to Step 2 deduction view
   */
  async startDiscovery(nightlord, shifting) {
    this.engine.setContext(nightlord, shifting);
    await this.mapViewer.setMapVariant(shifting);

    this.ui.showScreen("step2");
    this.ui.updateHeader();
    await this.onFilterChange();
  }

  /**
   * Called whenever an observation is added, removed, or undone
   */
  async onFilterChange() {
    const count = this.engine.getCandidateCount();
    const isContradiction = this.engine.isContradiction();
    const isResolved = this.engine.isResolved();
    const resolvedSeed = this.engine.getResolvedSeed();

    // Update UI elements
    this.ui.updateCandidates(count, isContradiction, isResolved);
    this.ui.updateSeedInfo(this.engine.getSeedInfoSummary());
    this.ui.updateObservations(this.engine.observations);
    this.ui.updateBanners(isContradiction, isResolved, resolvedSeed);

    // Update marker layer on map canvas
    await this.mapViewer.renderMarkers(this.engine);
  }
}

// Bootstrap on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init().catch((err) => {
    console.error("Initialization failed:", err);
    alert(
      "Failed to initialize seed finder data. Make sure to run via a web server (e.g. GitHub Pages or python -m http.server)."
    );
  });
});


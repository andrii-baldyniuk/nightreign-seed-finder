/**
 * Elden Ring: Nightreign Seed Finder - Deductive Filtering Engine
 */

export const UNKNOWN_NIGHTLORD = "Unknown";
export const GH_SHIFTING_LABEL = "Great Hollow";

export const NIGHTLORD_ORDER = [
  "Gladius",
  "Adel",
  "Gnoster",
  "Maris",
  "Libra",
  "Fulghor",
  "Caligo",
  "Heolstor",
  "Harmonia",
  "Dreglord",
];

export const SHIFTING_EARTH_ORDER = [
  "Default",
  "Crater",
  "Mountaintop",
  "Rotted Woods",
  "Noklateo",
  GH_SHIFTING_LABEL,
];

export const FILTER_COLS = [
  "Night 1 Boss",
  "Night 2 Boss",
  "Special Event",
  "Castle",
  "Extra Night Boss",
];

export const GH_ONLY_FILTER_COLS = [
  "Legendary Merchant",
  "Scale-Bearing Merchant",
];

export class SeedEngine {
  constructor() {
    this.dfBase = [];
    this.dfGh = [];
    this.selectedNightlord = null;
    this.selectedShifting = null;
    this.baseCandidates = [];
    this.filteredCandidates = [];
    this.observations = []; // array of { col, val }
  }

  /**
   * Load base and Great Hollow seed matrices from JSON data files
   */
  async init() {
    const [baseRes, ghRes] = await Promise.all([
      fetch("data/patterns_base.json"),
      fetch("data/patterns_gh.json"),
    ]);

    if (!baseRes.ok || !ghRes.ok) {
      throw new Error("Failed to load seed patterns data");
    }

    this.dfBase = await baseRes.json();
    this.dfGh = await ghRes.json();
  }

  /**
   * Set Nightlord and Shifting Earth event context
   */
  setContext(nightlord, shifting) {
    this.selectedNightlord = nightlord;
    this.selectedShifting = shifting;
    this.observations = [];

    const isGH = shifting === GH_SHIFTING_LABEL;
    const isUnknown = nightlord === UNKNOWN_NIGHTLORD;
    const sourceData = isGH ? this.dfGh : this.dfBase;

    if (isGH) {
      if (isUnknown) {
        this.baseCandidates = [...sourceData];
      } else {
        this.baseCandidates = sourceData.filter(
          (row) => row.Nightlord === nightlord
        );
      }
    } else {
      if (isUnknown) {
        this.baseCandidates = sourceData.filter(
          (row) => row["Shifting Earth"] === shifting
        );
      } else {
        this.baseCandidates = sourceData.filter(
          (row) =>
            row.Nightlord === nightlord && row["Shifting Earth"] === shifting
        );
      }
    }

    this.recompute();
  }

  /**
   * Add a new observation (column + value) and re-filter
   */
  addObservation(col, val) {
    if (!col || !val || val === "—") return;
    this.observations.push({ col, val });
    this.recompute();
  }

  /**
   * Remove an observation by index
   */
  removeObservation(index) {
    if (index >= 0 && index < this.observations.length) {
      this.observations.splice(index, 1);
      this.recompute();
    }
  }

  /**
   * Undo the most recent observation
   */
  undoLastObservation() {
    if (this.observations.length > 0) {
      this.observations.pop();
      this.recompute();
    }
  }

  /**
   * Clear all observations
   */
  clearObservations() {
    this.observations = [];
    this.recompute();
  }

  /**
   * Recompute remaining candidates from the base set through the observation chain
   */
  recompute() {
    let current = [...this.baseCandidates];
    for (const obs of this.observations) {
      current = current.filter((row) => row[obs.col] === obs.val);
    }
    this.filteredCandidates = current;
  }

  /**
   * Get remaining candidate count
   */
  getCandidateCount() {
    return this.filteredCandidates.length;
  }

  /**
   * Check if uniquely identified
   */
  isResolved() {
    return this.filteredCandidates.length === 1;
  }

  /**
   * Check if a contradiction occurred (0 candidates remaining)
   */
  isContradiction() {
    return (
      this.filteredCandidates.length === 0 && this.baseCandidates.length > 0
    );
  }

  /**
   * Get the single resolved seed row
   */
  getResolvedSeed() {
    return this.isResolved() ? this.filteredCandidates[0] : null;
  }

  /**
   * Get unique available values and their match counts for a specific POI column
   */
  getAvailableOptionsForCol(col) {
    if (!col || this.filteredCandidates.length === 0) return [];

    const counts = new Map();
    for (const row of this.filteredCandidates) {
      const val = (row[col] || "").trim();
      if (val) {
        counts.set(val, (counts.get(val) || 0) + 1);
      }
    }

    const result = Array.from(counts.entries()).map(([value, count]) => ({
      value,
      count,
    }));

    // Sort alphabetically by value
    return result.sort((a, b) => a.value.localeCompare(b.value));
  }

  /**
   * Get unique spawn points present in current candidates
   */
  getAvailableSpawnPoints() {
    const spawns = new Set();
    for (const row of this.filteredCandidates) {
      const val = (row["Spawn Point"] || "").trim();
      if (val) {
        spawns.add(val);
      }
    }
    return Array.from(spawns);
  }

  /**
   * Get current value or candidate summary for tracked seed info fields
   */
  getSeedInfoSummary() {
    const isGH = this.selectedShifting === GH_SHIFTING_LABEL;
    const trackedCols = isGH
      ? [...FILTER_COLS, ...GH_ONLY_FILTER_COLS]
      : [...FILTER_COLS, "Scale-Bearing Merchant"];

    const summary = {};
    const n = this.filteredCandidates.length;

    // Nightlord display
    if (n === 1) {
      summary["Nightlord"] = {
        value: this.filteredCandidates[0]["Nightlord"],
        confirmed: true,
      };
    } else if (this.selectedNightlord === UNKNOWN_NIGHTLORD && n > 0) {
      const nightlords = [
        ...new Set(this.filteredCandidates.map((r) => r.Nightlord)),
      ];
      summary["Nightlord"] = {
        value:
          nightlords.length === 1
            ? nightlords[0]
            : `${nightlords.length} possibilities`,
        confirmed: nightlords.length === 1,
      };
    } else {
      summary["Nightlord"] = {
        value: this.selectedNightlord || "—",
        confirmed: true,
      };
    }

    // Spawn Point
    const spawns = this.getAvailableSpawnPoints();
    if (spawns.length === 1) {
      summary["Spawn Point"] = { value: spawns[0], confirmed: true };
    } else if (spawns.length > 1) {
      summary["Spawn Point"] = {
        value: `${spawns.length} possible`,
        confirmed: false,
      };
    } else {
      summary["Spawn Point"] = { value: "—", confirmed: false };
    }

    // Other tracked columns
    for (const col of trackedCols) {
      if (n === 1) {
        summary[col] = {
          value: this.filteredCandidates[0][col] || "—",
          confirmed: true,
        };
      } else if (n > 1) {
        const uniqueVals = [
          ...new Set(
            this.filteredCandidates
              .map((r) => (r[col] || "").trim())
              .filter(Boolean)
          ),
        ];
        if (uniqueVals.length === 1) {
          summary[col] = { value: uniqueVals[0], confirmed: true };
        } else if (uniqueVals.length > 1) {
          summary[col] = {
            value: `${uniqueVals.length} possibilities`,
            confirmed: false,
          };
        } else {
          summary[col] = { value: "—", confirmed: false };
        }
      } else {
        summary[col] = { value: "—", confirmed: false };
      }
    }

    return summary;
  }
}

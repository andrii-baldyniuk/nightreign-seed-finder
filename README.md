# Elden Ring: Nightreign — Seed Finder (Web / GitHub Pages)

An interactive, responsive client-side web application designed to identify the exact hidden seed in an **Elden Ring: Nightreign** run within the first few minutes of gameplay.

Knowing your seed early reveals the full 3-day map layout: spawn points, Night 1 and Night 2 boss locations, night circles, evergaols, major and minor bases, field bosses, merchants, and special events.

---

## Features

- **Zero-Build, Pure Web Architecture**: Runs entirely client-side in the browser. Zero dependencies, no Node/npm compilation required.
- **Ready for GitHub Pages**: Simply push this repository to GitHub, enable GitHub Pages, and share the link with anyone on PC, Mac, tablet, or phone.
- **PWA Ready**: Can be installed to desktop or mobile home screens as a standalone companion app (great for 2nd monitors or phones beside your keyboard).
- **Interactive Pan & Zoom Map**:
  - Smooth mouse wheel zoom, click-and-drag panning, and mobile pinch-to-zoom.
  - Pixel-perfect marker overlay for Spawn Points, Minor Bases, Major Bases, Field Bosses, and Evergaols.
- **Smart POI Deductive Filtering**:
  - Clicking any map marker opens an in-place selector displaying only valid remaining options present in the candidate seed set, along with candidate counts for each choice.
  - Instant recalculation of candidate pool in `< 1ms`.
- **1-Click Undo & Contradiction Protection**:
  - Active observations are tracked in an interactive drawer with one-click removal `[✕]` and `Ctrl+Z` undo support.
  - Automatic detection of conflicting observations with a 1-click rollback button.
- **Seed Resolution & Smart Image Fallback**:
  - Once exactly one candidate remains, the app reveals all hidden expedition details.
  - Displays the resolved high-resolution overview map image. Checks locally first (`images/patterns_by_nightlord/`), with an automatic online fallback to the upstream repository so your GitHub repo stays under 10 MB.

---

## Getting Started

### 1. Running Locally

You can run the web app locally using Python's built-in HTTP server:

```bash
# In the repository root:
python3 -m http.server 8000
```

Then open your browser to [http://localhost:8000](http://localhost:8000).

### 2. Deploying to GitHub Pages

1. Push this directory to your GitHub repository (e.g., `main` branch).
2. Go to **Settings** > **Pages** in your GitHub repository.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch) / `/ (root)`
4. Click **Save**. Within 1–2 minutes, your Seed Finder will be live at:
   `https://<your-username>.github.io/<repo-name>/`

---

## Project Structure

```text
seed-finder-app/
├── index.html                    # Main Single Page Application
├── manifest.json                 # PWA configuration
├── css/
│   └── style.css                 # Dark Elden Ring aesthetic, responsive layout
├── js/
│   ├── app.js                    # Application orchestrator & lifecycle
│   ├── engine.js                 # Candidate filtering & deduction logic
│   ├── map-viewer.js             # Pan/zoom canvas & SVG marker overlay
│   └── ui.js                     # Step 1 selection & Step 2 observation sidebar
├── data/
│   ├── patterns_base.json        # Compiled base map seed data (440 seeds)
│   ├── patterns_gh.json          # Compiled Great Hollow seed data (80 seeds)
│   ├── map_patterns_base.csv     # Source CSV
│   └── map_patterns_gh.csv       # Source CSV
├── coordinates/
│   ├── basic_layout.json         # Default map POI pixel coordinates
│   ├── crater_layout.json        # Crater variant coordinates
│   ├── great_hollow_layout.json  # Great Hollow coordinates
│   ├── mountaintop_layout.json   # Mountaintop coordinates
│   ├── noklateo_layout.json      # Noklateo coordinates
│   └── rotted_woods_layout.json  # Rotted Woods coordinates
├── images/
│   ├── icons_nightlord/          # Nightlord portraits
│   ├── icons_shifting_earth/     # Event icons
│   └── patterns_blank/           # Blank map backgrounds
└── scripts/
    └── prepare_data.py           # Utility to compile CSVs to JSON
```

---

## Offline Seed Maps Pack (Optional)

By default, when a seed is uniquely resolved, the app streams that specific seed's overview map on-demand from the online CDN. 

If you want **100% offline access** to all 518 full-resolution seed maps without internet access:
1. Place the seed map images into `images/patterns_by_nightlord/<nightlord_lower>/<seed_id_3digit>.jpg`.
2. The app will automatically detect and prioritize local files over the network fallback.

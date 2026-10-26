# Elden Ring: Nightreign — Seed Finder

A fast, interactive map companion for **Elden Ring: Nightreign** that identifies your expedition's hidden seed in the first 2–3 minutes of gameplay. 

Knowing your seed early reveals the entire 3-day layout before the first circle closes:
- **Night 1 & Night 2 Bosses** and their exact locations
- **Safe Night Circles** for Day 1 and Day 2
- **Evergaols, Field Bosses, and Castles**
- **Merchants** (Town, Scale-Bearing, and Legendary)
- **Special Events & Invasions**

---

## 🎮 Launch the App

👉 **[Launch Live Web App](https://andrii-baldyniuk.github.io/nightreign-seed-finder/)**  
*(Works on PC, second monitor, tablet, or mobile phone. No download or install required.)*

---

## 📖 How to Use (3-Minute In-Game Routine)

### 1. Set Your Run Context
At the start of your run, open the tool and select:
- **Nightlord**: Choose your target boss (or select **Unknown** if playing blind).
- **Shifting Earth**: Select the active map variant (*Default*, *Crater*, *Mountaintop*, *Rotted Woods*, *Noklateo*, or *Great Hollow*).
- Click **Start Seed Discovery**.

### 2. Enter 1–3 Observations
As your squad drops in and explores the map:
1. **Click your Spawn Point**: Look for the amber triangle pins (`▼`) on the map. Clicking your spawn point instantly eliminates **~80–90%** of candidate seeds!
2. **Check a nearby POI**: As you ride toward your first objective, check what spawned at a nearby Minor Base, Major Base, Evergaol, or Field Boss.
3. **Click the POI Marker**: A popup will show **only the remaining possibilities** for that spot, along with how many candidate seeds match each option (e.g. `Ruins - Perfumer (2 seeds)`).
4. Select what you see. The candidate counter in the top bar will update instantly.

### 3. Seed Resolved!
As soon as the counter hits **1 candidate**:
- The full expedition report unlocks on the left sidebar (Night Bosses, Circles, Castle, Events).
- The map automatically reveals the complete high-resolution expedition overview layout.
- You can freely toggle between the **Resolved Seed Map** and the **Interactive Pin Map**.

---

## 🌟 Key Features

* **Zero Latency (< 1ms)**: All deduction calculations run directly on your device memory. Recalculates across all seeds instantly.
* **Smart Deduction Metrics**: Each marker dropdown lists the exact count of remaining seeds for every possible choice, helping your squad prioritize which POI gives the fastest deduction.
* **Interactive Pan & Zoom**:
  - **Mouse Wheel**: Smooth zoom centered on your cursor.
  - **Click & Drag**: Pan across dense map clusters.
  - **Touch / Pinch**: Full pinch-to-zoom support on tablets and smartphones.
  - **Fit View Button (`⟲`)**: Resets zoom to fit your screen with one click.
* **1-Click Undo & Contradiction Protection**:
  - Misidentified a mob or boss? Open the **Active Observations** list and click `✕` on any observation to cancel it without restarting.
  - Press `Ctrl + Z` (or `Cmd + Z` on Mac) to undo the last action.
  - If a combination yields 0 seeds, a **Contradiction Alert** pops up with a 1-click rollback button.
* **Quick Select Sidebar**: Prefer using the keyboard over clicking the map? Use the **Quick Select POI** dropdown to search and select locations by name.

---

## 📱 Use as a Companion App (Second Monitor or Phone)

This app is a **Progressive Web App (PWA)**, meaning you can install it as a standalone, borderless companion app:

* **On PC (Chrome / Edge)**: Click the **Install** icon in the URL bar. It opens in its own borderless window with an Elden Ring taskbar icon—perfect for a second monitor while playing.
* **On iPhone / iPad (Safari)**: Tap the **Share** button → **Add to Home Screen**.
* **On Android (Chrome)**: Tap the three dots menu `⋮` → **Install app** or **Add to Home screen**.

---

## 💻 Running Locally Offline

If you want to use the seed finder completely offline (e.g., without an internet connection or on Steam Deck in offline mode):

### 1. Run the local server
Clone or download this repository, open a terminal in the folder, and run:

```bash
# Using Python (built-in on Linux/macOS, available on Windows):
python3 -m http.server 8000
```

Then visit **`http://localhost:8000`** in any web browser.

### 2. Full Offline Map Pack (Optional)
When online, the app automatically streams the high-resolution resolved seed maps on-demand from the web CDN. 

If you want **100% offline access** to all full-resolution seed maps without internet:
1. Place the resolved map images into `images/patterns_by_nightlord/<nightlord_lower>/<seed_id_3digit>.jpg`.
2. The app will automatically detect and load your local images first.

---

## ⌨️ Shortcuts & Controls

| Shortcut / Control | Action |
| :--- | :--- |
| **Scroll Wheel** | Zoom map in / out at cursor position |
| **Click & Drag** | Pan across map |
| **`+` / `−` Buttons** | Zoom in / out |
| **`⟲` Button** | Reset zoom & center map |
| **`Ctrl + Z` / `Cmd + Z`** | Undo last observation |
| **`Esc`** | Close open location dropdown |
| **`✕` on Observation** | Remove specific filter from active list |

---

## 📜 Credits & Data Sources

- Seed patterns and map data sourced from the Elden Ring Nightreign community research and pattern archives.
- Seed layout map viewer and deductive engine developed for community expedition routing.

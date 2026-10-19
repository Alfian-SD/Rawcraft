# RawCraft Client — Built-in Fabric Mod (Minecraft 26.2)

RawCraft Client is the official, high-performance companion client mod integrated into the RawCraft Launcher for Minecraft 26.2 (Fabric). It provides real-time telemetry HUD widgets, visual & gameplay enhancements, automated performance tuning, and an interactive HUD Studio drag-and-drop editor.

---

## 1. Quick Start

### Build
Compile the Java sources and bundle the production mod jar:
```bash
node scripts/build-client.mjs
```
The compiled jar will be packaged to:
- `rawcraft-client/build/libs/rawcraft-client-1.0.0.jar`
- `raw-client/rawcraft-client.jar` (Launcher deployment artifact)
- `instances/prof-9021/mods/rawcraft-client.jar` (Active development instance)

### Run
Launch the RawCraft Launcher development environment:
```bash
npm run dev
```
Or launch a test instance directly with the verification harness:
```bash
node scripts/launch-game.mjs
```

---

## 2. Default Keybinds

| Key | Action | Description |
|-----|--------|-------------|
| **Right Shift** | **Open Client Menu** | Opens the Dark Purple UI shell (Home, Performance, HUD, Modules, Settings). |
| **Esc** | **Close Menu / Editor** | Closes the open client screen and saves configuration. |
| **Ctrl + Z** | **Undo HUD Move** | Reverts the last widget drag or scale action in HUD Studio. |
| **Arrow Keys** | **Nudge Widget** | Nudges the selected widget by 1 pixel in HUD Studio. |
| **Shift + Arrows**| **Fast Nudge** | Nudges the selected widget by 5 pixels in HUD Studio. |

*Note: All keybindings can be remapped under the **Settings** tab in the client menu.*

---

## 3. Feature Inventory

### 3.1. Telemetry HUD Widgets
All widgets can be positioned via 9 screen anchors (`TOP_LEFT`, `TOP_CENTER`, `TOP_RIGHT`, `MIDDLE_LEFT`, `CENTER`, `MIDDLE_RIGHT`, `BOTTOM_LEFT`, `BOTTOM_CENTER`, `BOTTOM_RIGHT`) with sub-pixel alignment:
1. **FPS Counter:** Real-time frame rate with dynamic color thresholds (Green >60, Yellow 30–59, Red <30).
2. **Ping / Latency:** Real-time network round-trip latency to the current server (shows `— (SP)` in singleplayer).
3. **XYZ Coordinates:** Player block position with sub-decimal precision and facing direction (e.g. `South (+Z)`).
4. **Keystrokes Display:** Visual layout for movement keys (W, A, S, D) and mouse buttons (LMB, RMB) with active press color highlights.
5. **CPS Counter:** Left and right click-per-second tracker using rolling sliding window (configurable 0.5s–3.0s).
6. **Active Potion Effects:** Real-time status display of applied mob effects with duration countdown and flashing warning for expiring effects (<10s).
7. **Armor Durability:** Equipped armor inventory slots (Helmet, Chestplate, Leggings, Boots) with damage bars and percentage durability indicators.
8. **Custom Crosshair:** Replaces vanilla crosshair with customizable styles (`plus_gap`, `dot`, `cross`, `circle`) with live color picker and opacity.

### 3.2. Gameplay Modules
- **Fullbright (Gamma Boost):** Direct override of the ambient lightmap pipeline (`LightmapRenderStateExtractor.extract`). Illuminates caves and dark areas without tampering with vanilla `options.txt`.
- **Toggle Sprint & Auto Run:** Persistent sprint toggle adhering to vanilla mechanics (stops on hunger ≤ 6, hitting walls, or entering water). Auto-run lock for long-distance travel.
- **Weather Precipitation Mute:** Visual cancellation of rain and snow rendering without interfering with world weather cycles or server sync.

### 3.3. Performance Profiles
Instant, one-click performance presets that mutate Minecraft's vanilla options directly:
- **Low:** Render distance 6 chunks, simulation distance 5, clouds off, minimal particles, entity shadows off.
- **Balanced:** Render distance 10 chunks, simulation distance 8, clouds fast, decreased particles, entity shadows off.
- **Quality:** Render distance 16 chunks, simulation distance 12, fancy clouds, all particles, entity shadows on.
- **Custom:** Automatically engaged whenever manual adjustments are made to video sliders.
- **Vanilla Restore:** Reverts settings to the exact snapshot recorded upon initial mod launch (`config/rawcraft/vanilla-options-snapshot.json`).

### 3.4. Interactive HUD Studio Editor
- Full-screen live world editor (`HudEditorScreen`).
- Interactive mouse dragging with 4px margin and center axis snapping.
- Visual anchor guides and selected widget bounding boxes with drag handles.
- Bottom Inspector Bar displaying widget name, current anchor, and scale slider (0.5x–2.0x).
- Right-click context menu for quick module toggles and layer reordering.

---

## 4. Diagnostics & In-Game Commands

- `/rawcraft diag` — Prints the status of all registered modules, HUD widget anchors, active performance profiles, and memory telemetry into chat and `latest.log`.
- `/rawcraft reset confirm` — Restores all client configurations to factory defaults after requiring user confirmation.

---

## 5. Configuration & Persistence

Configuration is stored in:
`instances/<profile>/config/rawcraft/client.json`

Key architectural safeguards:
- **Atomic File Writing:** Writes to a `.tmp` file and replaces the destination atomically to prevent corrupt files from crashes.
- **Automatic Recovery:** If a file is malformed or corrupted, it is automatically archived to `.corrupted.<timestamp>.bak` and clean defaults are restored with an on-screen toast notification.
- **Debounced Saving:** 500 ms debounced disk writes prevent storage thrashing during slider interactions, with an immediate flush on JVM shutdown.

---

## 6. Troubleshooting

1. **Menu doesn't open when pressing Right Shift:**
   - Verify that your keyboard layout sends standard GLFW keycode 344. If remapped, you can reset the keybind by running `/rawcraft reset confirm` or editing `config/rawcraft/client.json`.
2. **HUD widgets disappear when pressing F3:**
   - This is intended behavior (`hud.hideOnF3: true`) to keep the F3 debug screen readable. This can be disabled in the Settings tab.
3. **Sodium / Iris Shader Compatibility:**
   - RawCraft Client is designed to inject at clean render state extraction points and avoids direct OpenGL state pipeline conflicts. Ensure you are using Sodium 0.6+ and Iris 1.8+ for Minecraft 26.2.

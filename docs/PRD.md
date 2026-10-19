# PRD: RawCraft Launcher (Real Execution + Modrinth Edition)

## 1. Core Architecture
- **Frontend**: React 19 + TypeScript + Vanilla CSS (`rawblock-DESIGN.md`).
- **Desktop Backend**: Backend engine powered by Minecraft installation/launching libraries and direct Modrinth API integration.
- **File Routing per Instance (`/instances/<profile-id>/`)**:
  - `mods/` -> `.jar` files (from Modrinth `project_type:mod`).
  - `resourcepacks/` -> `.zip` files (from Modrinth `project_type:resourcepack`).
  - `shaderpacks/` -> `.zip` files (from Modrinth `project_type:shader`).
  - Modpacks (`project_type:modpack`) download `.mrpack` archives, parse `modrinth.index.json`, and batch-download all listed files into their target paths.

## 2. User Flow (Screen-by-Screen)
- **Header Bar**:
  - Displays "RAWCRAFT // ENGINE", Auth Mode toggle (`OFFLINE [SK-MODE]` vs `MICROSOFT`), Username input, and a live Download Progress bar in pure ASCII (`[██████░░░░] 64%`).
- **Left Column (01 // INSTANCES)**:
  - Filter Chips (`ALL`, `VANILLA`, `FABRIC`, `NEOFORGE`, `FORGE`).
  - Selectable list of local instances stored on disk.
  - `+ NEW INSTANCE` and `DELETE INSTANCE` buttons.
- **Center Column (02 // WORKSPACE TABS)**:
  - Top tab bar using Filter Chips to switch between two views:
    1. `[TAB A: ENGINE & LOCAL FILES]`:
       - Select Loader (`VANILLA`, `FABRIC`, `QUILT`, `NEOFORGE`, `FORGE`) via circular 20x20px Radio Buttons and Minecraft Version (`1.21.4`, `1.20.1`, etc.).
       - Set Max RAM (`-Xmx`) and custom JVM flags.
       - Local file checklist with sub-filters (`MODS`, `RESOURCEPACKS`, `SHADERPACKS`). Checking/unchecking a 20x20px square Checkbox renames the file on disk between `<name>.jar` and `<name>.jar.disabled`.
    2. `[TAB B: MODRINTH REPOSITORY]`:
       - Search input (`Space Mono` 15px) + Category Filter Chips: `MOD`, `MODPACK`, `RESOURCEPACK`, `SHADER`.
       - Automatically scopes Modrinth search facets to the active instance's `gameVersion` and `loader` (when searching Mods/Modpacks).
       - Text-only results list (NO icons/thumbnails): shows Title (`Archivo Black`), Author, Download Count, Version tag, and a `[+ INSTALL]` button.
       - Clicking `[+ INSTALL]` downloads the primary file from Modrinth directly into the active instance's corresponding subfolder (`mods/`, `resourcepacks/`, or `shaderpacks/`) and marks the Status Chip as `INSTALLED` (`#008000`).
- **Right Column (03 // EXECUTION & STDOUT)**:
  - Live Download & Verification Telemetry (tracks asset/library/Java download progress).
  - Live `STDOUT` / `STDERR` console streaming real lines from the spawned Minecraft JVM process.
  - Primary `EXECUTE // LAUNCH` button (verifies/downloads missing game files, then spawns the game).

## 3. Rules & Edge Cases
- **Modrinth User-Agent Requirement**: Every request to `https://api.modrinth.com/v2` MUST include a custom `User-Agent` header (`RawCraftLauncher/1.0.0 (github.com/rawcraft)`), or Modrinth will return HTTP 403/400.
- **Vanilla Guardrail**: If the active instance uses `VANILLA`, selecting `MOD` or `MODPACK` in the Modrinth tab displays a warning banner (`#FFA500` border): "SWITCH ENGINE TO FABRIC/NEOFORGE TO INSTALL MODS." Resource Packs and Shaders remain enabled.
- **No Decorative Images**: Strip `icon_url` from Modrinth API responses. Never render `<img>` tags in the UI.

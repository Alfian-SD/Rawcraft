# AGENTS.md — RawCraft Real Launcher + Modrinth Rules

## 1. Tech Stack & Responsibilities
- **Frontend (`src/`)**: React 19 + TypeScript + Vanilla CSS (`src/index.css`).
- **Backend / Services**: Local execution runtime & Modrinth API client.
- **Modrinth API (`src/api/modrinth.ts`)**: Uses `https://api.modrinth.com/v2`. Always send header `'User-Agent': 'RawCraftLauncher/1.0.0'`.

## 2. Non-Negotiable Visual Rules (RawCraft Design System from DESIGN.md)
Design language: RawCraft authentic voxel & gaming identity — Deep Slate / Sky Navy surfaces, Night Charcoal cards, Acid Lime 3D tactile buttons, and clean blocky typography. Full motion & animation spec in `DESIGN.md`. Tokens live in `src/index.css` `:root`.

- Surfaces: `#242A3B` (Deep Slate / Sky Navy) canvas, `#1B2030` (Night Charcoal) for card surfaces, drawer modals, and telemetry containers. Borders are `1px solid #3A4260`; hover/active borders use `#505A80`.
- Text: `#F7F8F0` primary (Warm Parchment), `#AAB0C4` muted slate, `#727789` faint — high contrast and readability on dark surfaces.
- Accent: RawCraft Acid Lime (`#B7F34A`) with dark text (`#242A3B`). Secondary accents include Campfire Orange (`#FFBD69`) for badges and Enchanted Violet (`#A78BFA`) for focus rings and highlight chips.
- Tactile 3D Buttons: Buttons have physical gaming depth (`box-shadow: 0 4px 0 #7FB11F`, hover `-2px / 6px`, active `translateY(3px)` with `box-shadow: 0 1px 0 #7FB11F`). Never replace with flat or blurry shadows.
- `border-radius`: `8px` for badges/controls (`--r-sm`), `14px` for cards/buttons (`--r-md`), `22px` for major containers (`--r-lg`), `999px` for status pills.
- Typography: `"Trebuchet MS", "Segoe UI", system-ui, sans-serif` for headings and controls (display headings weight 700/800, tight line-height `1.08`, `letter-spacing: -0.025em`). `JetBrains Mono` for numbers, telemetry, and logs.
- DO NOT render `<img />` tags for Modrinth project icons or gallery screenshots. Rule #9 forbids decorative images and icons — use a `mod-card-icon` text block instead.
- Disabled states must use `#3A4260` borders and `#151926` fills with `#727789` text—NEVER CSS `opacity`.
- Focus outlines use `3px solid #A78BFA` with `2px` offset. No `backdrop-filter` blur.

## 3. Modrinth Facet Mapping
When querying `GET https://api.modrinth.com/v2/search`:
- Mods: `facets=[["project_type:mod"],["versions:<gameVersion>"],["categories:<loaderLower>"]]`
- Modpacks: `facets=[["project_type:modpack"],["versions:<gameVersion>"],["categories:<loaderLower>"]]`
- Texture/Resource Packs: `facets=[["project_type:resourcepack"],["versions:<gameVersion>"]]`
- Shaders: `facets=[["project_type:shader"],["versions:<gameVersion>"]]`

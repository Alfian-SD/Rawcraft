# AGENTS.md — RawCraft Real Launcher + Modrinth Rules

## 1. Tech Stack & Responsibilities
- **Frontend (`src/`)**: React 19 + TypeScript + Vanilla CSS (`src/index.css`).
- **Backend / Services**: Local execution runtime & Modrinth API client.
- **Modrinth API (`src/api/modrinth.ts`)**: Uses `https://api.modrinth.com/v2`. Always send header `'User-Agent': 'RawCraftLauncher/1.0.0'`.

## 2. Non-Negotiable Visual Rules (`rawblock-DESIGN.md`)
- `border-radius: 0px` on EVERY element (only exception: `.raw-radio` is `50%`).
- `box-shadow: none` everywhere. Hierarchy = `1px`, `3px`, and `5px` solid `#000000` borders.
- DO NOT render `<img />` tags for Modrinth project icons or gallery screenshots. Rule #9 forbids decorative images and icons.
- Disabled states must use `#CCCCCC` borders and `#F5F5F5` fills—NEVER CSS `opacity`.

## 3. Modrinth Facet Mapping
When querying `GET https://api.modrinth.com/v2/search`:
- Mods: `facets=[["project_type:mod"],["versions:<gameVersion>"],["categories:<loaderLower>"]]`
- Modpacks: `facets=[["project_type:modpack"],["versions:<gameVersion>"],["categories:<loaderLower>"]]`
- Texture/Resource Packs: `facets=[["project_type:resourcepack"],["versions:<gameVersion>"]]`
- Shaders: `facets=[["project_type:shader"],["versions:<gameVersion>"]]`

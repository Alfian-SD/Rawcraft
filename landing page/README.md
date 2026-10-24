# RawCraft landing page

Static site: vanilla HTML, CSS and JavaScript. No build step.

## Run locally
Open `index.html`, or serve the folder: `python3 -m http.server 8080` then visit http://localhost:8080.

## Set the real download
Edit `js/config.js` only. Fill `url` (https), `version`, `size`, `date`, `sha256` with real release data.
While `url` is empty the page shows "Coming soon". Never enter placeholder values.

## Customize & Design System
Read [DESIGN.md](file:///C:/Users/pc/Downloads/rawcraft-landing/DESIGN.md) before making visual or structural changes. It outlines the design system, color palette, block aesthetic, and strict AI guardrails.
Colors, radii, type sizes: `css/variables.css`. Layout and components: `css/main.css`.
Feature status tags: `data-status="planned"` in `index.html`. Remove the tag when a feature ships.

## Deploy
Upload the folder to any static host (GitHub Pages, Netlify, Cloudflare Pages).

## Test
Check widths 320, 375, 768, 1024, 1440 with no horizontal scroll; keyboard-tab through nav, tabs, FAQ; enable reduced motion in your OS and confirm no movement.

## Needs real application data
- Installer URL, version, size, date, checksum.
- Confirm which features exist (version management, preferences, Modrinth mod installation, and Fabric/Quilt/Forge/NeoForge loaders are marked live; library profiles and updates are marked planned).
- Confirm supported Windows versions, update behavior and troubleshooting in the FAQ.
- Social, docs and support links (none are included).
- Real launcher screenshots to replace or complement the demo mockup.

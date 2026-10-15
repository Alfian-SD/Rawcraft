# AGENTS.md — RawCraft Project Rules

## Tech Stack
- Framework: React 19 + TypeScript + Vite
- Styling: Vanilla CSS ONLY (`src/index.css`). Do NOT install Tailwind, Bootstrap, or any UI component library.
- Icons: Do NOT install `lucide-react` or any icon library. Use raw text, ASCII symbols (`//`, `[X]`, `+`), and typography only.
- State/Storage: React state synced to `localStorage` key `rawcraft_profiles_v1` (with clean adapter functions ready for Tauri `plugin-fs`).

## Strict Design System Rules (Read `rawblock-DESIGN.md` before writing UI)
1. NEVER use `border-radius` (must be `0px` everywhere, except `.radio-btn` which is `50%`).
2. NEVER use `box-shadow`, `linear-gradient`, `backdrop-filter`, or `opacity` for disabled states.
3. Load Google Fonts in `index.html`: `Archivo Black`, `Work Sans` (400, 600), and `Space Mono` (400).
4. Use only exact hex codes from `rawblock-DESIGN.md`: `#000000`, `#FFFFFF`, `#F0F0F0`, `#E8E8E8`, `#F5F5F5`, `#CCCCCC`, `#0000FF`, `#008000`, `#FFA500`, `#FF0000`.
5. Input focus states must change border width from `3px solid #000000` to `5px solid #000000` with `outline: none`.

## Architecture & Guardrails ("Don't Touch")
- Keep all data types in `src/types/launcher.ts`.
- Keep command generation pure and isolated in `src/utils/buildCommand.ts`.
- Do NOT modify existing working components when asked to build a new column unless wiring props in `App.tsx`.
- Commit-ready output: Never leave placeholder `// TODO` comments in code you generate.

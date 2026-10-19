# RawCraft Launcher & Built-in Client

A modern, high-performance Minecraft launcher with an integrated built-in Fabric client mod for Minecraft 26.2.

---

## 1. Project Structure

- **`src/`** — React 19 + TypeScript + Vanilla CSS frontend following the RawBlock design system (`border-radius: 0px`, solid borders, zero decorative icons).
- **`server/`** — Local execution runtime, asset manager, mod loader profile manager, and Modrinth API client (`v2`).
- **`rawcraft-client/`** — Built-in companion Fabric mod for Minecraft 26.2 providing 8 HUD telemetry widgets, Fullbright, ToggleSprint, Performance Profiles, and an interactive HUD Studio drag-and-drop editor.
- **`docs/`** — Architectural and QA documentation:
  - [`docs/RAWCRAFT_CLIENT_PRD.md`](file:///C:/Users/pc/Documents/Project-Rawcraft/docs/RAWCRAFT_CLIENT_PRD.md) — Feature PRD and specifications.
  - [`docs/AUDIT.md`](file:///C:/Users/pc/Documents/Project-Rawcraft/docs/AUDIT.md) — Root cause analysis and audit of previous issues.
  - [`docs/DECISIONS.md`](file:///C:/Users/pc/Documents/Project-Rawcraft/docs/DECISIONS.md) — Architecture Decision Records (ADRs 01–05).
  - [`docs/QA_REPORT.md`](file:///C:/Users/pc/Documents/Project-Rawcraft/docs/QA_REPORT.md) — Comprehensive QA checklist and live game test results.
  - [`docs/screenshots/`](file:///C:/Users/pc/Documents/Project-Rawcraft/docs/screenshots/) — Captured in-game screenshots and verification artifacts.

---

## 2. Getting Started

### Install Dependencies
```bash
npm install
```

### Build Client Mod
```bash
node scripts/build-client.mjs
```

### Run Launcher
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

---

## 3. RawCraft Client (Minecraft 26.2 Fabric)

Refer to [`rawcraft-client/README.md`](file:///C:/Users/pc/Documents/Project-Rawcraft/rawcraft-client/README.md) for detailed mod documentation, keybinds, feature breakdowns, and troubleshooting.

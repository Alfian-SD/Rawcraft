# RawCraft Design System — Motion & Animation (`DESIGN.md`)

> **Scope: ALL RawCraft surfaces** — launcher (`src/`), landing page (`landing page/`), client HUD, docs mockups.
> `landing page/DESIGN.md` remains the landing-page visual spec (colors, typography, block geometry).
> This file is the **canonical motion spec**. When the two disagree on motion, this file wins.
>
> **NON-NEGOTIABLE**: Every motion defined here must degrade to a static state under
> `@media (prefers-reduced-motion: reduce)` **and** `[data-animations="false"]`.

---

## 1. Motion Tokens

```css
:root {
  /* Easing */
  --ease-out-expo:  cubic-bezier(.22, 1, .36, 1);     /* default for every transition */
  --ease-spring:    cubic-bezier(.34, 1.56, .64, 1);  /* toggles, icon pop, check mark */
  --ease-linear:    linear;                           /* infinite loops only (shimmer, drift) */

  /* Duration scale */
  --dur-instant: 120ms;  /* color / border swaps */
  --dur-fast:    180ms;  /* hover lift, press */
  --dur-base:    250ms;  /* focus ring, panel state */
  --dur-slow:    320ms;  /* toggle knob travel, accent bar grow */
  --dur-enter:   500ms;  /* entrance rise */
  --dur-loop:    1600ms; /* skeleton shimmer */

  /* Stagger */
  --stagger:     80ms;   /* per-child entrance delay */
}
```

**Rules**
- Never use `ease` / `ease-in-out` on interactive state changes. Use `--ease-out-expo`.
- Never animate `width`, `height`, `top`, `left`, `margin`. Animate `transform` and `opacity` only.
- Durations above `500ms` are reserved for ambient loops (clouds, glow, shimmer), never for input feedback.
- Feedback must start within one frame: `transition` on the base element, not added on `:hover`.

---

## 2. Easing Intent

| Easing | Intent | Where |
| :--- | :--- | :--- |
| `--ease-out-expo` | Fast start, soft landing — feels responsive but not snappy | Cards, pills, buttons, drawers, panel borders |
| `--ease-spring` | Slight overshoot — physical, toy-like | Toggle knob, icon pop, check mark, badge appear |
| `--ease-linear` | Constant speed | Shimmer sweep, skeleton, cloud drift, ember rise |

---

## 3. Entrance — `rise`

Every newly mounted surface (panel, card, row, footer) enters with the same gesture. Never fade-only, never slide from the side.

```css
@keyframes rise {
  from { opacity: 0; transform: translateY(14px) scale(.985); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

.enter { animation: rise var(--dur-enter) var(--ease-out-expo) both; }
```

**Stagger order** (delay = index × `--stagger`):

| Element | Delay |
| :--- | :--- |
| Header | `0ms` |
| Filter panel | `60ms` |
| Result cards | `140ms`, `220ms`, `300ms`, … |
| Footer / meta row | `360ms` |

> **Guardrail**: Max 6 staggered children. Beyond that, animate the container only — long chains feel slow, not rich.

---

## 4. Hover & Press Physics

Tactile 3D shelf stays mandatory (see `landing page/DESIGN.md` §2.4). Motion layers on top of it.

```css
/* Liftable surface (card, pill, chip, target badge) */
.hoverable {
  transition: transform var(--dur-fast) var(--ease-out-expo),
              border-color var(--dur-base) ease,
              box-shadow var(--dur-base) ease,
              background var(--dur-base) ease;
}
.hoverable:hover  { transform: translateY(-2px); }
.hoverable:active { transform: translateY(0) scale(.97); }

/* Card scale-up variant */
.card:hover { transform: translateY(-3px); }
```

**Shelf growth (buttons)**

| State | Transform | Shadow |
| :--- | :--- | :--- |
| Rest | `translateY(0)` | `0 3px 0 #7FB11F` |
| Hover | `translateY(-2px)` | `0 5px 0 #7FB11F` |
| Active | `translateY(2px)` | `0 1px 0 #7FB11F` |

> **Guardrail**: Press travel is always *downward* (`translateY` positive) with a *shrinking* shelf. Never scale a button on press without reducing the shelf — it reads as floating, not pressing.
>
> **One button system.** Every action button in the launcher uses the two recipes below — no tab invents its own. Primary = acid-lime gradient `180deg #C5F762 → #B7F34A`, `1px solid #D6FA86`, dark `#242A3B` text at weight 800 / `letter-spacing .06em`, `border-radius 10px`, lime shelf + soft glow. Secondary = `rgba(21,25,38,.9)` fill, `1px solid var(--border)`, `var(--text-muted)` at weight 700 / `.04em`, **no shelf**, hover lifts `-2px` and brightens border only. Destructive = secondary geometry with `#EF4444` border/text. Disabled = `#3A4260` border, `#151926` fill, `#727789` text, no shelf, never `opacity`.


---

## 5. Shimmer Sweep

Light passes across a button **only on hover**, never on idle.

```css
.btn::after {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 45%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  transform: translateX(-120%) skewX(-18deg);
  pointer-events: none;
}
.btn:hover::after { animation: sweep 700ms var(--ease-linear); }

@keyframes sweep {
  from { transform: translateX(-120%) skewX(-18deg); }
  to   { transform: translateX(320%) skewX(-18deg); }
}
```

Requires `overflow: hidden` + `position: relative` on the host. `pointer-events: none` is mandatory.

---

## 6. Skeleton / Loading

```css
.skeleton {
  background: linear-gradient(90deg,
    rgba(32,39,56,.6) 25%, rgba(48,57,80,.85) 50%, rgba(32,39,56,.6) 75%);
  background-size: 220% 100%;
  animation: shimmer var(--dur-loop) var(--ease-linear) infinite,
             rise 400ms var(--ease-out-expo) 380ms both;
}
@keyframes shimmer {
  from { background-position: 220% 0; }
  to   { background-position: -220% 0; }
}
```

Async action buttons use text swap, not spinners: `Pasang` → `Memasang…` → `✓ Terpasang` (check uses `--ease-spring`, `scale(.4) → 1.15 → 1`).

---

## 7. Toggle Switch

```css
.switch { width: 34px; height: 18px; border-radius: 999px; }
.switch::after {
  width: 12px; height: 12px; border-radius: 50%;
  transition: transform var(--dur-slow) var(--ease-spring),
              background var(--dur-base) ease;
}
.toggle.on .switch::after { transform: translateX(16px); background: #B7F34A; }
```

On-state also raises the host border to the accent and adds a soft outer glow. Never animate `justify-content` or `left` — the knob moves by `transform` only.

---

## 8. Focus Ring

```css
:focus-visible {
  outline: 3px solid #A78BFA;
  outline-offset: 2px;
  transition: outline-color var(--dur-base) ease;
}
```

Inputs additionally get `box-shadow: 0 0 0 3px rgba(183,243,74,.16)` on `:focus`. Never suppress `:focus-visible`, never animate `outline-width`.

---

## 9. Ambient Loops

Slow, non-directional, and never in the reading path of body text.

| Loop | Duration | Easing |
| :--- | :--- | :--- |
| Glow orb pulse (`opacity .35 ↔ .65`, `scale 1 ↔ 1.08`) | `7s` | `ease-in-out` |
| Cloud drift (`translateX 0 ↔ 35px`) | `60–90s` | `linear` |
| Star twinkle | `3s` | `ease-in-out` |
| Campfire flame flicker | `100–180ms` | `ease-in-out alternate` |
| Ember rise (`translateY -36px`, fade out) | `2.2s` | `ease-out` |
| Live status dot | `1.8s` | `ease-in-out` |

Ambient loops must be `pointer-events: none` and `aria-hidden="true"`.

---

## 10. Reduced Motion Contract

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}

[data-animations="false"] *,
[data-animations="false"] *::before,
[data-animations="false"] *::after {
  animation: none !important;
  transition: none !important;
}
```

Under reduced motion, entrance elements must render **already at final state** — `animation: ... both` with `0.01ms` achieves this; never leave `opacity: 0` waiting on a disabled animation.

---

## 11. Mod Installer Tab Spec

Mod & addon store backed by the **Modrinth** API. No API key required.

### 11.1 Structure
1. **Header** — `STORE` tag, title `Instalasi Mod & Addon`, target badge `Target <instance> · <loader>` with live dot.
2. **Filter panel** (gradient border wrapper, 4 rows):
   - Kategori: `Mod` / `Modpack` / `Resource Pack` / `Shader`
   - Urutan: `Sedang Trend` / `Paling Populer` / `Baru Diperbarui` / `Paling Relevan`
   - Divider
   - Toggle `Sesuaikan versi instance` + `Versi` select + `Loader` select
   - Search input (icon left) + tactile `Cari` button
3. **Results** — cards with accent bar, loader badges, downloads/follows/author, `Pasang` button.
4. **Footer** — API attribution + source chip.

### 11.2 Accents (only exception to the mineral palette)

| Element | Accent | Card bar |
| :--- | :--- | :--- |
| Modrinth source | `#00AF5C` → `#10C46A` | `#10C46A → #007A40` |
| Sort active | `#FFBD69` → `#FFD08F` | — |

> **Guardrail**: These are third-party brand tints used **only** inside the installer tab. Never leak them into nav, hero, or global tokens.

### 11.3 Card interaction
- Rest: `1px solid #3A4260`, flat gradient surface.
- Hover: `translateY(-3px)`, border `#505A80`, shadow `0 18px 40px rgba(10,14,22,.5)`, left accent bar `scaleY(0) → scaleY(1)` over `--dur-slow`, icon `scale(1.08) rotate(-3deg)`.
- Install: button swaps to `Memasang…` then `✓ Terpasang`; installed state drops the shelf shadow and the shimmer.

### 11.4 Fullscreen surface
The installer is **not** a half-width drawer. `#/store` renders a full-viewport surface over the main stage (nav rail stays visible and shows `Instal Mod` as active).

- Container: `.drawer-overlay-full` + `.drawer-dialog-full` — `width: 100%`, no left border, surface gradient `#202636 → var(--bg-subtle)`.
- Entrance: `drawerFullIn` 240ms `cubic-bezier(.16,1,.3,1)` — `opacity 0→1`, `translateY(12px) scale(.994) → 0 / 1`. No slide from the right (that reads as a drawer, not a page).
- Inner content capped at `max-width: 1240px`, centered, so cards never stretch edge-to-edge on ultrawide.
- Exit: `Esc` and the `✕ TUTUP` button close it; focus trap and `aria-modal` semantics are unchanged.
- Reduced motion: `drawerFullIn` disabled entirely (no fade, no rise).

The `Instal Mod` nav entry is **always** rendered — never gated on an active mod-loader context.

### 11.5 Accessibility
- Pill groups are `role="radiogroup"` with `aria-checked`, arrow-key navigable.
- Toggle is a real `<button role="switch" aria-checked>`.
- Source is always conveyed by **text label**, never color alone.
- Result list announces count via `aria-live="polite"`.

---

## 12. Mod Detail View

Clicking a result card in the installer swaps the results list for an in-place project page modelled on modrinth.com. Data comes from the official Modrinth API (`/project/{id}`, `/project/{id}/version`, `/project/{id}/members`) — no scraping.

### 12.1 Structure
1. **Back** — `.md-back`, chevron + `Kembali ke hasil pencarian`, returns to the results with filters intact (state lives in `ModInstallerTab`, not the detail view).
2. **Header** — 64px letter-mark tile (no `<img>`, Rule #9), title, one-line summary, stat row (downloads, followers, category chips, `Modrinth ↗` chip), tactile `Pasang` button on the right.
3. **Tabs** — `Deskripsi` / `Changelog` / `Versi (n)`.
4. **Body** — rendered Markdown (headings, lists, quotes, fences, inline code, links; images and raw HTML stripped).
5. **Sidebar** (300px, sticky) — Kompatibilitas (version chips, platform loaders, client/server environment), Tautan, Tag, Kreator, Detail (license, published, updated, latest release, file size).

### 12.2 Layout
```css
.md-grid { grid-template-columns: minmax(0, 1fr) 300px; gap: 18px; }
@media (max-width: 900px) { .md-grid { grid-template-columns: minmax(0, 1fr); } .md-side { position: static; } }
```
Version rows collapse from 6 columns to 3 below `900px`; trailing metadata hides rather than wrapping.

### 12.3 Motion
- **Enter**: whole surface reuses `mi-rise` at `--dur-enter` `--ease-out-expo`. No second, different entrance — the swap must feel like one surface.
- **Back**: `translateX(-3px)` + accent color on hover, `--dur-fast`.
- **Tabs**: underline is a `::after` bar, `scaleX(0) → scaleX(1)` over `--dur-base` `--ease-out-expo`. Never animate `width`.
- **Version row**: rest border `#3A4260`; hover border `#505A80`, `translateX(2px)`, `--dur-fast`. Selected row gets an inset accent ring `inset 0 0 0 1px rgba(183,243,74,.18)` — no layout shift.
- **Install buttons**: identical 3D physics to §11 (`0 3px 0` shelf, `translateY(-2px)` hover, `translateY(2px)` press).
- **Chips / links**: `translateY(-1px)` / `translateX(2px)` at `--dur-fast`, color shift to accent.

### 12.4 Behaviour rules
- Default selected version = the one matching `profile.gameVersion` + loader, preferring `release`; falls back to newest. Never default to a snapshot/beta when a compatible release exists.
- Installing from the detail view uses the **explicitly selected** version's primary file — it does not re-resolve "latest compatible".
- Version list caps at 40 rows rendered; total count stays visible in the tab label.
- License falls back `name → id → Custom` (some projects ship an empty `name`).
- `prefers-reduced-motion` disables the entrance and the row nudge; underline and color feedback stay.

---

## 13. Maintenance Gate

Sudden lockout surface. One switch file, two scopes.

### 13.1 Switch file
`public/maintenance.json` — served at `/maintenance.json` in dev **and** copied into `dist/` on build. Edit it on a running install and reload; no rebuild, no redeploy.

```json
{
  "enabled": false,
  "title": "RawCraft sedang dalam perawatan",
  "message": "Kami sedang memperbaiki layanan.",
  "eta": "2026-10-24T23:00:00+07:00",
  "lockedViews": ["STORE", "CONSOLE"]
}
```

| Field | Meaning |
| :--- | :--- |
| `enabled` | `true` locks the **whole launcher**. Wins over `lockedViews`. |
| `lockedViews` | Locks individual tabs while `enabled` is `false`. Values: `HERO` `PROFILES` `CONFIGURE` `MODS` `STORE` `SETTINGS` `CONSOLE` `LOADER`. |
| `title` / `message` | Copy shown on the gate. Blank falls back to the default Indonesian copy. |
| `eta` | Strict ISO-8601 only. Anything else renders no estimate box. |

**Fail-open is mandatory.** Missing file, 404, bad JSON, or unknown view names must resolve to "nothing locked". A broken switch file never bricks the launcher. Re-read on window `focus` so a lock lands without a full reload.

### 13.2 Two scopes
- **App scope** (`.mnt-app`) — `position: fixed; inset: 0; z-index: 9000`, replaces the whole shell. Nav rail, header, and drawer are not rendered at all. `role="dialog"` + `aria-modal="true"`.
- **Tab scope** (`.mnt-tab`) — fills the content slot only, `flex: 1`, `border-radius: var(--radius-lg)`. Nav rail and header stay live so the user can move elsewhere. `role="region"`. Carries a `TAB // <LABEL>` chip naming the locked surface.

Locked tabs also get a `LOCK` badge (`.nav-rail-lock`) in the nav rail, so the state is visible **before** clicking.

### 13.3 Visual
- Surface: same `#202636 → var(--bg-subtle)` gradient as the fullscreen installer, plus a 48px grid `.mnt-backdrop` masked to a radial fade.
- Card: Night Charcoal `rgba(32,39,56,.97) → rgba(27,32,48,.97)`, `1px solid var(--border)`, `--radius-lg`, deep shelf shadow.
- Badge: Campfire Orange `#FFD08F → #FFBD69` pill, dark `#242A3B` text, 6px blinking dot.
- ETA: `JetBrains Mono` in `var(--orange)`.
- Footer: `ERR_SVC_MAINTENANCE` in `var(--error)` at 85% opacity — reads as a diagnostic code, not an alert.
- Primary action reuses the tactile lime shelf (`0 3px 0 #7FB11F`); secondary is a ghost button.

### 13.4 Motion
- Card enters with `mi-rise` at `--dur-enter` `--ease-out-expo`.
- `.mnt-glow` radial breathes on `mntPulse` 5200ms `--ease-linear` (ambient loop, allowed by §9).
- `.mnt-dot` blinks on `mntBlink` 1600ms `--ease-linear`.
- Buttons: `translateY(-2px)` hover, `translateY(2px)` press.
- `prefers-reduced-motion` kills the glow, the blink, and the card entrance. Static page, still legible.

---

## 14. Anti-Patterns

❌ `transition: all` — always name the properties.
❌ Animating `box-shadow` on scroll or on infinite loops (repaint cost).
❌ Bounce or overshoot on text, paragraphs, or anything the user is reading.
❌ Entrance animations longer than `500ms`.
❌ Parallax or drift that moves content under the cursor during text selection.
❌ Idle shimmer on buttons (implies loading when nothing loads).
❌ Motion used as the only signal of state change (color/text must also change).

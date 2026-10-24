# RawCraft Design System & AI Guardrails (`DESIGN.md`)

> **CRITICAL DIRECTIVE FOR AI AGENTS & CONTRIBUTORS:**
> This document specifies the design system, visual identity, and architectural constraints of the RawCraft landing page.
> **DO NOT** install UI frameworks, CSS-in-JS, Tailwind, icon fonts, or build tools.
> **DO NOT** homogenize the layout into generic corporate SaaS templates.
> Every modification to HTML, CSS, and JS MUST adhere strictly to the rules below.

---

## 1. Architectural Principles

1. **Zero Build Step, Zero Dependencies**:
   - The project is strictly vanilla: HTML5, pure CSS3, and vanilla JavaScript (ES5/ES6 compatible).
   - Never add `npm`, `package.json`, Vite, Webpack, Tailwind CSS, Bootstrap, or external JavaScript libraries.
   - Never import external font CDNs (Google Fonts, Adobe Fonts) or icon libraries (FontAwesome, Lucide, Heroicons).
2. **Lightweight & High Performance**:
   - Total uncompressed page weight must remain under 50 KB.
   - All graphics must be inline scalable vectors (`<svg>`), using geometric shapes (rectangles, stepped polygon paths) to maintain the blocky aesthetic.
3. **Encapsulated Scripts**:
   - All JavaScript files must remain self-contained within Immediately Invoked Function Expressions: `(function(){ ... })();`.
   - The only allowed global variable is `window.RAWCRAFT` in [js/config.js](file:///C:/Users/pc/Downloads/rawcraft-landing/js/config.js).

---

## 2. Visual Identity & Design Tokens

All tokens are defined in [css/variables.css](file:///C:/Users/pc/Downloads/rawcraft-landing/css/variables.css). Never hardcode ad-hoc colors or spacing in `main.css`.

### 2.1 Color Palette

| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--primary` | `#B7F34A` | **RawCraft Acid Lime**: Primary call-to-action buttons, active tab indicators, brand accents, brand logo badge. |
| `--dark` | `#242A3B` | **Deep Slate / Sky Navy**: Hero gradient start, dark section backgrounds, high-contrast borders, button text. |
| `--dark-2` | `#1B2030` | **Night Charcoal**: Card surfaces in dark sections, footer, fact sheets. |
| `--light` | `#F7F8F0` | **Warm Parchment / Sand**: Base page background, light sections, card surfaces in light mode. |
| `--violet` | `#A78BFA` | **Enchanted Violet**: Focus outlines (`:focus-visible`), accent feature cards, preview chips. |
| `--orange` | `#FFBD69` | **Campfire / Sunset Orange**: Sun vectors, "Demo" badges, accent feature cards. |
| `--text` | `#202437` | **Primary Body Text**: High-readability dark slate for light sections. |
| `--muted` | `#727789` | **Secondary Muted Text**: Subtitles, metadata, version captions. |

> **Guardrail**: Do NOT introduce generic purple/blue tech gradients, desaturated gray cards, or neon cyan glows. Keep the Minecraft-inspired nature and mineral palette intact.

### 2.2 Typography

```css
--font: "Trebuchet MS", "Segoe UI", system-ui, sans-serif;
--h1: clamp(2.4rem, 7vw + .5rem, 5.2rem);
--h2: clamp(1.7rem, 3.5vw + .5rem, 3rem);
```
- **Display & Headings**: `"Trebuchet MS"`, geometric sans with character, tight line-height (`1.08`), slight negative letter-spacing (`-0.02em`).
- **Body & Controls**: Clean system fallbacks (`"Segoe UI", system-ui, sans-serif`).
- **Code & Checksums**: Monospace (`Consolas, monospace`), size `.8rem`.
- **Fluid Scaling**: Always use `clamp()` for responsive headings to avoid sudden jumps.

### 2.3 Border Radii & Elevation

```css
--r-lg: 22px;   /* Major cards, demo mockups, fact containers */
--r-md: 14px;   /* Play buttons, list items, hero chips */
--r-sm: 8px;    /* Badges, square icons, mini-tags */
--shadow: 0 10px 30px rgba(32, 36, 55, 0.14);
```

### 2.4 Tactile Button Physics (Non-Negotiable)

Buttons in RawCraft are designed with a **tactile 3D press-down effect** reminiscent of gaming UI:
```css
/* Standard Button */
background: var(--primary);
color: var(--dark);
border: 2px solid var(--primary);
box-shadow: 0 4px 0 #7fb11f;     /* 3D bevel bottom shelf */

/* Hover */
transform: translateY(-2px);
box-shadow: 0 6px 0 #7fb11f;

/* Active (Pressed) */
transform: translateY(3px);
box-shadow: 0 1px 0 #7fb11f;
```
> **Guardrail**: Never replace the bevel bottom shelf (`box-shadow: 0 4px 0 ...`) with a generic blurry drop-shadow or a flat pill button.

---

## 3. The Block Aesthetic (Vector & Geometry Rules)

1. **Pixel & Stepped Geometry**:
   - Vector art must use stepped 90-degree polygonal paths (`d="M0 520h140v-60h120v-80..."`) rather than smooth curves.
   - Trees, terrain contours, and suns must be constructed of orthogonal rectangles and squares.
2. **Trademark Separation**:
   - **DO NOT** use official Mojang/Microsoft Minecraft textures, copyrighted mob art (Creepers, Steve, Endermen), or proprietary icons.
   - Everything must remain original, stylized block landscapes representing voxel gaming in an abstract, modern fashion.
3. **Legal Disclaimer**:
   - The footer disclaimer (`Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft...`) is legally required. Never remove or hide it.

---

## 4. Layout & Component Guardrails

### 4.1 Hero Section (`.hero`)
- **Parallax Layers**: Layer elements use `data-depth="..."` attributes. The parallax effect must only execute on devices supporting `hover:hover and pointer:fine` and MUST be disabled when `prefers-reduced-motion` is active.
- **Hero Grid**: 2-column layout (`1.1fr .9fr`) collapsing to `1fr` on screens $\le 900\text{px}$. The floating UI chips (`.hero__ui`) hide on screens $\le 900\text{px}$ to prevent clutter.

### 4.2 Interactive Launcher Preview (`.app`)
- **Window Chrome**: Fixed mock app window with 3 status dots, a centered title, and an orange `Demo` badge.
- **Tablist / Tabpanel**: Must strictly follow the WAI-ARIA tab pattern (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`).
- **Keyboard Navigation**: Arrow keys (`Up/Down/Left/Right`) and `Home/End` must cycle tabs and focus the active panel.
- **Demo Guardrail**: The "Play" button in the demo must always trigger the polite live-region warning: *"This is a website demo. Install RawCraft to play."*

### 4.3 Asymmetrical Bento Feature Grid (`.feat`)
- The grid is deliberately **asymmetrical** across 6 columns (`grid-template-columns: repeat(6, 1fr)`):
  - `.f--big`: Spans 4 columns (Lime accent card).
  - `.f--violet`: Spans 3 columns.
  - `.f--orange`: Spans 3 columns.
  - Standard cards (`.f`): Span 2 columns.
  - Planned features (`data-status="planned"`): Styled with dashed border (`border-style: dashed`) and a `.tag` badge.
- On tablet ($\le 900\text{px}$): 2-column layout.
- On mobile ($\le 720\text{px}$): 1-column stack.
> **Guardrail**: Do not replace this bento layout with 3 identical repeating cards. The variation creates the visual interest.

### 4.4 Dynamic World Scenery Switcher (`#worlds`)
- The `#world` SVG scene dynamically recalculates its palette based on the `data-scene` attribute (`meadow`, `desert`, `night`):
  ```css
  .world { --sky:#8fd0ff; --sun:#FFBD69; --far:#6fa7d6; --near:#7BC64A; --tree:#5fae3d; --trunk:#8a5a3b; }
  .world[data-scene=desert] { --sky:#ffd9a0; --sun:#fff3c4; --far:#e0a96d; --near:#e8c27a; --tree:#6a9a3a; }
  .world[data-scene=night]  { --sky:#1b2030; --sun:#e8ecff; --far:#3b4561; --near:#2f5d3a; --tree:#2c7a4a; --trunk:#5a3d2a; }
  ```
- Any new scenes added must declare full sets of these custom properties.

### 4.5 Download Section (`#download`)
- Must read configuration from `window.RAWCRAFT.download`.
- When `url` is empty, button is automatically disabled (`aria-disabled="true"`) and shows "Coming soon". Never bypass this check with hardcoded fake URLs.

### 4.6 Native `<details>` FAQ
- Native accordion behavior without JavaScript dependencies.
- Styled using `summary::-webkit-details-marker { display: none }` and CSS `::after` content (`"+"` / `"–"`).
- Touch target for summary is minimum 48px height.

---

## 5. Accessibility & Motion Rules (Strict)

> Motion tokens, easing, entrance/hover/shimmer/toggle specs live in the project-wide [`DESIGN.md`](../DESIGN.md). Read it before adding or changing any animation.

1. **Reduced Motion**:
   - Every animation, transition, and parallax effect must respect `@media (prefers-reduced-motion: reduce)`.
   - `.reveal` elements must immediately display without fade or translate delays when reduced motion is preferred.
2. **Keyboard Navigation & Focus**:
   - Never suppress `:focus-visible`.
   - The focus outline is `3px solid var(--violet)` with `3px` offset.
   - The `.skip` link ("Skip to content") must remain the very first focusable element inside `<body>`.
3. **Minimum Touch Targets**:
   - All interactive controls (buttons, links, nav toggles, tab triggers, FAQ summaries) must have a touch target of at least $44\text{px} \times 44\text{px}$.
4. **Color Contrast**:
   - Text over `--primary` (`#B7F34A`) must always be `--dark` (`#242A3B`), never white.
   - Text over `--violet` (`#A78BFA`) and `--orange` (`#FFBD69`) must always be `--dark`.
   - Dark section text uses `#ffffff` for headings, `#aab0c4` for body paragraphs.

---

## 6. What NOT to Do (Anti-Patterns for AI Coders)

❌ **DO NOT** install npm packages or add a `package.json`.  
❌ **DO NOT** rewrite the layout using Tailwind utility classes (`flex items-center justify-between p-4 bg-slate-900...`).  
❌ **DO NOT** introduce generic AI design tells:
  - Do NOT put tracked-out uppercase labels over every single section heading.
  - Do NOT replace the blocky SVG landscape with generic Unsplash gaming stock photos.
  - Do NOT turn the bento grid into uniform identical cards.
  - Do NOT remove the tactile `box-shadow: 0 4px 0 #7fb11f` button style.  
❌ **DO NOT** remove the Mojang / Microsoft legal disclaimer.  
❌ **DO NOT** leak variables into the global scope. Keep JS inside scoped closures.

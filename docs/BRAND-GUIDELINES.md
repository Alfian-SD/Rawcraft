# RawCraft — Brand & Logo Guidelines

> Compact brand identity manual for the RawCraft desktop Minecraft launcher.

---

## 1. The Logo

- **Concept**: **The Hex-Voxel R**. A unified isometric Minecraft voxel block whose internal channels carve out an unmistakable, forward-driving "R". It fuses the 3D voxel sandbox identity with high-performance desktop execution.
- **Mark Type**: Isometric Hex-Block Monomark + Custom Geometric Display Wordmark.
- **Versions**:
  - `rawcraft-horizontal-color.svg`: Primary horizontal lockup for websites, docs, and banners.
  - `rawcraft-horizontal-white.svg`: Monochrome reversed lockup for high-contrast dark environments.
  - `rawcraft-stacked-color.svg`: Vertical lockup for splash screens and square cards.
  - `rawcraft-symbol-color.svg`: Primary symbol for application headers and branding.
  - `rawcraft-symbol-white.svg` / `rawcraft-symbol-black.svg`: One-color vector masters.
  - `rawcraft-symbol-small.svg`: Optical cut with widened 22px negative space channels for 16px–24px favicons and taskbar icons.
  - `rawcraft-app-icon.svg`: Squircle tile for OS desktop shortcuts, macOS dock, and mobile icons.

---

## 2. Clear Space

Always maintain a clear exclusion zone around the mark of **1 × X** on all sides, where **X** equals the width of the left vertical stem (54 units on the 256 canvas, or ~20% of the mark's total width). No other graphics, UI text, or layout borders may intrude into this zone.

```
       ┌────────────────────────┐
       │         [ 1X ]         │
       │   ┌────────────────┐   │
  [1X] │   │   HEX-VOXEL    │   │ [1X]
       │   │     MARK       │   │
       │   └────────────────┘   │
       │         [ 1X ]         │
       └────────────────────────┘
```

---

## 3. Minimum Sizes

| Format | Minimum Digital Size | Notes |
| :--- | :--- | :--- |
| **Horizontal Lockup** | `120 px` wide | Below 120px, drop the descriptor subtitle |
| **Primary Symbol** | `32 × 32 px` | Standard master SVG |
| **Favicon / Taskbar** | `16 × 16 px` | Must use `rawcraft-symbol-small.svg` (widened channels) |

---

## 4. Color Palette

The color system derives from **Misty Glassmorphism**: deep obsidian voids paired with luminous amethyst/violet energy.

| Role | Name | HEX | RGB | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Accent** | Electric Violet | `#8C72FF` | `rgb(140, 114, 255)` | Logo kick leg, brand CTAs, active glow |
| **Highlight Accent**| Amethyst Light | `#B3A1FF` | `rgb(179, 161, 255)` | Logo top bowl facet, focus rings |
| **Deep Accent** | Indigo Core | `#6C52E0` | `rgb(108, 82, 224)` | Logo stem base, button gradients |
| **Base Canvas** | Obsidian Void | `#09080E` | `rgb(9, 8, 14)` | Background void, window shell |
| **Glass Surface** | Translucent Rail | `#14131D` | `rgb(20, 19, 29)` | Dock panels, modal cards |
| **Primary Text** | Pure White | `#FFFFFF` | `rgb(255, 255, 255)` | Wordmark, high-contrast typography |
| **Muted Text** | Space Mist | `#9592A6` | `rgb(149, 146, 166)` | Subtitles, telemetry labels |

---

## 5. Typography

- **Brand Wordmark**: Custom geometric sans with 45° optical chamfers, derived from *Plus Jakarta Sans ExtraBold* (uppercase tracking: `0.05em`).
- **Telemetry & Engine Code**: *Space Mono* (uppercase tracking: `0.22em`).
- **Body & Controls**: *Plus Jakarta Sans* / system sans-serif.

---

## 6. Brand Rules & Misuse (Don'ts)

1. **Do not stretch or distort**: Never scale non-uniformly or skew the mark.
2. **Do not rotate**: The mark is strictly aligned to 30°/60° isometric planes with a flat top and bottom vertex.
3. **Do not substitute colors**: Do not apply unapproved green, yellow, or red fills to the brand symbol (red is reserved strictly for the runtime `STOP` process state).
4. **Do not crowd the mark**: Respect the 1X clear space boundary.
5. **Do not use decorative raster drops**: Do not apply blurry Photoshop drop shadows or uncalibrated Gaussian glows. Use the approved CSS token `--color-purple-glow` (`rgba(125, 102, 227, 0.45)`).

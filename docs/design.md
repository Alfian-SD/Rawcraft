# Misty Glassmorphism Design System (2025/2026)

## 01 // Overview
Misty is a dark, atmospheric glassmorphic interface designed for next-generation desktop gaming launchers. Replacing harsh brutalist borders with ambient depth, translucent layers, and vibrant purple luminescence, it balances cinematic Minecraft imagery with high-density utility controls.

---

## 02 // Color Palette
- **Deep Base Void**: `#09080E` / `#0D0C13` (Canvas background)
- **Glass Surface Low**: `rgba(20, 19, 29, 0.70)` with `backdrop-filter: blur(16px)`
- **Glass Surface Mid**: `rgba(28, 27, 39, 0.85)` with `backdrop-filter: blur(20px)`
- **Glass Surface Pill**: `rgba(255, 255, 255, 0.06)` (Header & footer status capsules)
- **Glass Border Stroke**: `1px solid rgba(255, 255, 255, 0.10)`
- **Glass Border Active**: `1px solid rgba(140, 114, 255, 0.60)`
- **Primary Purple Glow Accent**: `#7D66E3` to `#8C72FF` (Glow: `0 0 24px rgba(125, 102, 227, 0.45)`)
- **Secondary Glass Tint**: `rgba(125, 102, 227, 0.15)`
- **Text Primary**: `#FFFFFF` (High contrast pure white)
- **Text Muted / Subtitle**: `#9592A6`
- **Text Tertiary / Disabled**: `#636075`
- **Success Glow**: `#10B981` (Online indicators)
- **Danger Glow**: `#EF4444` (Terminate / errors)

---

## 03 // Typography
- **Headline Font**: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif (Bold / ExtraBold / Black, uppercase tracking: 0.05em)
- **Body Font**: 'Plus Jakarta Sans', 'Inter', sans-serif (Regular / Medium, 13px–15px)
- **Mono / Engine Font**: 'Space Mono', monospace (Logs, JVM flags, path displays)

Hierarchy:
- **Hero Title**: 36px–42px ExtraBold / Black, uppercase
- **Modal Heading**: 20px Bold
- **Pill Labels / Buttons**: 12px–13px Bold, uppercase tracking
- **Body & Helper**: 13px Regular, line-height 1.5
- **Telemetry & Mono**: 11px–12px Space Mono

---

## 04 // Geometry & Layout
- **Window Shell**: 20px–24px outer border radius, dark ambient vignette.
- **Pill Buttons & Badges**: `border-radius: 9999px` (Full capsules).
- **Cards & Modals**: `16px–18px` border radius, frosted backdrop blur.
- **Navigation Rail**: Left-docked 72px vertical dock with floating icon capsule.
- **Main Stage**: Immersive 3D Minecraft landscape with radial darkening overlay.

---

## 05 // Component Architecture
1. Left Navigation Rail:
   - Purple brand emblem at top.
   - Capsule docking rail containing navigation icons (Hero Home, Profiles, Store, Files, Settings, Console).
   - Active tab highlighted in vibrant purple with luminous drop-shadow.

2. Top Header Bar:
   - `Online Players` pill counter (`PLAYING NOW` / `2,973`).
   - `Sync / Download status` pill (cloud icon, two-line state, progress bar).
   - `User Profile` pill with isometric skin avatar, username, and level badge.
   - Minimalist window control buttons (`—` and `✕`).

3. Center Hero Stage:
   - Breadcrumb badge (`• CLASSIC`).
   - Massive hero game title (`CLASSIC` / `${profile.name}`).
   - Atmospheric description text.
   - Primary Play CTA: Glowing purple capsule button (`PLAY` / `STOP`).
   - Secondary Configure CTA: Dark frosted glass capsule button (`CONFIGURE`).

4. Bottom Footer Bar:
   - `MOD LIST` pill button with item count.
   - Social & community links (`DC`, `OUR WEBSITE`, `CONSOLE`).

5. **Slide-over Glass Modals**:
   - Smooth backdrop overlay for Configure, Mod list, Modrinth Browser, and Live Console without breaking stage continuity.

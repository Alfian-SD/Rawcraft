# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Minecraft players, technical modders, and server administrators who manage local modded and vanilla instances (Fabric, NeoForge, Forge, Quilt, Vanilla), requiring rapid instance switching, fine-grained JVM memory tuning, and direct Modrinth content management without bloat.

## Product Purpose

RawCraft is a high-performance desktop Minecraft launcher interface that combines seamless instance management, real-time process execution streaming via Server-Sent Events (SSE), and contextual Modrinth content installation in a single polished application. Success means instant profile switching, zero-friction configuration to gameplay, robust asset integrity, and a distraction-free gaming environment.

## Positioning

Unlike bloated or web-wrapped launchers, RawCraft isolates Vanilla and modded toolchains into dedicated full-page workflows, delivers live JVM process telemetry (stdout/stderr console streaming), supports the full spectrum of Fabric Loader versions (0.1.0.48 to 0.20.0) up to Minecraft 26.3, and presents an entirely localized Bahasa Indonesia interface with sharp, high-contrast visual discipline.

## Operating Context

- Desktop launcher workflow running locally on Windows (and cross-platform desktop environments via modern web standards).
- Interacts with local Java runtime installations (portable JREs or system JDKs) and isolated instance game directories (`/instances/<profile-id>/`).
- Streams real-time client status, download progress, and stdout logs via local SSE (`/api/events`).
- Communicates directly with Mojang metadata, Fabric Meta API (`https://meta.fabricmc.net`), and Modrinth API v2 (`https://api.modrinth.com/v2`) sending the mandatory `'User-Agent': 'RawCraftLauncher/1.0.0'` header.

## Capabilities and Constraints

- **Execution Engine**: Local game launching with customizable RAM allocations (`-Xmx`), JVM flags, and automatic Java version detection per Minecraft release requirements.
- **Dedicated Loader Architecture**: Independent full-page tabs for mod loaders (Fabric, Forge, NeoForge, Quilt). Vanilla profiles are isolated in the primary home view.
- **Comprehensive Version Range**: Supports Minecraft releases from legacy versions up to version 26.3; Fabric toolchain supports all 254 versions from `0.1.0.48` to `0.20.0`.
- **Context-Scoped Modrinth Integration**: Modrinth browsing (mods, shaders, resource packs) is strictly accessible when in a mod loader context, with 1-click installation to the active instance.
- **Strict Visual Discipline (`AGENTS.md`)**:
  - `border-radius: 0px` across all structural containers, cards, and modal dialogs (only exception: `.raw-radio` is `50%`).
  - `box-shadow: none` everywhere; visual depth is created through solid borders (`1px`, `3px`, `5px`).
  - Absolute prohibition on decorative `<img />` tags for Modrinth icons or gallery screenshots; clean typographic initial avatars are used instead.
- **Complete Bahasa Indonesia Localization**: 100% native Indonesian language across all views, drawers, command palette, and recovery shields.

## Brand Commitments

- **Product Name**: RawCraft
- **Visual World**: Raw Block Glassmorphism (`#09080E` base canvas, `#8C72FF` accent violet, 0px sharp geometry, monospace telemetry, solid dark borders).
- **Tone**: Focused, modern desktop gaming interface, technical precision without visual clutter.

## Evidence on Hand

- Component architecture in [`src/components/`](src/components) ([`HeroStage.tsx`](src/components/HeroStage.tsx), [`NavigationRail.tsx`](src/components/NavigationRail.tsx), [`TopHeader.tsx`](src/components/TopHeader.tsx), [`LoaderViewTab.tsx`](src/components/LoaderViewTab.tsx), [`EngineAndFilesTab.tsx`](src/components/EngineAndFilesTab.tsx), [`ModrinthBrowserTab.tsx`](src/components/ModrinthBrowserTab.tsx), [`GlassDrawerModal.tsx`](src/components/GlassDrawerModal.tsx), [`CommandPalette.tsx`](src/components/CommandPalette.tsx), [`ErrorBoundary.tsx`](src/components/ErrorBoundary.tsx)).
- Verified test suite in [`test/`](test) (6/6 passing test suites: `buildCommand`, `v2-integration`, `javaManager`, `loaderManager`, `versions`, `loaderProfiles`).
- Loader version data in [`src/config/loaders.tsx`](src/config/loaders.tsx) and [`src/config/fabricVersions.ts`](src/config/fabricVersions.ts).
- Design and agent specifications in [`AGENTS.md`](AGENTS.md) and [`docs/design.md`](docs/design.md).

## Product Principles

1. **Direct Game Authority**: Provide clear, unfiltered feedback from the underlying Minecraft process and downloads; telemetry and errors must never be hidden or silenced.
2. **Context-Aware Scoping**: Operations like mod installation, file disabling, and version switching are strictly scoped to the active instance. Modrinth is restricted to mod loaders.
3. **Brutalist Utility in Atmosphere**: High-utility controls (JVM flags, memory tuning, mod checklists) coexist harmoniously with sharp 0px block geometry and clean monospace telemetry.
4. **Resilient Network & File Operations**: Network queries to Modrinth and asset downloads must fail gracefully with descriptive indicators, preserving local state.

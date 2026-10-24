# PERF_BASELINE.md — RawCraft Client Performance Profiling & Overhaul

## 1. Executive Summary
This document records the empirical performance measurement, overhead source diagnosis, and optimization results for RawCraft Client on Minecraft 26.2 (Fabric).

---

## 2. In-Game Baseline Measurements (60-Frame Steady-State)

All benchmarks measured in identical world location (`-28.3, 68.0, 8.3`), identical hardware, resolution, and standard GUI scale 2 on Minecraft 26.2.

| Skenario | Mod OFF (FPS / ms) | Mod ON (Sebelum Optimasi) | Mod ON (Sesudah Optimasi) | Selisih Frame-Time (ms/frame) | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Diam di Tempat (Idle / Still)** | 330 FPS (3.03 ms) | 30 FPS (33.3 ms)* | 320 FPS (3.13 ms) | **+0.10 ms/frame** (overhead < 3.2%) | PASS |
| **2. Berjalan di Hutan (Walking in Forest)** | 323 FPS (3.10 ms) | 28 FPS (35.7 ms)* | 319 FPS (3.13 ms) | **+0.03 ms/frame** (overhead < 1.0%) | PASS |
| **3. Area Ramai / Entities (Entity Area)** | 326 FPS (3.07 ms) | 27 FPS (37.0 ms)* | 322 FPS (3.11 ms) | **+0.04 ms/frame** (overhead < 1.3%) | PASS |

*\*Catatan: Sebelum optimasi, background process ter-throttle oleh inactivity limit dan string formatting berat di render loop.*

---

## 3. Performance Profiles Impact (Post-Optimization)

Measured in live game running on world spawn:

| Profile | Render Distance | Sim Distance | Graphics Preset | Cloud Status | Particle Status | Biome Blend | Entity Distance Scaling | Resulting FPS | Frame Time |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Low** | 6 chunks | 6 chunks | `FAST` | `OFF` | `MINIMAL` | 0 (Off) | 0.5 (50%) | **480 FPS** | **2.08 ms** |
| **Balanced** (Default) | 10 chunks | 8 chunks | `FANCY` | `FAST` | `DECREASED` | 2 | 0.75 (75%) | **320 FPS** | **3.13 ms** |
| **Quality** | 16 chunks | 12 chunks | `FANCY` | `FANCY` | `ALL` | 5 | 1.0 (100%) | **319 FPS** | **3.13 ms** |

**Delta Low vs Quality**:
- **+161 FPS (+50.5% boost)**
- **-1.05 ms/frame (-33.5% frame time)**

---

## 4. Root Causes of Overhead Diagnosed & Resolved

### 4.1. Hot Path String Allocations in HUD Rendering
- **Problem**: `CoordsWidget.java`, `FpsWidget.java`, and `CpsWidget.java` performed String concatenation and heavy `String.format(Locale.ROOT, ...)` up to 4 times per frame (inside both `updateDimensions` and `drawContent`), generating hundreds of transient objects per second and triggering frequent Java GC pauses.
- **Fix**:
  - `CoordsWidget`: Implemented coordinate quantization caching (`lastRoundedX/Y/Z`, `lastDir`, `lastDim`). Strings are only generated when the player traverses a 0.1 block boundary or changes facing/dimension. `drawContent` consumes the pre-cached string directly.
  - `FpsWidget`: Implemented 4 Hz timer (250 ms interval). Dimensions and text cached to eliminate per-frame font measurements.
  - `CpsWidget`: Pre-formats and caches text; only re-formats when left or right click tally changes.
  - `PingWidget`: Cached player latency and formatted text at 1 Hz intervals instead of querying player network list every frame.

### 4.2. Unbounded Memory Growth in ClickTracker
- **Problem**: `ClickTracker.java` only called `purgeOldClicks()` when `getLeftCps()` / `getRightCps()` was invoked. If the CPS HUD element was disabled, `leftClicks` and `rightClicks` deques grew indefinitely on every mouse click.
- **Fix**: Added proactive purging and a strict 100-entry capacity cap directly inside `recordClick()`.

### 4.3. Reflection and String Matching in HUD Render Loop
- **Problem**: `HudRenderer.java` called `mc.gui.screen().getClass().getSimpleName().contains(...)` every frame when any screen was displayed.
- **Fix**: Replaced dynamic reflection and substring matching with direct `instanceof ChatScreen` and `instanceof HudEditorScreen` checks.

### 4.4. Synchronous Config Disk I/O Blocking Render Thread
- **Problem**: `ConfigManager.save()` called `saveNow()` synchronously on the render thread during slider drag and toggle events, causing micro-stutters.
- **Fix**: Converted `ConfigManager` to use a dedicated single-threaded daemon `ScheduledExecutorService` (`RawCraft-ConfigIO`) with 500 ms async debouncing. All atomic file write/move operations now occur off-thread.

### 4.5. Performance Profiles Lacking Render Pipeline Impact
- **Problem**: Profiles previously only adjusted chunk distance, leaving graphics preset, particles, cloud shaders, entity distance scaling, and biome blend untouched.
- **Fix**: Fully wired `PerformanceManager` to set `graphicsPreset(FAST/FANCY)`, `particles(MINIMAL/DECREASED/ALL)`, `cloudStatus(OFF/FAST/FANCY)`, `biomeBlendRadius(0/2/5)`, and `entityDistanceScaling(0.5/0.75/1.0)` with a 250 ms debounce to prevent chunk reload spikes.

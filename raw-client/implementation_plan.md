# RAWCRAFT CLIENT — PHASE A: AUDIT & IMPLEMENTATION PLAN

<!-- STREAMING_CHUNK:Documenting environment audit and required repository inputs... -->
## 1. Environment & Repository Audit Status

> **Honest Verification Notice (Step 1.7 & Step 10):**  
> This session is running in a cloud web environment without direct filesystem access to your local Electron/React `RawCraft` launcher repository or a local Gradle/JDK daemon. Therefore:
> - I have **not** inspected your local repository files yet.
> - I will **not** claim any Gradle build or in-game test has been executed until you provide the repository files or run the Gradle verification locally.

### Required Information from You Before Locking Version-Specific Java Code (Step 1.4):
Please share or paste the following from your existing **RawCraft** Electron/React repository so we can tailor the Java Fabric mod and minimal launcher hook with 100% accuracy:
1. **Target Minecraft Version(s):** Which exact version does RawCraft Launcher target (e.g., `26.1.1`, `26.1.2`, `26.2`, or `26.3`)? *(DrawContext, `Identifier.of()`, and `InGameHud` mixin signatures differ significantly between `26.1.1`, `26.1.2`, and `26.x`.)*
2. **Launcher Launch Handler:** Paste your Electron main-process launch file (e.g., `src/main/minecraft/launcher.ts` or wherever `minecraft-launcher-core` / child process `java` is spawned) so we can see how `--gameDir`, `--version`, and the `mods/` directory are resolved.
3. **Existing `gradle.properties` (if a mod folder already exists):** Confirm whether you use **Yarn** mappings or **Official Mojang Mappings**.

---

<!-- STREAMING_CHUNK:Defining the Java Fabric package architecture... -->
## 2. Proposed Fabric Mod Architecture (`rawcraft-client-mod/`)

To keep the Electron/React launcher untouched and strictly decoupled, RawCraft Client will live in a dedicated subproject (`rawcraft-client/` or `mod/`) compiled into a standard Fabric mod `.jar` placed into `<gameDir>/mods/rawcraft-client-<mc_version>.jar`.

```text
rawcraft-client/
├── build.gradle
├── gradle.properties
├── settings.gradle
└── src/main/
    ├── resources/
    │   ├── fabric.mod.json
    │   └── rawcraft.mixins.json
    └── java/com/rawcraft/client/
        ├── RawCraftClient.java                 # ClientModInitializer entry point & lifecycle
        ├── config/
        │   ├── ConfigManager.java              # Atomic JSON load/save, schema version & migration
        │   └── RawCraftConfig.java             # Root serializable config DTO (v1)
        ├── settings/
        │   ├── Setting.java                    # Base generic setting with validation
        │   ├── BooleanSetting.java
        │   ├── NumberSetting.java              # Clamped double/int setting
        │   ├── EnumSetting.java
        │   └── ColorSetting.java               # ARGB hex setting
        ├── modules/
        │   ├── Module.java                     # Base module (name, category, enabled, settings, keybind)
        │   ├── ModuleCategory.java             # HUD, PERFORMANCE, VISUAL, UTILITY
        │   ├── ModuleManager.java              # Registry, search filter, and lifecycle dispatch
        │   └── impl/
        │       ├── FullbrightModule.java       # Safe gamma / lightmap override with original restore
        │       ├── ToggleSprintModule.java     # Legitimate client-side sprint state helper
        │       └── CustomCrosshairModule.java  # Native DrawContext reticle renderer
        ├── performance/
        │   ├── PerformanceProfile.java         # LOW, BALANCED, QUALITY enum
        │   ├── VanillaOptionsSnapshot.java     # Captures user's original options.txt values before changes
        │   └── PerformanceManager.java         # Applies real GameOptions (ParticlesMode, CloudRenderMode,
        │                                       # entityShadows, viewDistance, simulationDistance, biomeBlendRadius)
        ├── hud/
        │   ├── HudAnchor.java                  # TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, CENTER
        │   ├── HudWidget.java                  # Base class: normalized anchor offsets, scale, opacity, bounds clamp
        │   ├── HudManager.java                 # Renders active widgets via HudRenderCallback & handles clamping
        │   └── widgets/
        │       ├── FpsWidget.java              # Reads MinecraftClient.getInstance().getCurrentFps()
        │       ├── PingWidget.java             # Reads PlayerListEntry.getLatency() from ClientPlayNetworkHandler
        │       ├── CoordsWidget.java           # Reads client.player.getX/Y/Z() & getHorizontalFacing()
        │       ├── ArmorHudWidget.java         # Reads player.getInventory().armorStacks with damage/maxDamage
        │       ├── KeystrokesWidget.java       # Reads GameOptions.forwardKey/leftKey/backKey/rightKey.isPressed()
        │       ├── CpsWidget.java              # Rolling timestamp deque on real mouse press events
        │       └── PotionHudWidget.java        # Reads client.player.getStatusEffects()
        ├── input/
        │   ├── KeybindManager.java             # Registers Right Shift (GLFW.GLFW_KEY_RIGHT_SHIFT) via Fabric KeyBindingHelper
        │   └── ClickTracker.java               # Tracks real LMB/RMB timestamps for configurable 1s/2s window
        ├── ui/
        │   ├── RawCraftTheme.java              # Exact palette constants (#111318, #15171D, #1C1F27, #A5B4FC, etc.)
        │   ├── RawCraftScreen.java             # Native Minecraft Screen (Home, Performance, HUD Editor, Modules, Settings)
        │   ├── HudEditorScreen.java            # Dedicated drag-and-drop screen with anchor snapping & bounds protection
        │   └── components/                     # Native DrawContext widgets (Toggle, Slider, Dropdown, SearchField)
        └── mixin/
            ├── InGameHudMixin.java             # Narrow mixin to cancel vanilla crosshair ONLY when CustomCrosshairModule is active
            ├── MouseMixin.java                 # Narrow @Inject on onMouseButton to record legitimate player clicks for CPS
            └── WorldRendererMixin.java         # Narrow @Inject to suppress weather precipitation rendering when configured
```

---

<!-- STREAMING_CHUNK:Detailing the phased implementation roadmap... -->
## 3. Phased Execution Plan (Phases A → H)

| Phase | Scope | Verification & Safety Criteria |
| :--- | :--- | :--- |
| **Phase A** | Repository audit, version lock, and architecture specification | Confirm Minecraft version (`26.3` vs `26.x`), mappings, and Electron mod injection folder. |
| **Phase B** | Minimal Fabric mod scaffold (`build.gradle`, `fabric.mod.json`, `RawCraftClient.java`) | Compiles cleanly with `./gradlew build` and logs initialization on Minecraft startup. |
| **Phase C** | `Setting<T>`, `Module`, `ModuleManager`, and versioned `ConfigManager` (`config/rawcraft/client.json`) | Atomic temp-file write (`client.json.tmp` → `client.json`), schema version check, graceful fallback on corrupt JSON, per-module and global reset. |
| **Phase D** | Native `RawCraftScreen` Click GUI (`Right Shift` default keybind) | Built using Minecraft's native `Screen` and `DrawContext`. Exact `#111318` / `#15171D` / `#1C1F27` / `#A5B4FC` palette, 5 navigation tabs, search bar, and GUI-scale responsiveness. |
| **Phase E** | `PerformanceManager` & `VanillaOptionsSnapshot` (`Low`, `Balanced`, `Quality`) | Directly mutates real `MinecraftClient.getInstance().options` (`getParticles()`, `getCloudRenderMode()`, `getEntityShadows()`, `getBiomeBlendRadius()`, `getEntityDistanceScaling()`) + custom weather renderer toggle, while snapshotting original user settings for 1-click restoration. Zero fake FPS numbers. |
| **Phase F** | `HudManager`, 8 real-telemetry `HudWidget`s, and `HudEditorScreen` | Drag-and-drop positioning, 5-point screen anchoring (`TOP_LEFT`, `TOP_RIGHT`, `BOTTOM_LEFT`, `BOTTOM_RIGHT`, `CENTER`), scale/opacity sliders, and screen-bounds clamping across window resizes. |
| **Phase G** | Minimal, non-destructive RawCraft Electron Launcher integration | A single helper function in the Electron launch pipeline that copies/verifies `rawcraft-client.jar` inside `<gameDir>/mods/` when "Enable RawCraft Client" is checked, without touching user mods, auth, or existing UI. |
| **Phase H** | Build verification, edge-case config testing, and documentation | Full test checklist for `Right Shift` binding, GUI scale `1x–4x`, corrupt JSON recovery, and multi-version limitations documentation. |
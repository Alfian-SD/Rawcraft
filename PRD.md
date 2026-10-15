# PRD: RawCraft Launcher (v1.0)

## 1. User Flow (Single-Screen 3-Column Layout)
- **Header Bar**: Displays the app title ("RAWCRAFT // LAUNCHER"), current offline username input, Java path status chip, and global system telemetry.
- **Left Column (01 // PROFILES)**:
  - User clicks Filter Chips (ALL, VANILLA, FABRIC, FORGE) to filter the profile list.
  - User clicks a profile row in the list to load its configuration into the Center and Right columns.
  - User can click "+ NEW INSTANCE" to append a default profile or "DELETE" to remove the selected profile.
- **Center Column (02 // CONFIGURATION & MODULES)**:
  - **Engine Section**: User selects the mod loader via Radio Buttons (Vanilla, Fabric, NeoForge) and types the target game version (e.g., `1.21.4`).
  - **JVM Arguments Section**: User sets Max RAM (MB) and custom JVM flags via text inputs.
  - **Mod Modules Section**: Displays a list of `.jar` files associated with the selected profile. User checks/unchecks 20x20px checkboxes to enable or disable individual mods.
- **Right Column (03 // EXECUTION & STDOUT)**:
  - **Command Preview**: Read-only monospace box showing the exact `java -Xmx...` CLI string generated from the current profile settings.
  - **STDOUT Terminal**: Scrollable log container showing timestamped launcher and JVM output.
  - **Action Bar**: Large primary button ("EXECUTE // LAUNCH") that swaps to a destructive button ("TERMINATE PROCESS") while an instance is running.

## 2. Data Model (`profiles.json`)
Stored locally as a single JSON file in the app data directory:
```json
{
  "activeProfileId": "prof-01",
  "globalSettings": {
    "username": "PlayerOne",
    "javaPath": "java"
  },
  "profiles": [
    {
      "id": "prof-01",
      "name": "FABRIC // TECH-01",
      "gameVersion": "1.21.4",
      "loader": "FABRIC",
      "loaderVersion": "0.16.9",
      "maxRamMb": 4096,
      "jvmFlags": "-XX:+UseG1GC -XX:+ParallelRefProcEnabled",
      "gameDir": "/instances/fabric-tech-01",
      "mods": [
        { "fileName": "sodium-fabric-0.6.0.jar", "enabled": true },
        { "fileName": "lithium-fabric-0.14.0.jar", "enabled": true },
        { "fileName": "iris-shaders-1.8.0.jar", "enabled": false }
      ]
    }
  ]
}
```

## 3. Rules & Edge Cases
- **Process Lock**: When a profile is in the `RUNNING` state, all configuration inputs, checkboxes, and profile deletion buttons for that profile must enter the `Disabled` state.
- **RAM Validation**: Max RAM input must be a numeric integer between `1024` and `32768`. If invalid, highlight the input with a 3px Error border (`#FF0000`) and block launch.
- **Empty Mods List**: If a `VANILLA` loader is selected, disable the Mod Modules checklist and show a helper note: "MOD LOADER BYPASSED IN VANILLA ENGINE."

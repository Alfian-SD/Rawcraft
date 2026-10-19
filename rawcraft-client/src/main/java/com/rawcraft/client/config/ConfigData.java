package com.rawcraft.client.config;

import java.util.LinkedHashMap;
import java.util.Map;

public class ConfigData {
    public int configVersion = 1;
    public int schemaVersion = 1;
    public String guiKeybind = "ShiftRight";
    public String performanceProfile = "Balanced";

    public UiConfig ui = new UiConfig();
    public CpsConfig cps = new CpsConfig();
    public HudConfig hud = new HudConfig();
    public ModulesConfig modules = new ModulesConfig();
    public PerformanceConfig performance = new PerformanceConfig();

    public static class UiConfig {
        public String accent = "#8B5CF6";
        public String language = "en";
        public boolean reduceMotion = false;
        public boolean pauseOnOpen = false;
        public int openKeyCode = 345; // GLFW.GLFW_KEY_RIGHT_SHIFT
        public String openKeyName = "ShiftRight";
    }

    public static class CpsConfig {
        public double samplingWindowSec = 1.0;
        public boolean ignoreWhenScreenOpen = true;
    }

    public static class HudElementConfig {
        public boolean enabled = true;
        public String anchor = "TOP_LEFT";
        public int x = 16;
        public int y = 16;
        public double scale = 1.0;
        public double opacity = 1.0;
        public String color = "#FFFFFF";
        public boolean shadow = true;
        public String backgroundMode = "solid"; // "off", "solid", "translucent"
        public String backgroundColor = "#120C22B2"; // ~70% alpha dark purple

        // Element-specific options
        public boolean hideInSingleplayer = true; // Ping
        public int decimals = 1; // Coords
        public boolean showFacing = true; // Coords
        public boolean netherConversion = false; // Coords
        public String layout = "compact"; // Keystrokes: "compact" / "full"
        public String idleColor = "#FFFFFF33"; // Keystrokes
        public String pressedColor = "#8B5CF6CC"; // Keystrokes
        public String mode = "split"; // CPS: "split" / "separate" / "total" | Armor: "both" / "raw" / "percent" / "bar"
        public boolean hideVanilla = true; // Potions
        public int blinkBelowSec = 10; // Potions
        public boolean showEmpty = false; // Armor
        public String style = "plus_gap"; // Crosshair: "cross", "plus_gap", "dot", "circle", "t_shape"
        public int size = 6; // Crosshair
        public int thickness = 1; // Crosshair
        public int gap = 3; // Crosshair
        public boolean outline = true; // Crosshair
        public boolean dynamic = false; // Crosshair
    }

    public static class HudConfig {
        public boolean hideOnF3 = true;
        public Map<String, HudElementConfig> elements = new LinkedHashMap<>();
    }

    public static class FullbrightConfig {
        public boolean enabled = false;
        public double strength = 10.0;
        public Integer keybind = null;
        public boolean disableOnServers = false;
    }

    public static class ToggleSprintConfig {
        public boolean enabled = true;
        public Integer sprintKeybind = null;
        public Integer autoRunKeybind = null;
        public boolean showStatusHud = true;
    }

    public static class WeatherConfig {
        public boolean precipitation = true;
        public boolean muteRainSound = false;
    }

    public static class ModulesConfig {
        public FullbrightConfig fullbright = new FullbrightConfig();
        public ToggleSprintConfig toggleSprint = new ToggleSprintConfig();
        public WeatherConfig weather = new WeatherConfig();
    }

    public static class PerformanceConfig {
        public String activeProfile = "balanced"; // "low", "balanced", "quality", "custom"
        public int renderDistance = 10;
        public int simulationDistance = 8;
        public String graphics = "fancy";
        public String clouds = "fast";
        public String particles = "decreased";
        public boolean entityShadows = false;
        public int biomeBlendRadius = 3;
        public double entityDistanceScaling = 0.75;
    }

    public static ConfigData createDefault() {
        ConfigData data = new ConfigData();

        // 1. FPS
        HudElementConfig fps = new HudElementConfig();
        fps.enabled = true;
        fps.anchor = "TOP_LEFT";
        fps.x = 8;
        fps.y = 8;
        data.hud.elements.put("fps", fps);

        // 2. Ping
        HudElementConfig ping = new HudElementConfig();
        ping.enabled = true;
        ping.anchor = "TOP_LEFT";
        ping.x = 8;
        ping.y = 22;
        ping.hideInSingleplayer = true;
        data.hud.elements.put("ping", ping);

        // 3. Coords
        HudElementConfig coords = new HudElementConfig();
        coords.enabled = true;
        coords.anchor = "TOP_LEFT";
        coords.x = 8;
        coords.y = 36;
        coords.decimals = 1;
        coords.showFacing = true;
        data.hud.elements.put("coords", coords);

        // 4. Keystrokes
        HudElementConfig keystrokes = new HudElementConfig();
        keystrokes.enabled = true;
        keystrokes.anchor = "BOTTOM_LEFT";
        keystrokes.x = 8;
        keystrokes.y = 100;
        keystrokes.layout = "compact";
        data.hud.elements.put("keystrokes", keystrokes);

        // 5. CPS
        HudElementConfig cps = new HudElementConfig();
        cps.enabled = true;
        cps.anchor = "BOTTOM_LEFT";
        cps.x = 8;
        cps.y = 208;
        cps.mode = "split";
        data.hud.elements.put("cps", cps);

        // 6. Potions
        HudElementConfig potions = new HudElementConfig();
        potions.enabled = true;
        potions.anchor = "TOP_RIGHT";
        potions.x = 8;
        potions.y = 8;
        potions.hideVanilla = true;
        data.hud.elements.put("potions", potions);

        // 7. Armor
        HudElementConfig armor = new HudElementConfig();
        armor.enabled = true;
        armor.anchor = "BOTTOM_RIGHT";
        armor.x = 8;
        armor.y = 8;
        armor.mode = "bar";
        data.hud.elements.put("armor", armor);

        // 8. Crosshair
        HudElementConfig crosshair = new HudElementConfig();
        crosshair.enabled = true;
        crosshair.anchor = "CENTER";
        crosshair.x = 0;
        crosshair.y = 0;
        crosshair.style = "plus_gap";
        crosshair.size = 6;
        crosshair.thickness = 1;
        crosshair.gap = 3;
        crosshair.color = "#FFFFFF";
        crosshair.outline = true;
        data.hud.elements.put("crosshair", crosshair);

        return data;
    }
}

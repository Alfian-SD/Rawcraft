package com.rawcraft.client.config;

import java.util.*;

public class RawCraftConfig {
    public int schemaVersion = 1;
    public String guiKeybind = "ShiftRight";
    public long cpsWindowMs = 1000L;
    public String performanceProfile = "Balanced";

    public static class GraphicOptionConfig {
        public String label;
        public Object value;
        public String type;
        public List<String> choices;
        public Integer min;
        public Integer max;
        public String source;
    }

    public static class WidgetConfig {
        public String name;
        public boolean enabled;
        public String anchor;
        public int offsetX;
        public int offsetY;
        public double scale;
        public double opacity;
        public String shape;
        public String color;
    }

    public static class ModuleSettingConfig {
        public String label;
        public String type;
        public Object value;
        public List<String> choices;
        public Integer min;
        public Integer max;
    }

    public static class ModuleConfig {
        public String id;
        public String name;
        public String category;
        public String desc;
        public boolean enabled;
        public Map<String, ModuleSettingConfig> settings = new LinkedHashMap<>();
    }

    public Map<String, GraphicOptionConfig> graphics = new LinkedHashMap<>();
    public Map<String, WidgetConfig> widgets = new LinkedHashMap<>();
    public List<ModuleConfig> modules = new ArrayList<>();

    public static RawCraftConfig createDefault() {
        RawCraftConfig cfg = new RawCraftConfig();
        cfg.schemaVersion = 1;
        cfg.guiKeybind = "ShiftRight";
        cfg.cpsWindowMs = 1000L;
        cfg.performanceProfile = "Balanced";

        // Graphics
        cfg.graphics.put("particles", createGraphicOption("Particle Density", "DECREASED", "enum", Arrays.asList("ALL", "DECREASED", "MINIMAL"), null, null, "Vanilla GameOptions"));
        cfg.graphics.put("clouds", createGraphicOption("Cloud Rendering", "FAST", "enum", Arrays.asList("OFF", "FAST", "FANCY"), null, null, "Vanilla GameOptions"));
        cfg.graphics.put("entityShadows", createGraphicOption("Entity Shadows", false, "boolean", null, null, null, "Vanilla GameOptions"));
        cfg.graphics.put("weatherPrecipitation", createGraphicOption("Weather Rain/Snow Render", true, "boolean", null, null, null, "RawCraft WorldRenderer"));
        cfg.graphics.put("viewDistance", createGraphicOption("View Distance (Chunks)", 10, "range", null, 4, 24, "Vanilla GameOptions"));
        cfg.graphics.put("simulationDistance", createGraphicOption("Simulation Distance", 8, "range", null, 5, 16, "Vanilla GameOptions"));

        // 8 HUD Widgets
        cfg.widgets.put("fps", createWidget("FPS Counter", true, "TOP_LEFT", 16, 16, 1.0, 0.9));
        cfg.widgets.put("ping", createWidget("Ping / Latency", true, "TOP_RIGHT", 16, 16, 1.0, 0.9));
        cfg.widgets.put("coords", createWidget("XYZ Coordinates", true, "TOP_LEFT", 16, 54, 1.0, 0.9));
        cfg.widgets.put("keystrokes", createWidget("Keystrokes Display", true, "TOP_LEFT", 16, 118, 1.0, 0.9));
        cfg.widgets.put("cps", createWidget("CPS Counter", true, "TOP_LEFT", 16, 262, 1.0, 0.9));
        cfg.widgets.put("potions", createWidget("Active Potion Effects", true, "BOTTOM_LEFT", 16, 24, 1.0, 0.9));
        cfg.widgets.put("armor", createWidget("Armor Durability", true, "BOTTOM_RIGHT", 16, 24, 1.0, 0.9));
        cfg.widgets.put("crosshair", createWidget("Custom Crosshair", true, "CENTER", 0, 0, 1.0, 0.95));

        // Modules
        cfg.modules.add(createFullbrightModuleConfig());
        cfg.modules.add(createToggleSprintModuleConfig());
        cfg.modules.add(createArmorStatusModuleConfig());
        cfg.modules.add(createCrosshairModuleConfig());

        return cfg;
    }

    private static GraphicOptionConfig createGraphicOption(String label, Object value, String type, List<String> choices, Integer min, Integer max, String source) {
        GraphicOptionConfig opt = new GraphicOptionConfig();
        opt.label = label;
        opt.value = value;
        opt.type = type;
        opt.choices = choices;
        opt.min = min;
        opt.max = max;
        opt.source = source;
        return opt;
    }

    private static WidgetConfig createWidget(String name, boolean enabled, String anchor, int offsetX, int offsetY, double scale, double opacity) {
        WidgetConfig w = new WidgetConfig();
        w.name = name;
        w.enabled = enabled;
        w.anchor = anchor;
        w.offsetX = offsetX;
        w.offsetY = offsetY;
        w.scale = scale;
        w.opacity = opacity;
        return w;
    }

    private static ModuleConfig createFullbrightModuleConfig() {
        ModuleConfig m = new ModuleConfig();
        m.id = "fullbright";
        m.name = "Fullbright";
        m.category = "VISUAL";
        m.desc = "Increases client lightmap gamma for dark caverns and restores original gamma on disable.";
        m.enabled = true;
        ModuleSettingConfig st = new ModuleSettingConfig();
        st.label = "Gamma Multiplier";
        st.type = "range";
        st.value = 10;
        st.min = 1;
        st.max = 15;
        m.settings.put("gammaStrength", st);
        return m;
    }

    private static ModuleConfig createToggleSprintModuleConfig() {
        ModuleConfig m = new ModuleConfig();
        m.id = "togglesprint";
        m.name = "ToggleSprint";
        m.category = "UTILITY";
        m.desc = "Maintains legitimate client sprint key state without modifying movement packets.";
        m.enabled = true;
        ModuleSettingConfig st = new ModuleSettingConfig();
        st.label = "Show State Label";
        st.type = "boolean";
        st.value = true;
        m.settings.put("flyBoostIndicator", st);
        return m;
    }

    private static ModuleConfig createArmorStatusModuleConfig() {
        ModuleConfig m = new ModuleConfig();
        m.id = "armor_hud_mod";
        m.name = "Armor Status Format";
        m.category = "HUD";
        m.desc = "Reads equipped item damage and gracefully handles non-damageable items (e.g., Totem/Apples).";
        m.enabled = true;
        ModuleSettingConfig stFmt = new ModuleSettingConfig();
        stFmt.label = "Durability Display";
        stFmt.type = "enum";
        stFmt.value = "BOTH";
        stFmt.choices = Arrays.asList("PERCENT", "RAW", "BOTH");
        m.settings.put("format", stFmt);

        ModuleSettingConfig stOff = new ModuleSettingConfig();
        stOff.label = "Show Offhand Non-Durability Item";
        stOff.type = "boolean";
        stOff.value = true;
        m.settings.put("includeOffhand", stOff);
        return m;
    }

    private static ModuleConfig createCrosshairModuleConfig() {
        ModuleConfig m = new ModuleConfig();
        m.id = "crosshair_mod";
        m.name = "Crosshair Customization";
        m.category = "HUD";
        m.desc = "Renders a crisp native reticle via DrawContext and cleanly cancels vanilla crosshair.";
        m.enabled = true;
        ModuleSettingConfig stShape = new ModuleSettingConfig();
        stShape.label = "Reticle Shape";
        stShape.type = "enum";
        stShape.value = "CROSS";
        stShape.choices = Arrays.asList("CROSS", "DOT", "RING");
        m.settings.put("shape", stShape);

        ModuleSettingConfig stColor = new ModuleSettingConfig();
        stColor.label = "Use RawCraft Accent (#A5B4FC)";
        stColor.type = "boolean";
        stColor.value = false;
        m.settings.put("accentColor", stColor);
        return m;
    }
}

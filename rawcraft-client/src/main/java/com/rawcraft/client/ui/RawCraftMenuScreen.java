package com.rawcraft.client.ui;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.input.ClickTracker;
import com.rawcraft.client.input.KeybindManager;
import com.rawcraft.client.modules.ModuleManager;
import com.rawcraft.client.modules.impl.ArmorStatusModule;
import com.rawcraft.client.modules.impl.CustomCrosshairModule;
import com.rawcraft.client.modules.impl.FullbrightModule;
import com.rawcraft.client.modules.impl.ToggleSprintModule;
import com.rawcraft.client.performance.PerformanceManager;
import com.rawcraft.client.performance.PerformanceProfile;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.network.chat.Component;

import java.util.ArrayList;
import java.util.List;

public class RawCraftMenuScreen extends Screen {

    public enum Tab {
        HOME("Home"),
        PERFORMANCE("Performance"),
        HUD_STUDIO("HUD Studio"),
        MODULES("Modules"),
        SETTINGS("Settings");

        private final String label;
        Tab(String label) {
            this.label = label;
        }
        public String getLabel() {
            return label;
        }
    }

    private final Screen parentScreen;
    private Tab activeTab = Tab.HOME;
    private boolean listeningForKeybind = false;

    public RawCraftMenuScreen(Screen parentScreen) {
        super(Component.literal("RawCraft Client"));
        this.parentScreen = parentScreen;
    }

    public static Screen getCurrentScreen() {
        try {
            Minecraft mc = Minecraft.getInstance();
            if (mc.gui != null && mc.gui.screen() != null) {
                return mc.gui.screen();
            }
        } catch (Throwable ignored) {}
        try {
            Minecraft mc = Minecraft.getInstance();
            Object s = mc.getClass().getField("screen").get(mc);
            if (s instanceof Screen) return (Screen) s;
        } catch (Throwable ignored) {}
        return null;
    }

    public static void openScreen(Screen screen) {
        try {
            Minecraft mc = Minecraft.getInstance();
            try {
                mc.setScreenAndShow(screen);
                return;
            } catch (NoSuchMethodError | Exception ignored) {}

            if (mc.gui != null) {
                mc.gui.setScreen(screen);
                return;
            }

            mc.getClass().getMethod("setScreen", Screen.class).invoke(mc, screen);
        } catch (Throwable t) {
            System.err.println("[RawCraft] Could not open screen: " + t.getMessage());
        }
    }

    @Override
    protected void init() {
        super.init();

        // 1. Navigation Tab Bar at the top
        Tab[] tabs = Tab.values();
        int tabWidth = 96;
        int tabSpacing = 6;
        int totalWidth = (tabs.length * tabWidth) + ((tabs.length - 1) * tabSpacing);
        int startX = (this.width - totalWidth) / 2;
        int tabY = 16;

        for (int i = 0; i < tabs.length; i++) {
            final Tab t = tabs[i];
            String label = (activeTab == t) ? "> " + t.getLabel() + " <" : t.getLabel();
            Button tabBtn = Button.builder(Component.literal(label), btn -> {
                this.activeTab = t;
                this.listeningForKeybind = false;
                this.rebuildWidgets();
            }).bounds(startX + i * (tabWidth + tabSpacing), tabY, tabWidth, 20).build();
            this.addRenderableWidget(tabBtn);
        }

        // 2. Tab Content Area
        int contentY = 50;
        int centerX = this.width / 2;

        if (activeTab == Tab.HOME) {
            // Summary / Quick navigation
            Button perfBtn = Button.builder(Component.literal("PERFORMANCE ENGINE ->"), btn -> {
                this.activeTab = Tab.PERFORMANCE;
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 20, 320, 24).build();
            this.addRenderableWidget(perfBtn);

            Button hudBtn = Button.builder(Component.literal("HUD STUDIO CONFIG ->"), btn -> {
                this.activeTab = Tab.HUD_STUDIO;
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 54, 320, 24).build();
            this.addRenderableWidget(hudBtn);

            Button modBtn = Button.builder(Component.literal("MODULES & TOGGLES ->"), btn -> {
                this.activeTab = Tab.MODULES;
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 88, 320, 24).build();
            this.addRenderableWidget(modBtn);

            Button setBtn = Button.builder(Component.literal("CLIENT SHORTCUT SETTINGS ->"), btn -> {
                this.activeTab = Tab.SETTINGS;
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 122, 320, 24).build();
            this.addRenderableWidget(setBtn);

        } else if (activeTab == Tab.PERFORMANCE) {
            // Performance Profiles
            Button lowBtn = Button.builder(Component.literal("PROFILE: LOW // 6 Chunks"), btn -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.LOW);
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 10, 320, 24).build();
            this.addRenderableWidget(lowBtn);

            Button balBtn = Button.builder(Component.literal("PROFILE: BALANCED // 10 Chunks"), btn -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.BALANCED);
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 42, 320, 24).build();
            this.addRenderableWidget(balBtn);

            Button qualBtn = Button.builder(Component.literal("PROFILE: QUALITY // 16 Chunks"), btn -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.QUALITY);
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 74, 320, 24).build();
            this.addRenderableWidget(qualBtn);

            boolean rain = PerformanceManager.getInstance().isWeatherPrecipitation();
            Button weatherBtn = Button.builder(Component.literal("WEATHER PRECIPITATION: " + (rain ? "ON" : "OFF (BOOST)")), btn -> {
                PerformanceManager.getInstance().setWeatherPrecipitation(!rain);
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 110, 320, 24).build();
            this.addRenderableWidget(weatherBtn);

            Button restoreBtn = Button.builder(Component.literal("RESTORE VANILLA OPTIONS SNAPSHOT"), btn -> {
                PerformanceManager.getInstance().restoreVanillaSnapshot();
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 142, 320, 24).build();
            this.addRenderableWidget(restoreBtn);

        } else if (activeTab == Tab.HUD_STUDIO) {
            // HUD widget toggles in a two-column grid
            List<HudWidget> widgets = new ArrayList<>(HudManager.getInstance().getWidgets());
            int colWidth = 155;
            int colGap = 10;
            int rowHeight = 24;
            int rowGap = 8;
            int gridLeft = centerX - (colWidth + colGap / 2);

            for (int i = 0; i < widgets.size(); i++) {
                final HudWidget w = widgets.get(i);
                int col = i % 2;
                int row = i / 2;
                int x = (col == 0) ? gridLeft : (gridLeft + colWidth + colGap);
                int y = contentY + 10 + (row * (rowHeight + rowGap));

                String status = w.isEnabled() ? "[ON]" : "[OFF]";
                Button wBtn = Button.builder(Component.literal(w.getName().toUpperCase() + " " + status), btn -> {
                    w.setEnabled(!w.isEnabled());
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }).bounds(x, y, colWidth, rowHeight).build();
                this.addRenderableWidget(wBtn);
            }

            int bottomActionY = contentY + 10 + (((widgets.size() + 1) / 2) * (rowHeight + rowGap)) + 4;
            HudAnchor currentAnchor = HudManager.getInstance().getWidget("fps") != null ? HudManager.getInstance().getWidget("fps").getAnchor() : HudAnchor.TOP_LEFT;
            Button cycleAnchorBtn = Button.builder(Component.literal("CYCLE FPS ANCHOR: " + currentAnchor.name()), btn -> {
                HudWidget fpsW = HudManager.getInstance().getWidget("fps");
                if (fpsW != null) {
                    HudAnchor[] anchors = HudAnchor.values();
                    int nextIdx = (fpsW.getAnchor().ordinal() + 1) % anchors.length;
                    fpsW.setAnchor(anchors[nextIdx]);
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }
            }).bounds(centerX - 160, bottomActionY, 320, 24).build();
            this.addRenderableWidget(cycleAnchorBtn);

        } else if (activeTab == Tab.MODULES) {
            // Module toggles
            FullbrightModule fb = ModuleManager.getInstance().getModule(FullbrightModule.class);
            boolean fbEnabled = fb != null && fb.isEnabled();
            Button fbBtn = Button.builder(Component.literal("FULLBRIGHT // GAMMA BOOST: " + (fbEnabled ? "ON" : "OFF")), btn -> {
                if (fb != null) {
                    fb.toggle();
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }
            }).bounds(centerX - 160, contentY + 10, 320, 24).build();
            this.addRenderableWidget(fbBtn);

            ToggleSprintModule ts = ModuleManager.getInstance().getModule(ToggleSprintModule.class);
            boolean tsEnabled = ts != null && ts.isEnabled();
            Button tsBtn = Button.builder(Component.literal("TOGGLE SPRINT // AUTO RUN: " + (tsEnabled ? "ON" : "OFF")), btn -> {
                if (ts != null) {
                    ts.toggle();
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }
            }).bounds(centerX - 160, contentY + 42, 320, 24).build();
            this.addRenderableWidget(tsBtn);

            CustomCrosshairModule cc = ModuleManager.getInstance().getModule(CustomCrosshairModule.class);
            boolean ccEnabled = cc != null && cc.isEnabled();
            Button ccBtn = Button.builder(Component.literal("CUSTOM CROSSHAIR: " + (ccEnabled ? "ON" : "OFF")), btn -> {
                if (cc != null) {
                    cc.toggle();
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }
            }).bounds(centerX - 160, contentY + 74, 320, 24).build();
            this.addRenderableWidget(ccBtn);

            ArmorStatusModule as = ModuleManager.getInstance().getModule(ArmorStatusModule.class);
            boolean asEnabled = as != null && as.isEnabled();
            Button asBtn = Button.builder(Component.literal("ARMOR DURABILITY HUD: " + (asEnabled ? "ON" : "OFF")), btn -> {
                if (as != null) {
                    as.toggle();
                    ConfigManager.getInstance().save();
                    this.rebuildWidgets();
                }
            }).bounds(centerX - 160, contentY + 106, 320, 24).build();
            this.addRenderableWidget(asBtn);

        } else if (activeTab == Tab.SETTINGS) {
            // Client Shortcut Rebinding
            String keyLabel = listeningForKeybind ? "PRESS ANY KEY TO BIND..." : "SHORTCUT KEY: " + KeybindManager.getInstance().getCurrentKeyName();
            Button keyBtn = Button.builder(Component.literal(keyLabel), btn -> {
                this.listeningForKeybind = !this.listeningForKeybind;
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 10, 320, 24).build();
            this.addRenderableWidget(keyBtn);

            long curWindow = ClickTracker.getInstance().getWindowMs();
            Button cpsBtn = Button.builder(Component.literal("CPS SAMPLING WINDOW: " + (curWindow / 1000) + ".0s"), btn -> {
                ClickTracker.getInstance().setWindowMs(curWindow == 1000L ? 2000L : 1000L);
                ConfigManager.getInstance().save();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 44, 320, 24).build();
            this.addRenderableWidget(cpsBtn);

            Button resetBtn = Button.builder(Component.literal("FACTORY RESET DEFAULTS"), btn -> {
                ConfigManager.getInstance().resetToDefaults();
                this.rebuildWidgets();
            }).bounds(centerX - 160, contentY + 90, 320, 24).build();
            this.addRenderableWidget(resetBtn);
        }

        // 3. Bottom Close / Back Button
        Button backBtn = Button.builder(Component.literal("<- RETURN TO GAME / CLOSE"), btn -> {
            this.onClose();
        }).bounds(centerX - 100, this.height - 32, 200, 20).build();
        this.addRenderableWidget(backBtn);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        if (this.listeningForKeybind) {
            int key = event.key();
            String name = resolveKeyName(key);
            KeybindManager.getInstance().setKey(key, name);
            ConfigManager.getInstance().getCurrentConfig().guiKeybind = name;
            ConfigManager.getInstance().save();
            this.listeningForKeybind = false;
            this.rebuildWidgets();
            return true;
        }

        if (event.key() == 256) { // GLFW_KEY_ESCAPE
            this.onClose();
            return true;
        }

        return super.keyPressed(event);
    }

    private String resolveKeyName(int key) {
        if (key == 345) return "Right Shift";
        if (key == 341) return "Left Control";
        if (key == 340) return "Left Shift";
        if (key == 290) return "F1";
        if (key == 291) return "F2";
        if (key == 292) return "F3";
        if (key == 293) return "F4";
        if (key == 294) return "F5";
        if (key == 295) return "F6";
        if (key == 296) return "F7";
        if (key == 297) return "F8";
        if (key == 298) return "F9";
        if (key == 299) return "F10";
        if (key == 300) return "F11";
        if (key == 301) return "F12";
        if (key >= 65 && key <= 90) return String.valueOf((char) key);
        return "Key_" + key;
    }

    @Override
    public void onClose() {
        ConfigManager.getInstance().save();
        if (this.parentScreen != null) {
            openScreen(this.parentScreen);
        } else {
            openScreen(null);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }
}

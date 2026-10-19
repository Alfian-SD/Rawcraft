package com.rawcraft.client.ui;

import com.rawcraft.client.command.ClientCommandHandler;
import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.hud.widgets.*;
import com.rawcraft.client.input.ClickTracker;
import com.rawcraft.client.input.KeybindManager;
import com.rawcraft.client.module.Module;
import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.module.ModuleStatus;
import com.rawcraft.client.module.impl.FullbrightModule;
import com.rawcraft.client.module.impl.ToggleSprintModule;
import com.rawcraft.client.performance.PerformanceManager;
import com.rawcraft.client.performance.PerformanceProfile;
import com.rawcraft.client.ui.components.RawCraftButton;
import com.rawcraft.client.ui.components.RawCraftSlider;
import com.rawcraft.client.ui.components.RawCraftToggle;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.network.chat.Component;

import java.awt.Desktop;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class RawCraftMenuScreen extends Screen {

    public enum Tab {
        HOME("⌂ Home"),
        PERFORMANCE("⚡ Performance"),
        HUD_STUDIO("▦ HUD"),
        MODULES("✦ Modules"),
        SETTINGS("⚙ Settings");

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

    // Toast Notification System
    private String toastMessage = null;
    private long toastExpiryTime = 0L;

    // Confirmation Modal System
    public static class ConfirmationModal {
        public final String title;
        public final String description;
        public final Runnable onConfirm;

        public ConfirmationModal(String title, String description, Runnable onConfirm) {
            this.title = title;
            this.description = description;
            this.onConfirm = onConfirm;
        }
    }
    private ConfirmationModal activeModal = null;

    // Keybind Listening Mode
    private boolean listeningForMenuKey = false;
    private boolean listeningForFullbrightKey = false;

    // Expanded HUD module cards
    private String expandedHudWidget = null;

    // Scrolling in Content Area
    private int scrollY = 0;
    private int maxScrollY = 0;

    // UI interactive component lists
    private final List<RawCraftButton> buttons = new ArrayList<>();
    private final List<RawCraftToggle> toggles = new ArrayList<>();
    private final List<RawCraftSlider> sliders = new ArrayList<>();

    public RawCraftMenuScreen(Screen parentScreen) {
        super(Component.literal("RawCraft Client"));
        this.parentScreen = parentScreen;
    }

    public static Screen getCurrentScreen() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null && mc.gui != null) {
            return mc.gui.screen();
        }
        return null;
    }

    public static void openScreen(Screen screen) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) return;
        try {
            mc.setScreenAndShow(screen);
        } catch (Throwable t1) {
            try {
                if (mc.gui != null) {
                    mc.gui.setScreen(screen);
                }
            } catch (Throwable t2) {
                System.err.println("[RawCraft] Could not open screen: " + t2.getMessage());
            }
        }
    }

    public void showToast(String message) {
        this.toastMessage = message;
        this.toastExpiryTime = System.currentTimeMillis() + 3000L;
    }

    @Override
    protected void init() {
        super.init();
        rebuildUI();
    }

    public void setActiveTab(Tab tab) {
        this.activeTab = tab;
        this.scrollY = 0;
        this.expandedHudWidget = null;
        rebuildUI();
    }

    private void rebuildUI() {
        buttons.clear();
        toggles.clear();
        sliders.clear();

        int panelW = Math.min(520, this.width - 24);
        int panelH = Math.min(340, this.height - 24);
        int panelX = (this.width - panelW) / 2;
        int panelY = (this.height - panelH) / 2;

        // 1. Header Close Button [ ✕ ]
        buttons.add(new RawCraftButton(panelX + panelW - 22, panelY + 4, 18, 18, "✕", () -> {
            onClose();
        }));

        // 2. Sidebar Tabs
        int tabY = panelY + 34;
        for (Tab t : Tab.values()) {
            final Tab currentTab = t;
            RawCraftButton tabBtn = new RawCraftButton(panelX + 6, tabY, 92, 24, t.getLabel(), () -> {
                this.activeTab = currentTab;
                this.scrollY = 0;
                this.expandedHudWidget = null;
                rebuildUI();
            });
            tabBtn.active = (activeTab == currentTab);
            buttons.add(tabBtn);
            tabY += 28;
        }

        // Bottom of Sidebar: [ ▦ Edit HUD ] button
        RawCraftButton editHudBtn = new RawCraftButton(panelX + 6, panelY + panelH - 30, 92, 22, "▦ Edit HUD", () -> {
            openScreen(new HudEditorScreen(this));
        });
        editHudBtn.secondary = true;
        buttons.add(editHudBtn);

        // 3. Content Area Setup
        int contentX = panelX + 106;
        int contentY = panelY + 34;
        int contentW = panelW - 114;
        int curY = contentY - scrollY;

        if (activeTab == Tab.HOME) {
            rebuildHomeTab(contentX, curY, contentW);
        } else if (activeTab == Tab.PERFORMANCE) {
            rebuildPerformanceTab(contentX, curY, contentW);
        } else if (activeTab == Tab.HUD_STUDIO) {
            rebuildHudTab(contentX, curY, contentW);
        } else if (activeTab == Tab.MODULES) {
            rebuildModulesTab(contentX, curY, contentW);
        } else if (activeTab == Tab.SETTINGS) {
            rebuildSettingsTab(contentX, curY, contentW);
        }
    }

    private void rebuildHomeTab(int cx, int startY, int cw) {
        int y = startY;

        // Quick Action Shortcuts
        int btnW = (cw - 8) / 3;
        buttons.add(new RawCraftButton(cx, y + 104, btnW, 24, "▦ HUD Studio", () -> {
            this.activeTab = Tab.HUD_STUDIO;
            this.scrollY = 0;
            rebuildUI();
        }));
        buttons.add(new RawCraftButton(cx + btnW + 4, y + 104, btnW, 24, "⚡ Performance", () -> {
            this.activeTab = Tab.PERFORMANCE;
            this.scrollY = 0;
            rebuildUI();
        }));
        buttons.add(new RawCraftButton(cx + (btnW * 2) + 8, y + 104, btnW, 24, "⚙ Settings", () -> {
            this.activeTab = Tab.SETTINGS;
            this.scrollY = 0;
            rebuildUI();
        }));

        // Quick Toggles in 2 columns
        int qy = y + 158;
        int colW = (cw - 6) / 2;

        // 1. Fullbright
        FullbrightModule fb = ModuleManager.getInstance().getModule(FullbrightModule.class);
        toggles.add(new RawCraftToggle(cx + colW - 32, qy + 4, 28, 14, fb != null && fb.isEnabled(), state -> {
            if (fb != null) fb.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "Fullbright: Enabled" : "Fullbright: Disabled");
        }));

        // 2. Toggle Sprint
        ToggleSprintModule ts = ModuleManager.getInstance().getModule(ToggleSprintModule.class);
        toggles.add(new RawCraftToggle(cx + cw - 32, qy + 4, 28, 14, ts != null && ts.isEnabled(), state -> {
            if (ts != null) ts.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "ToggleSprint: Enabled" : "ToggleSprint: Disabled");
        }));

        // 3. Weather Precipitation
        qy += 28;
        boolean rain = ConfigManager.getInstance().getConfig().modules.weather.precipitation;
        toggles.add(new RawCraftToggle(cx + colW - 32, qy + 4, 28, 14, rain, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.modules.weather.precipitation = state);
            showToast(state ? "Rain/Snow: Enabled" : "Rain/Snow: Muted");
        }));

        // 4. FPS HUD
        HudWidget fpsW = HudManager.getInstance().getWidget("fps");
        toggles.add(new RawCraftToggle(cx + cw - 32, qy + 4, 28, 14, fpsW != null && fpsW.isEnabled(), state -> {
            if (fpsW != null) fpsW.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "FPS HUD: Enabled" : "FPS HUD: Disabled");
        }));

        // 5. Keystrokes HUD
        qy += 28;
        HudWidget keyW = HudManager.getInstance().getWidget("keystrokes");
        toggles.add(new RawCraftToggle(cx + colW - 32, qy + 4, 28, 14, keyW != null && keyW.isEnabled(), state -> {
            if (keyW != null) keyW.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "Keystrokes: Enabled" : "Keystrokes: Disabled");
        }));

        // 6. CPS HUD
        HudWidget cpsW = HudManager.getInstance().getWidget("cps");
        toggles.add(new RawCraftToggle(cx + cw - 32, qy + 4, 28, 14, cpsW != null && cpsW.isEnabled(), state -> {
            if (cpsW != null) cpsW.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "CPS Counter: Enabled" : "CPS Counter: Disabled");
        }));

        this.maxScrollY = Math.max(0, (qy + 36) - (panelY() + 34 + panelH() - 54));
    }

    private void rebuildPerformanceTab(int cx, int startY, int cw) {
        int y = startY;
        PerformanceProfile cur = PerformanceManager.getInstance().getCurrentProfile();

        // 3 Profile Cards
        int cardW = (cw - 8) / 3;
        RawCraftButton lowBtn = new RawCraftButton(cx, y + 18, cardW, 46, "LOW", () -> {
            PerformanceManager.getInstance().applyProfile(PerformanceProfile.LOW);
            showToast("Applied Profile: LOW (6 Chunks)");
            rebuildUI();
        });
        lowBtn.active = (cur == PerformanceProfile.LOW);
        buttons.add(lowBtn);

        RawCraftButton balBtn = new RawCraftButton(cx + cardW + 4, y + 18, cardW, 46, "BALANCED", () -> {
            PerformanceManager.getInstance().applyProfile(PerformanceProfile.BALANCED);
            showToast("Applied Profile: BALANCED (10 Chunks)");
            rebuildUI();
        });
        balBtn.active = (cur == PerformanceProfile.BALANCED);
        buttons.add(balBtn);

        RawCraftButton qualBtn = new RawCraftButton(cx + (cardW * 2) + 8, y + 18, cardW, 46, "QUALITY", () -> {
            PerformanceManager.getInstance().applyProfile(PerformanceProfile.QUALITY);
            showToast("Applied Profile: QUALITY (16 Chunks)");
            rebuildUI();
        });
        qualBtn.active = (cur == PerformanceProfile.QUALITY);
        buttons.add(qualBtn);

        // Advanced Options Card
        int advY = y + 74;
        // 1. Render Distance Slider
        int vd = PerformanceManager.getInstance().getViewDistance();
        sliders.add(new RawCraftSlider(cx + 120, advY + 16, cw - 128, 16, vd, 2, 32, 1,
                val -> val.intValue() + " Chunks",
                val -> {
                    PerformanceManager.getInstance().setViewDistance(val.intValue());
                    PerformanceManager.getInstance().applyToGameOptions();
                    ConfigManager.getInstance().save();
                }));

        // 2. Simulation Distance Slider
        int sd = PerformanceManager.getInstance().getSimulationDistance();
        sliders.add(new RawCraftSlider(cx + 120, advY + 38, cw - 128, 16, sd, 2, 32, 1,
                val -> val.intValue() + " Chunks",
                val -> {
                    PerformanceManager.getInstance().setSimulationDistance(val.intValue());
                    PerformanceManager.getInstance().applyToGameOptions();
                    ConfigManager.getInstance().save();
                }));

        // 3. Clouds Cycle
        buttons.add(new RawCraftButton(cx + 120, advY + 60, 90, 18, PerformanceManager.getInstance().getClouds(), () -> {
            String c = PerformanceManager.getInstance().getClouds();
            String next = "OFF".equalsIgnoreCase(c) ? "FAST" : ("FAST".equalsIgnoreCase(c) ? "FANCY" : "OFF");
            PerformanceManager.getInstance().setClouds(next);
            PerformanceManager.getInstance().applyToGameOptions();
            ConfigManager.getInstance().save();
            rebuildUI();
        }));

        // 4. Particles Cycle
        buttons.add(new RawCraftButton(cx + 120, advY + 84, 90, 18, PerformanceManager.getInstance().getParticles(), () -> {
            String p = PerformanceManager.getInstance().getParticles();
            String next = "MINIMAL".equalsIgnoreCase(p) ? "DECREASED" : ("DECREASED".equalsIgnoreCase(p) ? "ALL" : "MINIMAL");
            PerformanceManager.getInstance().setParticles(next);
            PerformanceManager.getInstance().applyToGameOptions();
            ConfigManager.getInstance().save();
            rebuildUI();
        }));

        // 5. Entity Shadows Toggle
        boolean shadows = PerformanceManager.getInstance().isEntityShadows();
        toggles.add(new RawCraftToggle(cx + cw - 36, advY + 108, 28, 14, shadows, state -> {
            PerformanceManager.getInstance().setEntityShadows(state);
            PerformanceManager.getInstance().applyToGameOptions();
            ConfigManager.getInstance().save();
        }));

        // Weather Precipitation Toggle
        int wY = advY + 134;
        boolean rainState = ConfigManager.getInstance().getConfig().modules.weather.precipitation;
        toggles.add(new RawCraftToggle(cx + cw - 36, wY + 6, 28, 14, rainState, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.modules.weather.precipitation = state);
            showToast(state ? "Precipitation: ON" : "Precipitation: OFF");
        }));

        // Restore Vanilla Snapshot
        int rY = wY + 30;
        RawCraftButton restoreBtn = new RawCraftButton(cx + 4, rY + 8, cw - 8, 22, "Restore Vanilla Options Snapshot", () -> {
            this.activeModal = new ConfirmationModal("Restore Vanilla Options?",
                    "This will restore your original render distance, clouds, particles, and graphics options.",
                    () -> {
                        PerformanceManager.getInstance().restoreVanillaSnapshot();
                        showToast("Restored Vanilla Options Snapshot ✓");
                        rebuildUI();
                    });
        });
        restoreBtn.secondary = true;
        buttons.add(restoreBtn);

        this.maxScrollY = Math.max(0, (rY + 38) - (panelY() + 34 + panelH() - 54));
    }

    private void rebuildHudTab(int cx, int startY, int cw) {
        int y = startY;

        // Top Action Bar
        buttons.add(new RawCraftButton(cx, y, 110, 22, "▦ Open Editor", () -> {
            openScreen(new HudEditorScreen(this));
        }));

        buttons.add(new RawCraftButton(cx + 114, y, 84, 22, "Reset All", () -> {
            this.activeModal = new ConfirmationModal("Reset HUD Positions?",
                    "This will reset all 8 HUD widgets to their default screen positions.",
                    () -> {
                        ConfigData def = ConfigData.createDefault();
                        ConfigManager.getInstance().update(cfg -> cfg.hud = def.hud);
                        HudManager.getInstance().syncFromConfig();
                        showToast("HUD Layout Reset to Defaults ✓");
                        rebuildUI();
                    });
        }));

        boolean hideOnF3 = ConfigManager.getInstance().getConfig().hud.hideOnF3;
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 4, 28, 14, hideOnF3, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.hud.hideOnF3 = state);
            showToast(state ? "Hide HUD on F3: ON" : "Hide HUD on F3: OFF");
        }));

        y += 28;

        // 8 HUD Cards
        for (HudWidget widget : HudManager.getInstance().getWidgets()) {
            final HudWidget w = widget;
            boolean isExpanded = w.getName().equalsIgnoreCase(expandedHudWidget);
            int cardH = isExpanded ? 90 : 32;

            // Toggle switch on card
            toggles.add(new RawCraftToggle(cx + cw - 32, y + 9, 28, 14, w.isEnabled(), state -> {
                w.setEnabled(state);
                ConfigManager.getInstance().save();
            }));

            // Locate button
            buttons.add(new RawCraftButton(cx + cw - 88, y + 6, 52, 20, "Locate", () -> {
                HudEditorScreen editor = new HudEditorScreen(this);
                editor.selectWidget(w);
                openScreen(editor);
            }));

            // Expand options button
            buttons.add(new RawCraftButton(cx + cw - 124, y + 6, 32, 20, isExpanded ? "▲" : "⚙", () -> {
                this.expandedHudWidget = isExpanded ? null : w.getName();
                rebuildUI();
            }));

            if (isExpanded) {
                // Controls inside expanded card
                int expY = y + 36;
                // Scale Slider
                sliders.add(new RawCraftSlider(cx + 50, expY, 80, 16, w.getScale(), 0.5, 2.0, 0.1,
                        val -> String.format(Locale.ROOT, "%.1fx", val),
                        val -> {
                            w.setScale(val);
                            ConfigManager.getInstance().save();
                        }));

                // Shadow Toggle
                toggles.add(new RawCraftToggle(cx + 180, expY + 1, 28, 14, w.isShadow(), state -> {
                    w.setShadow(state);
                    ConfigManager.getInstance().save();
                }));

                // Background cycle
                buttons.add(new RawCraftButton(cx + 250, expY - 1, 80, 18, w.getBackgroundMode().toUpperCase(), () -> {
                    String cur = w.getBackgroundMode();
                    String next = "off".equalsIgnoreCase(cur) ? "solid" : ("solid".equalsIgnoreCase(cur) ? "translucent" : "off");
                    w.setBackgroundMode(next);
                    ConfigManager.getInstance().save();
                    rebuildUI();
                }));
            }

            y += cardH + 6;
        }

        this.maxScrollY = Math.max(0, y - (panelY() + 34 + panelH() - 54));
    }

    private void rebuildModulesTab(int cx, int startY, int cw) {
        int y = startY;

        // 1. Fullbright Module Card
        FullbrightModule fb = ModuleManager.getInstance().getModule(FullbrightModule.class);
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 8, 28, 14, fb != null && fb.isEnabled(), state -> {
            if (fb != null) fb.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "Fullbright: ON" : "Fullbright: OFF");
        }));

        double strength = ConfigManager.getInstance().getConfig().modules.fullbright.strength;
        sliders.add(new RawCraftSlider(cx + 90, y + 42, 120, 16, strength, 1.0, 15.0, 1.0,
                val -> String.format(Locale.ROOT, "%.0fx", val),
                val -> {
                    ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.strength = val);
                }));

        Integer fbKey = ConfigManager.getInstance().getConfig().modules.fullbright.keybind;
        String keyLabel = listeningForFullbrightKey ? "Press key..." : (fbKey != null ? KeybindManager.getKeyName(fbKey) : "None");
        buttons.add(new RawCraftButton(cx + cw - 70, y + 40, 64, 18, keyLabel, () -> {
            this.listeningForFullbrightKey = !this.listeningForFullbrightKey;
            rebuildUI();
        }));

        y += 82;

        // 2. Toggle Sprint & Auto Run Card
        ToggleSprintModule ts = ModuleManager.getInstance().getModule(ToggleSprintModule.class);
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 8, 28, 14, ts != null && ts.isEnabled(), state -> {
            if (ts != null) ts.setEnabled(state);
            ConfigManager.getInstance().save();
            showToast(state ? "ToggleSprint: ON" : "ToggleSprint: OFF");
        }));

        boolean showLabel = ts != null && ts.isShowStatusLabel();
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 36, 28, 14, showLabel, state -> {
            if (ts != null) {
                ConfigManager.getInstance().update(cfg -> cfg.modules.toggleSprint.showStatusHud = state);
            }
        }));

        boolean autoRun = ts != null && ts.isAutoRunActive();
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 56, 28, 14, autoRun, state -> {
            if (ts != null) ts.setAutoRunActive(state);
            showToast(state ? "Auto Run: Active" : "Auto Run: Stopped");
        }));

        y += 86;

        // 3. Weather Precipitation Card
        boolean precip = ConfigManager.getInstance().getConfig().modules.weather.precipitation;
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 8, 28, 14, precip, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.modules.weather.precipitation = state);
            showToast(state ? "Precipitation: ON" : "Precipitation: OFF");
        }));

        boolean muteSound = ConfigManager.getInstance().getConfig().modules.weather.muteRainSound;
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 34, 28, 14, muteSound, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.modules.weather.muteRainSound = state);
            showToast(state ? "Mute Rain Sound: ON" : "Mute Rain Sound: OFF");
        }));

        y += 62;

        this.maxScrollY = Math.max(0, (y + 40) - (panelY() + 34 + panelH() - 54));
    }

    private void rebuildSettingsTab(int cx, int startY, int cw) {
        int y = startY;

        // General Card
        String menuKeyName = listeningForMenuKey ? "Press key..." : KeybindManager.getInstance().getCurrentKeyName();
        buttons.add(new RawCraftButton(cx + cw - 88, y + 8, 80, 20, menuKeyName, () -> {
            this.listeningForMenuKey = !this.listeningForMenuKey;
            rebuildUI();
        }));

        boolean pauseOnOpen = ConfigManager.getInstance().getConfig().ui.pauseOnOpen;
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 36, 28, 14, pauseOnOpen, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.ui.pauseOnOpen = state);
        }));

        y += 64;

        // CPS Sampling Window Card
        double curWin = ConfigManager.getInstance().getConfig().cps.samplingWindowSec;
        sliders.add(new RawCraftSlider(cx + 120, y + 8, cw - 128, 16, curWin, 0.5, 5.0, 0.5,
                val -> String.format(Locale.ROOT, "%.1f sec", val),
                val -> {
                    ConfigManager.getInstance().update(cfg -> cfg.cps.samplingWindowSec = val);
                    ClickTracker.getInstance().setWindowMs((long) (val * 1000.0));
                }));

        boolean ignoreScreens = ConfigManager.getInstance().getConfig().cps.ignoreWhenScreenOpen;
        toggles.add(new RawCraftToggle(cx + cw - 32, y + 34, 28, 14, ignoreScreens, state -> {
            ConfigManager.getInstance().update(cfg -> cfg.cps.ignoreWhenScreenOpen = state);
        }));

        y += 60;

        // Data Management Card
        int dataBtnW = (cw - 8) / 3;
        buttons.add(new RawCraftButton(cx, y + 16, dataBtnW, 22, "Open Folder", () -> {
            try {
                File dir = new File("config/rawcraft");
                if (dir.exists()) Desktop.getDesktop().open(dir);
            } catch (Throwable t) {
                showToast("Cannot open folder: " + t.getMessage());
            }
        }));

        buttons.add(new RawCraftButton(cx + dataBtnW + 4, y + 16, dataBtnW, 22, "Copy JSON", () -> {
            try {
                Gson gson = new GsonBuilder().setPrettyPrinting().create();
                String json = gson.toJson(ConfigManager.getInstance().getConfig());
                Minecraft.getInstance().keyboardHandler.setClipboard(json);
                showToast("Config copied to clipboard ✓");
            } catch (Throwable t) {
                showToast("Export failed: " + t.getMessage());
            }
        }));

        buttons.add(new RawCraftButton(cx + (dataBtnW * 2) + 8, y + 16, dataBtnW, 22, "Diagnostics", () -> {
            String diag = ClientCommandHandler.getDiagnosticsText();
            Minecraft.getInstance().keyboardHandler.setClipboard(diag);
            showToast("Diagnostics copied to clipboard ✓");
        }));

        // Factory Reset Button
        RawCraftButton resetBtn = new RawCraftButton(cx, y + 44, cw, 22, "Factory Reset Client Defaults", () -> {
            this.activeModal = new ConfirmationModal("Factory Reset All Settings?",
                    "This will restore all HUD positions, profiles, and keybinds to defaults.",
                    () -> {
                        ConfigManager.getInstance().resetToDefaults();
                        showToast("Factory Reset Completed ✓");
                        rebuildUI();
                    });
        });
        resetBtn.danger = true;
        buttons.add(resetBtn);

        y += 76;

        this.maxScrollY = Math.max(0, (y + 30) - (panelY() + 34 + panelH() - 54));
    }

    private int panelW() { return Math.min(520, this.width - 24); }
    private int panelH() { return Math.min(340, this.height - 24); }
    private int panelX() { return (this.width - panelW()) / 2; }
    private int panelY() { return (this.height - panelH()) / 2; }

    @Override
    public void extractRenderState(GuiGraphicsExtractor extractor, int mouseX, int mouseY, float delta) {
        Font font = this.font != null ? this.font : Minecraft.getInstance().font;

        // 1. Scrim overlay behind main menu
        extractor.fill(0, 0, this.width, this.height, RawCraftTheme.BG_SCRIM);

        int px = panelX();
        int py = panelY();
        int pw = panelW();
        int ph = panelH();

        // 2. Main Dark Purple Shell Panel
        extractor.fill(px, py, px + pw, py + ph, RawCraftTheme.BG_PANEL);
        extractor.outline(px, py, pw, ph, RawCraftTheme.BORDER_SUBTLE);

        // 3. Header
        extractor.fill(px, py, px + pw, py + 28, 0xFF160F2B);
        extractor.outline(px, py, pw, 28, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "◆ RawCraft Client", px + 8, py + 10, RawCraftTheme.TEXT_PRIMARY, true);
        extractor.text(font, "MC 26.2 · Fabric · v1.0", px + 115, py + 10, RawCraftTheme.TEXT_SECONDARY, false);

        // 4. Sidebar Panel
        int sideW = 100;
        extractor.fill(px, py + 28, px + sideW, py + ph - 22, RawCraftTheme.BG_SURFACE);
        extractor.fill(px + sideW - 1, py + 28, px + sideW, py + ph - 22, RawCraftTheme.BORDER_SUBTLE);

        int contentX = px + 104;
        int contentY = py + 30;
        int contentW = pw - 108;
        int contentH = ph - 54;

        // Render Sidebar and Header buttons (outside scissor)
        for (RawCraftButton btn : buttons) {
            if (btn.x < contentX || btn.y < contentY) {
                btn.render(extractor, font, mouseX, mouseY);
            }
        }

        // 5. Footer Bar
        extractor.fill(px, py + ph - 22, px + pw, py + ph, 0xFF160F2B);
        extractor.fill(px, py + ph - 22, px + pw, py + ph - 21, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Esc: close   ·   RightShift: toggle", px + 8, py + ph - 15, RawCraftTheme.TEXT_SECONDARY, false);

        // Check if pending toast from config
        String pending = ConfigManager.getInstance().consumePendingToast();
        if (pending != null) {
            showToast(pending);
        }

        // Render saved indicator or toast in footer
        if (toastMessage != null && System.currentTimeMillis() < toastExpiryTime) {
            extractor.text(font, toastMessage, px + pw - font.width(toastMessage) - 8, py + ph - 15, RawCraftTheme.SUCCESS, true);
        } else {
            extractor.text(font, "Saved ✓", px + pw - 48, py + ph - 15, RawCraftTheme.SUCCESS, false);
        }

        // 6. Content Area Scissor & Custom Card Backgrounds
        extractor.enableScissor(contentX, contentY, contentW, contentH);

        int curY = contentY - scrollY;

        if (activeTab == Tab.HOME) {
            renderHomeContent(extractor, font, contentX, curY, contentW);
        } else if (activeTab == Tab.PERFORMANCE) {
            renderPerformanceContent(extractor, font, contentX, curY, contentW);
        } else if (activeTab == Tab.HUD_STUDIO) {
            renderHudContent(extractor, font, contentX, curY, contentW);
        } else if (activeTab == Tab.MODULES) {
            renderModulesContent(extractor, font, contentX, curY, contentW);
        } else if (activeTab == Tab.SETTINGS) {
            renderSettingsContent(extractor, font, contentX, curY, contentW);
        }

        // Render interactive components inside scissored area
        for (RawCraftButton btn : buttons) {
            if (btn.x >= contentX && btn.y >= contentY - 30 && btn.y <= contentY + contentH + 30) {
                btn.render(extractor, font, mouseX, mouseY);
            }
        }
        for (RawCraftToggle t : toggles) {
            if (t.y >= contentY - 30 && t.y <= contentY + contentH + 30) {
                t.render(extractor, font, mouseX, mouseY);
            }
        }
        for (RawCraftSlider s : sliders) {
            if (s.y >= contentY - 30 && s.y <= contentY + contentH + 30) {
                s.render(extractor, font, mouseX, mouseY);
            }
        }

        extractor.disableScissor();

        // 7. Scrollbar
        if (maxScrollY > 0) {
            int sbX = px + pw - 5;
            int sbY = contentY;
            int sbH = contentH;
            extractor.fill(sbX, sbY, sbX + 3, sbY + sbH, 0xFF1B1334);
            int thumbH = Math.max(16, (int) ((float) contentH / (contentH + maxScrollY) * sbH));
            int thumbY = sbY + (int) (((float) scrollY / maxScrollY) * (sbH - thumbH));
            extractor.fill(sbX, thumbY, sbX + 3, thumbY + thumbH, RawCraftTheme.ACCENT);
        }

        // 8. Confirmation Modal Overlay
        if (activeModal != null) {
            extractor.fill(0, 0, this.width, this.height, 0xBB000000);
            int mW = 240;
            int mH = 100;
            int mX = (this.width - mW) / 2;
            int mY = (this.height - mH) / 2;

            extractor.fill(mX, mY, mX + mW, mY + mH, 0xFF140D26);
            extractor.outline(mX, mY, mW, mH, RawCraftTheme.ACCENT);

            extractor.text(font, activeModal.title, mX + 12, mY + 12, RawCraftTheme.TEXT_PRIMARY, true);
            extractor.textWithWordWrap(font, Component.literal(activeModal.description), mX + 12, mY + 28, mW - 24, RawCraftTheme.TEXT_SECONDARY);

            // Cancel button
            RawCraftButton cancelBtn = new RawCraftButton(mX + 12, mY + mH - 26, 90, 18, "Cancel", () -> {
                activeModal = null;
            });
            cancelBtn.secondary = true;
            cancelBtn.render(extractor, font, mouseX, mouseY);

            // Confirm button
            RawCraftButton confBtn = new RawCraftButton(mX + mW - 102, mY + mH - 26, 90, 18, "Confirm", () -> {
                Runnable action = activeModal.onConfirm;
                activeModal = null;
                if (action != null) action.run();
            });
            confBtn.danger = true;
            confBtn.render(extractor, font, mouseX, mouseY);
        }
    }

    private void renderHomeContent(GuiGraphicsExtractor extractor, Font font, int cx, int y, int cw) {
        // 1. Welcome Card
        extractor.fill(cx, y + 4, cx + cw, y + 44, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y + 4, cw, 40, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "RawCraft Client Dashboard", cx + 8, y + 10, RawCraftTheme.TEXT_PRIMARY, true);
        String prof = PerformanceManager.getInstance().getCurrentProfile().name();
        long activeMods = ModuleManager.getInstance().getModules().stream().filter(Module::isEnabled).count();
        extractor.text(font, "Profile: §a● " + prof + "§r    Active Modules: §d" + activeMods + " / 11§r", cx + 8, y + 26, RawCraftTheme.TEXT_SECONDARY, false);

        // 2. Live Stats Cards (4 mini cards)
        int gw = (cw - 12) / 4;
        int statY = y + 50;

        // FPS
        extractor.fill(cx, statY, cx + gw, statY + 44, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, statY, gw, 44, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "FPS", cx + 6, statY + 6, RawCraftTheme.TEXT_SECONDARY, false);
        extractor.text(font, String.valueOf(Minecraft.getInstance().getFps()), cx + 6, statY + 22, RawCraftTheme.SUCCESS, true);

        // Ping
        extractor.fill(cx + gw + 4, statY, cx + (gw * 2) + 4, statY + 44, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + gw + 4, statY, gw, 44, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "PING", cx + gw + 10, statY + 6, RawCraftTheme.TEXT_SECONDARY, false);
        String pingText = (Minecraft.getInstance().getConnection() == null || Minecraft.getInstance().isLocalServer()) ? "— (SP)" : "32 ms";
        extractor.text(font, pingText, cx + gw + 10, statY + 22, RawCraftTheme.TEXT_PRIMARY, true);

        // RAM
        extractor.fill(cx + (gw * 2) + 8, statY, cx + (gw * 3) + 8, statY + 44, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + (gw * 2) + 8, statY, gw, 44, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "RAM", cx + (gw * 2) + 14, statY + 6, RawCraftTheme.TEXT_SECONDARY, false);
        long maxRam = Runtime.getRuntime().maxMemory() / (1024 * 1024);
        long usedRam = (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024);
        extractor.text(font, String.format(Locale.ROOT, "%.1fG", usedRam / 1024.0), cx + (gw * 2) + 14, statY + 22, RawCraftTheme.TEXT_PRIMARY, true);

        // Chunks
        extractor.fill(cx + (gw * 3) + 12, statY, cx + cw, statY + 44, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + (gw * 3) + 12, statY, cw - (gw * 3) - 12, 44, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "CHUNKS", cx + (gw * 3) + 18, statY + 6, RawCraftTheme.TEXT_SECONDARY, false);
        extractor.text(font, PerformanceManager.getInstance().getViewDistance() + "c", cx + (gw * 3) + 18, statY + 22, RawCraftTheme.TEXT_PRIMARY, true);

        // Quick Toggles Header
        extractor.text(font, "Quick Toggles", cx, y + 140, RawCraftTheme.TEXT_PRIMARY, true);
        int qy = y + 158;
        int colW = (cw - 6) / 2;

        extractor.fill(cx, qy, cx + colW, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Fullbright", cx + 8, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);

        extractor.fill(cx + colW + 6, qy, cx + cw, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + colW + 6, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Toggle Sprint", cx + colW + 14, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);

        qy += 28;
        extractor.fill(cx, qy, cx + colW, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Weather Rain/Snow", cx + 8, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);

        extractor.fill(cx + colW + 6, qy, cx + cw, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + colW + 6, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "FPS Telemetry HUD", cx + colW + 14, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);

        qy += 28;
        extractor.fill(cx, qy, cx + colW, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Keystrokes HUD", cx + 8, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);

        extractor.fill(cx + colW + 6, qy, cx + cw, qy + 24, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx + colW + 6, qy, colW, 24, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "CPS Counter HUD", cx + colW + 14, qy + 7, RawCraftTheme.TEXT_PRIMARY, false);
    }

    private void renderPerformanceContent(GuiGraphicsExtractor extractor, Font font, int cx, int y, int cw) {
        extractor.text(font, "Performance Profiles", cx, y + 4, RawCraftTheme.TEXT_PRIMARY, true);

        int advY = y + 74;
        extractor.fill(cx, advY, cx + cw, advY + 126, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, advY, cw, 126, RawCraftTheme.BORDER_SUBTLE);

        extractor.text(font, "Render Distance", cx + 8, advY + 20, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Simulation Dist", cx + 8, advY + 42, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Clouds Quality", cx + 8, advY + 64, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Particles Quality", cx + 8, advY + 88, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Entity Shadows", cx + 8, advY + 110, RawCraftTheme.TEXT_PRIMARY, false);

        int wY = advY + 134;
        extractor.fill(cx, wY, cx + cw, wY + 26, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, wY, cw, 26, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Weather Precipitation (Boost FPS)", cx + 8, wY + 8, RawCraftTheme.TEXT_PRIMARY, false);
    }

    private void renderHudContent(GuiGraphicsExtractor extractor, Font font, int cx, int y, int cw) {
        extractor.text(font, "Hide HUD on F3", cx + cw - 120, y + 6, RawCraftTheme.TEXT_SECONDARY, false);
        y += 28;

        for (HudWidget w : HudManager.getInstance().getWidgets()) {
            boolean isExpanded = w.getName().equalsIgnoreCase(expandedHudWidget);
            int cardH = isExpanded ? 90 : 32;

            extractor.fill(cx, y, cx + cw, y + cardH, RawCraftTheme.BG_SURFACE);
            extractor.outline(cx, y, cw, cardH, RawCraftTheme.BORDER_SUBTLE);

            // Status Badge
            int badgeColor = w.isEnabled() ? RawCraftTheme.SUCCESS : RawCraftTheme.BORDER_SUBTLE;
            String badgeText = w.isEnabled() ? "ACTIVE" : "DISABLED";
            extractor.fill(cx + 6, y + 8, cx + 54, y + 24, badgeColor);
            extractor.text(font, badgeText, cx + 10, y + 12, 0xFFFFFFFF, false);

            extractor.text(font, w.getName(), cx + 62, y + 12, RawCraftTheme.TEXT_PRIMARY, true);

            if (isExpanded) {
                int expY = y + 36;
                extractor.text(font, "Scale", cx + 8, expY + 4, RawCraftTheme.TEXT_SECONDARY, false);
                extractor.text(font, "Shadow", cx + 138, expY + 4, RawCraftTheme.TEXT_SECONDARY, false);
                extractor.text(font, "BG Mode", cx + 214, expY + 4, RawCraftTheme.TEXT_SECONDARY, false);
            }

            y += cardH + 6;
        }
    }

    private void renderModulesContent(GuiGraphicsExtractor extractor, Font font, int cx, int y, int cw) {
        // Fullbright
        extractor.fill(cx, y, cx + cw, y + 74, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 74, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Fullbright (Gamma Boost)", cx + 8, y + 8, RawCraftTheme.TEXT_PRIMARY, true);
        extractor.text(font, "Boosts ambient cave lighting without requiring torches.", cx + 8, y + 22, RawCraftTheme.TEXT_SECONDARY, false);
        extractor.text(font, "Multiplier", cx + 8, y + 46, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Keybind", cx + cw - 120, y + 46, RawCraftTheme.TEXT_SECONDARY, false);
        y += 82;

        // Toggle Sprint
        extractor.fill(cx, y, cx + cw, y + 78, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 78, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Toggle Sprint & Auto Run", cx + 8, y + 8, RawCraftTheme.TEXT_PRIMARY, true);
        extractor.text(font, "Display Sprinting label in HUD", cx + 8, y + 38, RawCraftTheme.TEXT_SECONDARY, false);
        extractor.text(font, "Auto Run (Continuously walk forward)", cx + 8, y + 58, RawCraftTheme.TEXT_SECONDARY, false);
        y += 86;

        // Weather
        extractor.fill(cx, y, cx + cw, y + 54, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 54, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Weather Precipitation", cx + 8, y + 8, RawCraftTheme.TEXT_PRIMARY, true);
        extractor.text(font, "Mute Rain Sound Effects", cx + 8, y + 36, RawCraftTheme.TEXT_SECONDARY, false);
        y += 62;

        // Notice
        extractor.fill(cx, y, cx + cw, y + 28, 0xFF17102B);
        extractor.outline(cx, y, cw, 28, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "💡 Custom Crosshair & Armor Durability are configured in the HUD tab.", cx + 6, y + 9, RawCraftTheme.ACCENT_HOVER, false);
    }

    private void renderSettingsContent(GuiGraphicsExtractor extractor, Font font, int cx, int y, int cw) {
        // General
        extractor.fill(cx, y, cx + cw, y + 56, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 56, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Client Menu Keybind", cx + 8, y + 12, RawCraftTheme.TEXT_PRIMARY, true);
        extractor.text(font, "Pause game when menu open", cx + 8, y + 38, RawCraftTheme.TEXT_SECONDARY, false);
        y += 64;

        // CPS
        extractor.fill(cx, y, cx + cw, y + 52, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 52, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "CPS Window", cx + 8, y + 12, RawCraftTheme.TEXT_PRIMARY, false);
        extractor.text(font, "Ignore clicks in screens", cx + 8, y + 34, RawCraftTheme.TEXT_SECONDARY, false);
        y += 60;

        // Data
        extractor.fill(cx, y, cx + cw, y + 74, RawCraftTheme.BG_SURFACE);
        extractor.outline(cx, y, cw, 74, RawCraftTheme.BORDER_SUBTLE);
        extractor.text(font, "Data & Config Storage", cx + 8, y + 6, RawCraftTheme.TEXT_PRIMARY, false);
    }

    @Override
    public boolean mouseClicked(MouseButtonEvent event, boolean isDoubleClick) {
        int mx = (int) event.x();
        int my = (int) event.y();
        int button = event.button();

        // 1. If Modal is open, handle modal buttons only
        if (activeModal != null) {
            int mW = 240;
            int mH = 100;
            int mX = (this.width - mW) / 2;
            int mY = (this.height - mH) / 2;

            if (button == 0) {
                // Cancel
                if (mx >= mX + 12 && mx <= mX + 102 && my >= mY + mH - 26 && my <= mY + mH - 8) {
                    activeModal = null;
                    return true;
                }
                // Confirm
                if (mx >= mX + mW - 102 && mx <= mX + mW - 12 && my >= mY + mH - 26 && my <= mY + mH - 8) {
                    Runnable r = activeModal.onConfirm;
                    activeModal = null;
                    if (r != null) r.run();
                    return true;
                }
            }
            return true;
        }

        // 2. Buttons click
        for (RawCraftButton btn : buttons) {
            if (btn.mouseClicked(mx, my, button)) {
                return true;
            }
        }

        // 3. Toggles click
        for (RawCraftToggle t : toggles) {
            if (t.mouseClicked(mx, my, button)) {
                return true;
            }
        }

        // 4. Sliders click
        for (RawCraftSlider s : sliders) {
            if (s.mouseClicked(mx, my, button)) {
                return true;
            }
        }

        return super.mouseClicked(event, isDoubleClick);
    }

    @Override
    public boolean mouseReleased(MouseButtonEvent event) {
        for (RawCraftSlider s : sliders) {
            s.mouseReleased(event.button());
        }
        return super.mouseReleased(event);
    }

    @Override
    public boolean mouseDragged(MouseButtonEvent event, double deltaX, double deltaY) {
        for (RawCraftSlider s : sliders) {
            s.mouseDragged((int) event.x());
        }
        return super.mouseDragged(event, deltaX, deltaY);
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontalAmount, double verticalAmount) {
        if (maxScrollY > 0 && verticalAmount != 0) {
            this.scrollY = Math.max(0, Math.min(maxScrollY, (int) (this.scrollY - (verticalAmount * 16))));
            rebuildUI();
            return true;
        }
        return super.mouseScrolled(mouseX, mouseY, horizontalAmount, verticalAmount);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        int key = event.key();

        // 1. Listening for menu keybind
        if (listeningForMenuKey) {
            String name = KeybindManager.getKeyName(key);
            KeybindManager.getInstance().setKey(key, name);
            ConfigManager.getInstance().update(cfg -> {
                cfg.guiKeybind = name;
                cfg.ui.openKeyCode = key;
                cfg.ui.openKeyName = name;
            });
            listeningForMenuKey = false;
            showToast("Menu Key set to: " + name);
            rebuildUI();
            return true;
        }

        // 2. Listening for Fullbright keybind
        if (listeningForFullbrightKey) {
            if (key == 256 || key == 259) { // ESC or Backspace = unbind
                ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.keybind = null);
                showToast("Fullbright hotkey unbinded");
            } else {
                ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.keybind = key);
                showToast("Fullbright hotkey set to: " + KeybindManager.getKeyName(key));
            }
            listeningForFullbrightKey = false;
            rebuildUI();
            return true;
        }

        // 3. Escape key closes modal or menu
        if (key == 256) {
            if (activeModal != null) {
                activeModal = null;
                return true;
            }
            onClose();
            return true;
        }

        return super.keyPressed(event);
    }

    @Override
    public void onClose() {
        ConfigManager.getInstance().saveNow();
        if (parentScreen != null) {
            openScreen(parentScreen);
        } else {
            openScreen(null);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return ConfigManager.getInstance().getConfig().ui.pauseOnOpen;
    }
}

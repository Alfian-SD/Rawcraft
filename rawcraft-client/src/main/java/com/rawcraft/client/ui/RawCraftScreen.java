package com.rawcraft.client.ui;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.input.ClickTracker;
import com.rawcraft.client.input.KeybindManager;
import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.modules.ModuleManager;
import com.rawcraft.client.performance.PerformanceManager;
import com.rawcraft.client.performance.PerformanceProfile;
import com.rawcraft.client.ui.components.RawCraftButton;
import com.rawcraft.client.ui.components.RawCraftSearchField;

import java.util.ArrayList;
import java.util.List;

public class RawCraftScreen {
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

    private Tab activeTab = Tab.HOME;
    private ModuleCategory activeCategory = null;
    private String searchQuery = "";
    private final List<RawCraftButton> buttons = new ArrayList<>();
    private RawCraftSearchField searchField;
    private boolean listeningForKeybind = false;

    // Viewport dimensions
    public int width = 850;
    public int height = 540;

    public RawCraftScreen() {
        initUI();
    }

    public void initUI() {
        buttons.clear();

        // Search field for modules
        searchField = new RawCraftSearchField(250, 48, 220, 26, (text) -> {
            this.searchQuery = text;
        });

        // Top / Sidebar Navigation buttons
        int navY = 56;
        for (Tab t : Tab.values()) {
            final Tab tabRef = t;
            RawCraftButton navBtn = new RawCraftButton(24, navY, 150, 32, t.getLabel(), () -> {
                this.activeTab = tabRef;
                initUI();
            });
            navBtn.active = (activeTab == t);
            buttons.add(navBtn);
            navY += 38;
        }

        if (activeTab == Tab.HOME) {
            buttons.add(new RawCraftButton(210, 260, 160, 32, "Open HUD Studio", () -> {
                this.activeTab = Tab.HUD_STUDIO;
                initUI();
            }));
            buttons.add(new RawCraftButton(380, 260, 160, 32, "Performance Engine", () -> {
                this.activeTab = Tab.PERFORMANCE;
                initUI();
            }));
        } else if (activeTab == Tab.PERFORMANCE) {
            // Profile selector buttons
            buttons.add(new RawCraftButton(210, 60, 140, 48, "LOW // 6 Chunks", () -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.LOW);
                ConfigManager.getInstance().save();
            }));
            buttons.add(new RawCraftButton(360, 60, 140, 48, "BALANCED // 10 Chunks", () -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.BALANCED);
                ConfigManager.getInstance().save();
            }));
            buttons.add(new RawCraftButton(510, 60, 140, 48, "QUALITY // 16 Chunks", () -> {
                PerformanceManager.getInstance().applyProfile(PerformanceProfile.QUALITY);
                ConfigManager.getInstance().save();
            }));
            buttons.add(new RawCraftButton(210, 440, 200, 30, "Restore Vanilla Snapshot", () -> {
                PerformanceManager.getInstance().restoreVanillaSnapshot();
                ConfigManager.getInstance().save();
            }));
        } else if (activeTab == Tab.MODULES) {
            // Category filter pills
            int catX = 480;
            buttons.add(new RawCraftButton(catX, 48, 48, 26, "ALL", () -> {
                this.activeCategory = null;
            }));
            catX += 54;
            for (ModuleCategory cat : ModuleCategory.values()) {
                final ModuleCategory cRef = cat;
                buttons.add(new RawCraftButton(catX, 48, 62, 26, cat.name(), () -> {
                    this.activeCategory = cRef;
                }));
                catX += 68;
            }
        } else if (activeTab == Tab.SETTINGS) {
            buttons.add(new RawCraftButton(210, 140, 180, 32, "Click GUI: " + KeybindManager.getInstance().getCurrentKeyName(), () -> {
                this.listeningForKeybind = !this.listeningForKeybind;
            }));
            buttons.add(new RawCraftButton(210, 200, 180, 32, "Window: " + (ClickTracker.getInstance().getWindowMs() / 1000) + ".0s", () -> {
                long cur = ClickTracker.getInstance().getWindowMs();
                ClickTracker.getInstance().setWindowMs(cur == 1000L ? 2000L : 1000L);
                ConfigManager.getInstance().save();
                initUI();
            }));
            buttons.add(new RawCraftButton(210, 300, 180, 32, "Factory Reset Defaults", () -> {
                ConfigManager.getInstance().resetToDefaults();
                initUI();
            }));
        }
    }

    public Tab getActiveTab() {
        return activeTab;
    }

    public void setActiveTab(Tab activeTab) {
        this.activeTab = activeTab;
        initUI();
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (activeTab == Tab.MODULES && searchField != null) {
            searchField.mouseClicked(mouseX, mouseY, button);
        }

        for (RawCraftButton btn : buttons) {
            if (btn.mouseClicked(mouseX, mouseY, button)) {
                return true;
            }
        }
        return false;
    }

    public boolean keyPressed(int keyCode, int scanCode, int modifiers) {
        if (listeningForKeybind) {
            // Set new key
            KeybindManager.getInstance().setKey(keyCode, "Key_" + keyCode);
            ConfigManager.getInstance().getCurrentConfig().guiKeybind = "Key_" + keyCode;
            ConfigManager.getInstance().save();
            this.listeningForKeybind = false;
            initUI();
            return true;
        }

        if (activeTab == Tab.MODULES && searchField != null && searchField.focused) {
            return searchField.keyPressed(keyCode);
        }

        // 256 = GLFW.GLFW_KEY_ESCAPE
        if (keyCode == 256) {
            ConfigManager.getInstance().save();
            return true;
        }
        return false;
    }

    public boolean charTyped(char chr, int modifiers) {
        if (activeTab == Tab.MODULES && searchField != null && searchField.focused) {
            return searchField.charTyped(chr);
        }
        return false;
    }

    public void render(Object drawContext, int mouseX, int mouseY, float delta) {
        // Native rendering via DrawContext
    }
}

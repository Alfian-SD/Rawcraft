package com.rawcraft.client.hud;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.widgets.*;

import java.util.*;

public class HudManager {
    private static HudManager instance;
    private final Map<String, HudWidget> widgets = new LinkedHashMap<>();

    private HudManager() {
        register(new FpsWidget());
        register(new PingWidget());
        register(new CoordsWidget());
        register(new KeystrokesWidget());
        register(new CpsWidget());
        register(new PotionHudWidget());
        register(new ArmorHudWidget());
        register(new CustomCrosshairWidget());

        syncFromConfig();
    }

    public static synchronized HudManager getInstance() {
        if (instance == null) {
            instance = new HudManager();
        }
        return instance;
    }

    public void register(HudWidget widget) {
        widgets.put(widget.getId(), widget);
    }

    public Collection<HudWidget> getWidgets() {
        return Collections.unmodifiableCollection(widgets.values());
    }

    @SuppressWarnings("unchecked")
    public <T extends HudWidget> T getWidget(Class<T> clazz) {
        for (HudWidget w : widgets.values()) {
            if (clazz.isInstance(w)) {
                return (T) w;
            }
        }
        return null;
    }

    public HudWidget getWidget(String id) {
        return widgets.get(id);
    }

    public int getActiveCount() {
        int count = 0;
        for (HudWidget w : widgets.values()) {
            if (w.isEnabled()) count++;
        }
        return count;
    }

    public void updateAllScreenPositions(int screenWidth, int screenHeight) {
        for (HudWidget w : widgets.values()) {
            w.updateScreenPosition(screenWidth, screenHeight);
        }
    }

    public void syncFromConfig() {
        try {
            ConfigData cfg = ConfigManager.getInstance().getConfig();
            if (cfg == null || cfg.hud == null || cfg.hud.elements == null) return;
            for (HudWidget w : widgets.values()) {
                ConfigData.HudElementConfig elCfg = cfg.hud.elements.get(w.getId());
                if (elCfg != null) {
                    w.syncFromConfig(elCfg);
                }
            }
        } catch (Throwable ignored) {}
    }

    public void syncToConfig() {
        try {
            ConfigData cfg = ConfigManager.getInstance().getConfig();
            if (cfg == null || cfg.hud == null || cfg.hud.elements == null) return;
            for (HudWidget w : widgets.values()) {
                ConfigData.HudElementConfig elCfg = cfg.hud.elements.computeIfAbsent(w.getId(), k -> new ConfigData.HudElementConfig());
                w.syncToConfig(elCfg);
            }
        } catch (Throwable ignored) {}
    }

    public void resetAll() {
        widgets.clear();
        register(new FpsWidget());
        register(new PingWidget());
        register(new CoordsWidget());
        register(new KeystrokesWidget());
        register(new CpsWidget());
        register(new PotionHudWidget());
        register(new ArmorHudWidget());
        register(new CustomCrosshairWidget());

        syncToConfig();
        ConfigManager.getInstance().saveNow();
    }
}

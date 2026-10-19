package com.rawcraft.client.module.impl;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.module.Module;
import com.rawcraft.client.module.ModuleCategory;

public class FullbrightModule extends Module {
    public FullbrightModule() {
        super("fullbright", "Fullbright", "Boosts ambient lightmap brightness in caves and dark areas.", ModuleCategory.GAMEPLAY, false);
    }

    @Override
    public void onEnable() {
        ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.enabled = true);
    }

    @Override
    public void onDisable() {
        ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.enabled = false);
    }
}

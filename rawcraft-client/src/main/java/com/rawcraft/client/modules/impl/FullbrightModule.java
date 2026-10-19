package com.rawcraft.client.modules.impl;

import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.settings.NumberSetting;

public class FullbrightModule extends Module {
    private final NumberSetting gammaStrength;
    private Double originalGamma = null;

    public FullbrightModule() {
        super("fullbright", "Fullbright", ModuleCategory.VISUAL,
                "Increases client lightmap gamma for dark caverns and restores original gamma on disable.", true);
        this.gammaStrength = new NumberSetting("gammaStrength", "Gamma Multiplier", "Brightness boost factor", 10.0, 1.0, 15.0, 1.0);
        registerSetting(gammaStrength);
    }

    public NumberSetting getGammaStrength() {
        return gammaStrength;
    }

    public Double getOriginalGamma() {
        return originalGamma;
    }

    public void setOriginalGamma(Double gamma) {
        if (this.originalGamma == null) {
            this.originalGamma = gamma;
        }
    }

    @Override
    public void onEnable() {
        // Handled dynamically by Lightmap / GameOptions hook
    }

    @Override
    public void onDisable() {
        // Restores original gamma when hook executes
    }
}

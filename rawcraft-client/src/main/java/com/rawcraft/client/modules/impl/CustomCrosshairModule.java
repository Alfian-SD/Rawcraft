package com.rawcraft.client.modules.impl;

import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.settings.BooleanSetting;
import com.rawcraft.client.settings.EnumSetting;

public class CustomCrosshairModule extends Module {
    private final EnumSetting shape;
    private final BooleanSetting accentColor;

    public CustomCrosshairModule() {
        super("crosshair_mod", "Crosshair Customization", ModuleCategory.HUD,
                "Renders a crisp native reticle via DrawContext and cleanly cancels vanilla crosshair.", true);
        this.shape = new EnumSetting("shape", "Reticle Shape", "Geometric reticle appearance", "CROSS", "CROSS", "DOT", "RING");
        this.accentColor = new BooleanSetting("accentColor", "Use RawCraft Accent (#A5B4FC)", "Tint reticle with RawCraft accent color", false);
        registerSetting(shape);
        registerSetting(accentColor);
    }

    public EnumSetting getShape() {
        return shape;
    }

    public BooleanSetting getAccentColor() {
        return accentColor;
    }
}

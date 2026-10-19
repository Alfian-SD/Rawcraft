package com.rawcraft.client.modules.impl;

import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.settings.BooleanSetting;

public class ToggleSprintModule extends Module {
    private final BooleanSetting flyBoostIndicator;

    public ToggleSprintModule() {
        super("togglesprint", "ToggleSprint", ModuleCategory.UTILITY,
                "Maintains legitimate client sprint key state without modifying movement packets.", true);
        this.flyBoostIndicator = new BooleanSetting("flyBoostIndicator", "Show State Label", "Display [Sprinting (Toggled)] on screen", true);
        registerSetting(flyBoostIndicator);
    }

    public BooleanSetting getFlyBoostIndicator() {
        return flyBoostIndicator;
    }
}

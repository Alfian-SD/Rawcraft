package com.rawcraft.client.modules.impl;

import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.settings.BooleanSetting;

public class ToggleSprintModule extends Module {
    private final BooleanSetting showStatusLabel;
    private final BooleanSetting autoRunToggle;
    private boolean sprintToggled = true;
    private boolean autoRunActive = false;

    public ToggleSprintModule() {
        super("togglesprint", "ToggleSprint", ModuleCategory.UTILITY,
                "Maintains legitimate client sprint key state without modifying movement packets.", true);
        this.showStatusLabel = new BooleanSetting("showStatusLabel", "Show State Label", "Display [Sprinting (Toggled)] on screen", true);
        this.autoRunToggle = new BooleanSetting("autoRun", "Auto Run", "Walks forward continuously without holding W", false);
        registerSetting(showStatusLabel);
        registerSetting(autoRunToggle);
    }

    public boolean isSprintToggled() {
        return sprintToggled;
    }

    public void setSprintToggled(boolean sprintToggled) {
        this.sprintToggled = sprintToggled;
    }

    public boolean isAutoRunActive() {
        return isEnabled() && autoRunActive;
    }

    public void setAutoRunActive(boolean autoRunActive) {
        this.autoRunActive = autoRunActive;
    }

    public void toggleAutoRun() {
        this.autoRunActive = !this.autoRunActive;
    }

    public boolean isShowStatusLabel() {
        return showStatusLabel.getValue();
    }

    public String getStatusText() {
        if (!isEnabled()) return "";
        if (autoRunActive) return "[Auto-Run]";
        if (sprintToggled) return "[Sprinting (Toggled)]";
        return "";
    }
}

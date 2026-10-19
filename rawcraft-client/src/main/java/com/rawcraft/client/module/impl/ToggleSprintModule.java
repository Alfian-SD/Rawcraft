package com.rawcraft.client.module.impl;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.module.Module;
import com.rawcraft.client.module.ModuleCategory;

public class ToggleSprintModule extends Module {
    private boolean autoRunActive = false;

    public ToggleSprintModule() {
        super("togglesprint", "Toggle Sprint", "Maintains sprint key state and supports continuous auto run.", ModuleCategory.GAMEPLAY, true);
    }

    public boolean isSprintToggled() {
        return isEnabled();
    }

    public boolean isAutoRunActive() {
        return isEnabled() && autoRunActive;
    }

    public void setAutoRunActive(boolean active) {
        this.autoRunActive = active;
    }

    public void toggleAutoRun() {
        setAutoRunActive(!autoRunActive);
    }

    public boolean isShowStatusLabel() {
        return ConfigManager.getInstance().getConfig().modules.toggleSprint.showStatusHud;
    }

    public String getStatusText() {
        if (!isEnabled()) return "";
        if (autoRunActive) return "[Auto-Run]";
        return "[Sprinting (Toggled)]";
    }
}

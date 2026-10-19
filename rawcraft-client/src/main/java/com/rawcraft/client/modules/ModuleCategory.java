package com.rawcraft.client.modules;

public enum ModuleCategory {
    HUD("HUD Elements"),
    PERFORMANCE("Performance"),
    VISUAL("Visual Enhancements"),
    UTILITY("Quality of Life");

    private final String displayName;

    ModuleCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

package com.rawcraft.client.module;

public enum ModuleCategory {
    HUD("HUD Elements"),
    GAMEPLAY("Gameplay & Controls"),
    PERFORMANCE("Performance Engine");

    private final String label;

    ModuleCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}

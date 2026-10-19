package com.rawcraft.client.module;

public enum ModuleStatus {
    ACTIVE("Active", 0xFF34D399),       // Green
    DISABLED("Disabled", 0xFF625A82),   // Muted grey/purple
    ERROR("Error", 0xFFF87171),         // Red
    UNAVAILABLE("Unavailable", 0xFFFBBF24); // Amber

    private final String displayLabel;
    private final int color;

    ModuleStatus(String displayLabel, int color) {
        this.displayLabel = displayLabel;
        this.color = color;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }

    public int getColor() {
        return color;
    }
}

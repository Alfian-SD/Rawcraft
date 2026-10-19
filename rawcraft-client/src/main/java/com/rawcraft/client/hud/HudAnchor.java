package com.rawcraft.client.hud;

public enum HudAnchor {
    TOP_LEFT("Top Left"),
    TOP_RIGHT("Top Right"),
    BOTTOM_LEFT("Bottom Left"),
    BOTTOM_RIGHT("Bottom Right"),
    CENTER("Center");

    private final String label;

    HudAnchor(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static HudAnchor fromString(String val) {
        if (val == null) return TOP_LEFT;
        try {
            return HudAnchor.valueOf(val.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return TOP_LEFT;
        }
    }
}

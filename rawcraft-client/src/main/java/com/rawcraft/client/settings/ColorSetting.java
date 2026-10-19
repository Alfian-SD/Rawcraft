package com.rawcraft.client.settings;

public class ColorSetting extends Setting<Integer> {
    public ColorSetting(String id, String label, String description, int defaultColor) {
        super(id, label, description, defaultColor);
    }

    public String toHex() {
        return String.format("#%06X", (0xFFFFFF & getValue()));
    }

    public void setFromHex(String hex) {
        try {
            String clean = hex.startsWith("#") ? hex.substring(1) : hex;
            int rgb = (int) Long.parseLong(clean, 16);
            setValue(0xFF000000 | rgb);
        } catch (Exception ignored) {}
    }
}

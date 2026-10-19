package com.rawcraft.client.hud;

public enum HudAnchor {
    TOP_LEFT("Top Left"),
    TOP_CENTER("Top Center"),
    TOP_RIGHT("Top Right"),
    MIDDLE_LEFT("Middle Left"),
    CENTER("Center"),
    MIDDLE_RIGHT("Middle Right"),
    BOTTOM_LEFT("Bottom Left"),
    BOTTOM_CENTER("Bottom Center"),
    BOTTOM_RIGHT("Bottom Right");

    private final String label;

    HudAnchor(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public int computeX(int offsetX, int width, int screenWidth) {
        return switch (this) {
            case TOP_LEFT, MIDDLE_LEFT, BOTTOM_LEFT -> offsetX;
            case TOP_CENTER, CENTER, BOTTOM_CENTER -> (screenWidth - width) / 2 + offsetX;
            case TOP_RIGHT, MIDDLE_RIGHT, BOTTOM_RIGHT -> screenWidth - width - offsetX;
        };
    }

    public int computeY(int offsetY, int height, int screenHeight) {
        return switch (this) {
            case TOP_LEFT, TOP_CENTER, TOP_RIGHT -> offsetY;
            case MIDDLE_LEFT, CENTER, MIDDLE_RIGHT -> (screenHeight - height) / 2 + offsetY;
            case BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT -> screenHeight - height - offsetY;
        };
    }

    public static HudAnchor findNearest(int screenX, int screenY, int width, int height, int screenWidth, int screenHeight) {
        int centerX = screenX + width / 2;
        int centerY = screenY + height / 2;

        int thirdW = screenWidth / 3;
        int thirdH = screenHeight / 3;

        int col; // 0=left, 1=center, 2=right
        if (centerX < thirdW) col = 0;
        else if (centerX < thirdW * 2) col = 1;
        else col = 2;

        int row; // 0=top, 1=middle, 2=bottom
        if (centerY < thirdH) row = 0;
        else if (centerY < thirdH * 2) row = 1;
        else row = 2;

        if (row == 0) {
            return col == 0 ? TOP_LEFT : (col == 1 ? TOP_CENTER : TOP_RIGHT);
        } else if (row == 1) {
            return col == 0 ? MIDDLE_LEFT : (col == 1 ? CENTER : MIDDLE_RIGHT);
        } else {
            return col == 0 ? BOTTOM_LEFT : (col == 1 ? BOTTOM_CENTER : BOTTOM_RIGHT);
        }
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

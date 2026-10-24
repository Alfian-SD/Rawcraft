package com.rawcraft.client.mod;

/** Screen corner a {@link HudMod} is pinned to. Offsets are measured inward from that corner. */
public enum HudAnchor {
    TOP_LEFT(0, 0),
    TOP_CENTER(1, 0),
    TOP_RIGHT(2, 0),
    MIDDLE_LEFT(0, 1),
    MIDDLE_CENTER(1, 1),
    MIDDLE_RIGHT(2, 1),
    BOTTOM_LEFT(0, 2),
    BOTTOM_CENTER(1, 2),
    BOTTOM_RIGHT(2, 2);

    private final int column;
    private final int row;

    HudAnchor(int column, int row) {
        this.column = column;
        this.row = row;
    }

    /**
     * Resolves the top-left corner of a HUD element.
     *
     * @param offsetX inward offset; for centre anchors it shifts right, for right anchors it shifts left
     * @param offsetY inward offset from the top or bottom edge
     */
    public int resolveX(int screenWidth, int elementWidth, int offsetX) {
        return switch (column) {
            case 0 -> offsetX;
            case 1 -> (screenWidth - elementWidth) / 2 + offsetX;
            default -> screenWidth - elementWidth - offsetX;
        };
    }

    public int resolveY(int screenHeight, int elementHeight, int offsetY) {
        return switch (row) {
            case 0 -> offsetY;
            case 1 -> (screenHeight - elementHeight) / 2 + offsetY;
            default -> screenHeight - elementHeight - offsetY;
        };
    }

    public HudAnchor next() {
        HudAnchor[] all = values();
        return all[(ordinal() + 1) % all.length];
    }

    public String label() {
        return name().replace('_', ' ').toLowerCase(java.util.Locale.ROOT);
    }
}

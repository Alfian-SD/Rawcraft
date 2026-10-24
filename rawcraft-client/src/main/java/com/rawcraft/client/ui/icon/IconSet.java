package com.rawcraft.client.ui.icon;

import net.minecraft.client.gui.GuiGraphicsExtractor;

/**
 * Vector icon set drawn with {@code fill()} spans on a 16x16 grid.
 *
 * <p>Deliberate choice over a PNG atlas: nothing to load, nothing to blur at odd GUI scales, and no
 * third-party art to license. Icon keys are referenced from the mod registry.
 *
 * <p>A key of the form {@code "text:BOSS BAR"} is not an icon at all — it renders as a text preview,
 * which is what several cards show in the reference layout.
 */
public final class IconSet {
    public static final String TEXT_PREFIX = "text:";

    private IconSet() {
    }

    public static boolean isTextPreview(String key) {
        return key != null && key.startsWith(TEXT_PREFIX);
    }

    public static String previewText(String key) {
        return key == null ? "" : key.substring(TEXT_PREFIX.length());
    }

    public static void draw(GuiGraphicsExtractor g, String key, int x, int y, int size, int color) {
        if (key == null) {
            key = "block";
        }
        switch (key) {
            case "grid" -> {
                cell(g, x, y, size, 1, 1, 6, 6, color);
                cell(g, x, y, size, 9, 1, 6, 6, color);
                cell(g, x, y, size, 1, 9, 6, 6, color);
                cell(g, x, y, size, 9, 9, 6, 6, color);
            }
            case "chat" -> {
                cell(g, x, y, size, 1, 2, 14, 9, color);
                cell(g, x, y, size, 4, 11, 4, 2, color);
            }
            case "camera" -> {
                cell(g, x, y, size, 1, 4, 14, 10, color);
                cell(g, x, y, size, 6, 7, 4, 4, color);
            }
            case "gear" -> {
                cell(g, x, y, size, 6, 6, 4, 4, color);
                cell(g, x, y, size, 7, 1, 2, 3, color);
                cell(g, x, y, size, 7, 12, 2, 3, color);
                cell(g, x, y, size, 1, 7, 3, 2, color);
                cell(g, x, y, size, 12, 7, 3, 2, color);
                cell(g, x, y, size, 3, 3, 2, 2, color);
                cell(g, x, y, size, 11, 3, 2, 2, color);
                cell(g, x, y, size, 3, 11, 2, 2, color);
                cell(g, x, y, size, 11, 11, 2, 2, color);
            }
            case "archive" -> {
                cell(g, x, y, size, 1, 4, 14, 10, color);
                cell(g, x, y, size, 0, 2, 16, 2, color);
            }
            case "flower" -> {
                cell(g, x, y, size, 6, 1, 4, 4, color);
                cell(g, x, y, size, 1, 6, 4, 4, color);
                cell(g, x, y, size, 11, 6, 4, 4, color);
                cell(g, x, y, size, 6, 11, 4, 4, color);
                cell(g, x, y, size, 6, 6, 4, 4, color);
            }
            case "list" -> {
                cell(g, x, y, size, 1, 2, 14, 2, color);
                cell(g, x, y, size, 1, 7, 14, 2, color);
                cell(g, x, y, size, 1, 12, 14, 2, color);
            }
            case "sync" -> {
                cell(g, x, y, size, 3, 1, 10, 2, color);
                cell(g, x, y, size, 1, 3, 2, 10, color);
                cell(g, x, y, size, 13, 3, 2, 10, color);
                cell(g, x, y, size, 3, 13, 10, 2, color);
                cell(g, x, y, size, 11, 0, 4, 3, color);
            }
            case "social" -> {
                cell(g, x, y, size, 1, 2, 9, 6, color);
                cell(g, x, y, size, 6, 7, 9, 6, color);
            }
            case "home" -> {
                cell(g, x, y, size, 7, 1, 2, 2, color);
                cell(g, x, y, size, 4, 3, 8, 2, color);
                cell(g, x, y, size, 2, 5, 12, 2, color);
                cell(g, x, y, size, 3, 7, 10, 8, color);
            }
            case "monitor" -> {
                cell(g, x, y, size, 1, 2, 14, 9, color);
                cell(g, x, y, size, 7, 11, 2, 2, color);
                cell(g, x, y, size, 4, 13, 8, 2, color);
            }
            case "cape" -> {
                cell(g, x, y, size, 4, 1, 8, 2, color);
                cell(g, x, y, size, 2, 3, 12, 12, color);
            }
            case "person" -> {
                cell(g, x, y, size, 5, 1, 6, 6, color);
                cell(g, x, y, size, 2, 8, 12, 7, color);
            }
            case "crosshair" -> {
                cell(g, x, y, size, 7, 1, 2, 5, color);
                cell(g, x, y, size, 7, 10, 2, 5, color);
                cell(g, x, y, size, 1, 7, 5, 2, color);
                cell(g, x, y, size, 10, 7, 5, 2, color);
            }
            case "bars" -> {
                cell(g, x, y, size, 1, 10, 3, 5, color);
                cell(g, x, y, size, 6, 7, 3, 8, color);
                cell(g, x, y, size, 11, 3, 3, 12, color);
            }
            case "text" -> {
                cell(g, x, y, size, 1, 2, 14, 2, color);
                cell(g, x, y, size, 7, 2, 2, 12, color);
            }
            case "block" -> {
                cell(g, x, y, size, 2, 2, 12, 4, color);
                cell(g, x, y, size, 2, 6, 6, 8, color);
                cell(g, x, y, size, 8, 6, 6, 8, color);
            }
            case "clock" -> {
                cell(g, x, y, size, 6, 2, 4, 2, color);
                cell(g, x, y, size, 6, 12, 4, 2, color);
                cell(g, x, y, size, 2, 6, 2, 4, color);
                cell(g, x, y, size, 12, 6, 2, 4, color);
                cell(g, x, y, size, 7, 4, 2, 5, color);
                cell(g, x, y, size, 7, 7, 4, 2, color);
            }
            case "compass" -> {
                cell(g, x, y, size, 6, 1, 4, 4, color);
                cell(g, x, y, size, 1, 6, 4, 4, color);
                cell(g, x, y, size, 11, 6, 4, 4, color);
                cell(g, x, y, size, 6, 11, 4, 4, color);
                cell(g, x, y, size, 7, 7, 2, 2, color);
            }
            case "sword" -> {
                cell(g, x, y, size, 10, 1, 3, 3, color);
                cell(g, x, y, size, 7, 4, 3, 3, color);
                cell(g, x, y, size, 4, 7, 3, 3, color);
                cell(g, x, y, size, 1, 10, 4, 2, color);
                cell(g, x, y, size, 2, 12, 2, 2, color);
            }
            case "shield" -> {
                cell(g, x, y, size, 3, 1, 10, 3, color);
                cell(g, x, y, size, 2, 4, 12, 6, color);
                cell(g, x, y, size, 4, 10, 8, 4, color);
                cell(g, x, y, size, 6, 14, 4, 2, color);
            }
            case "heart" -> {
                cell(g, x, y, size, 3, 3, 4, 4, color);
                cell(g, x, y, size, 9, 3, 4, 4, color);
                cell(g, x, y, size, 3, 6, 10, 4, color);
                cell(g, x, y, size, 5, 10, 6, 2, color);
                cell(g, x, y, size, 7, 12, 2, 2, color);
            }
            case "potion" -> {
                cell(g, x, y, size, 6, 1, 4, 3, color);
                cell(g, x, y, size, 4, 4, 8, 9, color);
                cell(g, x, y, size, 6, 13, 4, 2, color);
            }
            case "eye" -> {
                cell(g, x, y, size, 2, 5, 12, 6, color);
                cell(g, x, y, size, 5, 7, 6, 3, color);
            }
            case "bolt" -> {
                cell(g, x, y, size, 7, 1, 3, 4, color);
                cell(g, x, y, size, 5, 5, 3, 3, color);
                cell(g, x, y, size, 4, 8, 4, 3, color);
                cell(g, x, y, size, 7, 8, 4, 3, color);
                cell(g, x, y, size, 5, 11, 3, 4, color);
            }
            case "key" -> {
                cell(g, x, y, size, 2, 2, 6, 6, color);
                cell(g, x, y, size, 8, 8, 2, 2, color);
                cell(g, x, y, size, 10, 10, 2, 2, color);
                cell(g, x, y, size, 12, 12, 2, 2, color);
            }
            case "map" -> {
                cell(g, x, y, size, 1, 2, 14, 12, color);
                cell(g, x, y, size, 5, 4, 2, 8, color);
                cell(g, x, y, size, 9, 4, 2, 8, color);
            }
            case "armor" -> {
                cell(g, x, y, size, 4, 1, 8, 3, color);
                cell(g, x, y, size, 2, 4, 3, 8, color);
                cell(g, x, y, size, 11, 4, 3, 8, color);
                cell(g, x, y, size, 5, 6, 6, 8, color);
            }
            case "gauge" -> {
                cell(g, x, y, size, 4, 1, 8, 2, color);
                cell(g, x, y, size, 2, 3, 2, 6, color);
                cell(g, x, y, size, 12, 3, 2, 6, color);
                cell(g, x, y, size, 4, 9, 8, 2, color);
                cell(g, x, y, size, 7, 5, 4, 2, color);
            }
            case "wave" -> {
                cell(g, x, y, size, 1, 8, 4, 2, color);
                cell(g, x, y, size, 4, 5, 4, 2, color);
                cell(g, x, y, size, 8, 10, 4, 2, color);
                cell(g, x, y, size, 11, 4, 4, 2, color);
            }
            case "ping" -> {
                cell(g, x, y, size, 1, 12, 3, 3, color);
                cell(g, x, y, size, 5, 9, 3, 6, color);
                cell(g, x, y, size, 9, 5, 3, 10, color);
                cell(g, x, y, size, 13, 1, 2, 14, color);
            }
            case "font" -> {
                cell(g, x, y, size, 2, 2, 12, 2, color);
                cell(g, x, y, size, 4, 4, 2, 10, color);
                cell(g, x, y, size, 10, 4, 2, 10, color);
                cell(g, x, y, size, 6, 8, 4, 2, color);
            }
            case "fog" -> {
                cell(g, x, y, size, 1, 5, 14, 2, color);
                cell(g, x, y, size, 3, 8, 10, 2, color);
                cell(g, x, y, size, 5, 11, 7, 2, color);
            }
            case "flag" -> {
                cell(g, x, y, size, 2, 1, 2, 14, color);
                cell(g, x, y, size, 4, 2, 9, 2, color);
                cell(g, x, y, size, 4, 2, 2, 6, color);
            }
            case "target" -> {
                cell(g, x, y, size, 1, 1, 14, 2, color);
                cell(g, x, y, size, 1, 13, 14, 2, color);
                cell(g, x, y, size, 1, 1, 2, 14, color);
                cell(g, x, y, size, 13, 1, 2, 14, color);
                cell(g, x, y, size, 6, 6, 4, 4, color);
            }
            case "tnt" -> {
                cell(g, x, y, size, 2, 5, 12, 9, color);
                cell(g, x, y, size, 8, 1, 2, 4, color);
            }
            case "toast" -> {
                cell(g, x, y, size, 1, 3, 14, 8, color);
                cell(g, x, y, size, 3, 5, 10, 2, color);
            }
            case "zoom" -> {
                cell(g, x, y, size, 2, 2, 9, 2, color);
                cell(g, x, y, size, 1, 4, 2, 5, color);
                cell(g, x, y, size, 10, 4, 2, 5, color);
                cell(g, x, y, size, 2, 9, 9, 2, color);
                cell(g, x, y, size, 10, 10, 5, 2, color);
            }
            case "mic" -> {
                cell(g, x, y, size, 6, 1, 4, 7, color);
                cell(g, x, y, size, 4, 4, 2, 5, color);
                cell(g, x, y, size, 10, 4, 2, 5, color);
                cell(g, x, y, size, 5, 9, 6, 2, color);
                cell(g, x, y, size, 7, 11, 2, 4, color);
            }
            case "speaker" -> {
                cell(g, x, y, size, 1, 5, 3, 6, color);
                cell(g, x, y, size, 4, 3, 3, 10, color);
                cell(g, x, y, size, 8, 6, 2, 4, color);
            }
            case "trophy" -> {
                cell(g, x, y, size, 3, 1, 10, 3, color);
                cell(g, x, y, size, 4, 4, 8, 4, color);
                cell(g, x, y, size, 7, 8, 2, 3, color);
                cell(g, x, y, size, 5, 11, 6, 2, color);
            }
            case "tag" -> {
                cell(g, x, y, size, 2, 2, 8, 2, color);
                cell(g, x, y, size, 2, 2, 2, 8, color);
                cell(g, x, y, size, 8, 8, 6, 6, color);
            }
            case "team" -> {
                cell(g, x, y, size, 1, 2, 4, 4, color);
                cell(g, x, y, size, 6, 2, 4, 4, color);
                cell(g, x, y, size, 1, 7, 5, 7, color);
                cell(g, x, y, size, 6, 7, 5, 7, color);
            }
            case "hand" -> {
                cell(g, x, y, size, 4, 3, 8, 11, color);
                cell(g, x, y, size, 2, 6, 2, 5, color);
            }
            case "window" -> {
                cell(g, x, y, size, 1, 2, 14, 11, color);
                cell(g, x, y, size, 1, 2, 14, 2, color);
            }
            case "drop" -> {
                cell(g, x, y, size, 3, 2, 2, 4, color);
                cell(g, x, y, size, 7, 5, 2, 4, color);
                cell(g, x, y, size, 11, 2, 2, 4, color);
            }
            case "star" -> {
                cell(g, x, y, size, 7, 1, 2, 14, color);
                cell(g, x, y, size, 1, 7, 14, 2, color);
                cell(g, x, y, size, 3, 3, 3, 3, color);
                cell(g, x, y, size, 10, 3, 3, 3, color);
                cell(g, x, y, size, 3, 10, 3, 3, color);
                cell(g, x, y, size, 10, 10, 3, 3, color);
            }
            default -> {
                cell(g, x, y, size, 3, 3, 10, 10, color);
            }
        }
    }

    /** One rectangle of the 16x16 grid. */
    private static void cell(GuiGraphicsExtractor g, int originX, int originY, int size,
                             float gx, float gy, float gw, float gh, int color) {
        float s = size / 16f;
        int x1 = originX + Math.round(gx * s);
        int y1 = originY + Math.round(gy * s);
        int x2 = originX + Math.round((gx + gw) * s);
        int y2 = originY + Math.round((gy + gh) * s);
        if (x2 > x1 && y2 > y1) {
            g.fill(x1, y1, x2, y2, color);
        }
    }
}

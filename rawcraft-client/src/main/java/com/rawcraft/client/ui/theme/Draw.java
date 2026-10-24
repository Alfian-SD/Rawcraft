package com.rawcraft.client.ui.theme;

import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.util.ARGB;

/**
 * Drawing primitives that Minecraft does not ship: rounded rectangles, soft shadows and
 * colour mixing. Everything is built from {@code fill()} spans so there are no textures to load.
 */
public final class Draw {
    private Draw() {
    }

    public static int argb(int a, int r, int g, int b) {
        return ARGB.color(a, r, g, b);
    }

    public static int rgb(int r, int g, int b) {
        return 0xFF000000 | (r << 16) | (g << 8) | b;
    }

    public static int withAlpha(int color, int alpha) {
        return (color & 0x00FFFFFF) | ((alpha & 0xFF) << 24);
    }

    public static int fade(int color, float factor) {
        int a = (int) (((color >>> 24) & 0xFF) * Math.max(0f, Math.min(1f, factor)));
        return withAlpha(color, a);
    }

    /** Linear blend, {@code t = 0} returns {@code from}. */
    public static int mix(int from, int to, float t) {
        t = Math.max(0f, Math.min(1f, t));
        int a = (int) (((from >>> 24) & 0xFF) + (((to >>> 24) & 0xFF) - ((from >>> 24) & 0xFF)) * t);
        int r = (int) (((from >> 16) & 0xFF) + (((to >> 16) & 0xFF) - ((from >> 16) & 0xFF)) * t);
        int g = (int) (((from >> 8) & 0xFF) + (((to >> 8) & 0xFF) - ((from >> 8) & 0xFF)) * t);
        int b = (int) ((from & 0xFF) + ((to & 0xFF) - (from & 0xFF)) * t);
        return (a << 24) | (r << 16) | (g << 8) | b;
    }

    public static void rect(GuiGraphicsExtractor g, int x, int y, int w, int h, int color) {
        if (w <= 0 || h <= 0) {
            return;
        }
        g.fill(x, y, x + w, y + h, color);
    }

    /** Filled rectangle with rounded corners. {@code radius} is clamped to half the short side. */
    public static void rounded(GuiGraphicsExtractor g, int x, int y, int w, int h, int radius, int color) {
        if (w <= 0 || h <= 0) {
            return;
        }
        int r = Math.min(radius, Math.min(w / 2, h / 2));
        if (r <= 0) {
            g.fill(x, y, x + w, y + h, color);
            return;
        }
        g.fill(x, y + r, x + w, y + h - r, color);
        g.fill(x + r, y, x + w - r, y + r, color);
        g.fill(x + r, y + h - r, x + w - r, y + h, color);
        for (int i = 0; i < r; i++) {
            int inset = cornerInset(r, i);
            g.fill(x + inset, y + i, x + w - inset, y + i + 1, color);
            g.fill(x + inset, y + h - i - 1, x + w - inset, y + h - i, color);
        }
    }

    /** One-pixel rounded outline. */
    public static void roundedOutline(GuiGraphicsExtractor g, int x, int y, int w, int h, int radius, int color) {
        if (w <= 1 || h <= 1) {
            return;
        }
        int r = Math.min(radius, Math.min(w / 2, h / 2));
        if (r <= 0) {
            g.fill(x, y, x + w, y + 1, color);
            g.fill(x, y + h - 1, x + w, y + h, color);
            g.fill(x, y + 1, x + 1, y + h - 1, color);
            g.fill(x + w - 1, y + 1, x + w, y + h - 1, color);
            return;
        }
        g.fill(x + r, y, x + w - r, y + 1, color);
        g.fill(x + r, y + h - 1, x + w - r, y + h, color);
        g.fill(x, y + r, x + 1, y + h - r, color);
        g.fill(x + w - 1, y + r, x + w, y + h - r, color);
        for (int i = 0; i < r; i++) {
            int inset = cornerInset(r, i);
            g.fill(x + inset, y + i, x + inset + 1, y + i + 1, color);
            g.fill(x + w - inset - 1, y + i, x + w - inset, y + i + 1, color);
            g.fill(x + inset, y + h - i - 1, x + inset + 1, y + h - i, color);
            g.fill(x + w - inset - 1, y + h - i - 1, x + w - inset, y + h - i, color);
        }
    }

    /** Horizontal distance to cut from the corner at row {@code row} of a circle of radius {@code r}. */
    private static int cornerInset(int r, int row) {
        int dy = r - row - 1;
        int squared = r * r - dy * dy;
        return r - (int) Math.round(Math.sqrt(Math.max(0, squared)));
    }

    /** Three stacked translucent rounded rects, standing in for a real blur-based drop shadow. */
    public static void softShadow(GuiGraphicsExtractor g, int x, int y, int w, int h, int radius, int baseAlpha) {
        for (int i = 3; i >= 1; i--) {
            int alpha = Math.max(2, baseAlpha / (i * 2));
            rounded(g, x - i, y - i + 2, w + i * 2, h + i * 2, radius + i, withAlpha(0x000000, alpha));
        }
    }

    public static void text(GuiGraphicsExtractor g, Font font, String value, int x, int y, int color) {
        g.text(font, value, x, y, color);
    }

    public static void textCentered(GuiGraphicsExtractor g, Font font, String value, int centerX, int y, int color) {
        g.text(font, value, centerX - font.width(value) / 2, y, color);
    }

    public static void textRight(GuiGraphicsExtractor g, Font font, String value, int rightX, int y, int color) {
        g.text(font, value, rightX - font.width(value), y, color);
    }

    /** Truncates with an ellipsis so long mod names never spill out of a card. */
    public static String ellipsize(Font font, String value, int maxWidth) {
        if (font.width(value) <= maxWidth) {
            return value;
        }
        String ellipsis = "\u2026";
        int budget = maxWidth - font.width(ellipsis);
        if (budget <= 0) {
            return ellipsis;
        }
        StringBuilder out = new StringBuilder();
        for (char c : value.toCharArray()) {
            if (font.width(out.toString() + c) > budget) {
                break;
            }
            out.append(c);
        }
        return out + ellipsis;
    }

    public static void scissor(GuiGraphicsExtractor g, int x1, int y1, int x2, int y2) {
        g.enableScissor(x1, y1, x2, y2);
    }

    public static void unscissor(GuiGraphicsExtractor g) {
        g.disableScissor();
    }

    public static boolean inside(double mouseX, double mouseY, int x, int y, int w, int h) {
        return mouseX >= x && mouseX < x + w && mouseY >= y && mouseY < y + h;
    }
}

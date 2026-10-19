package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class CustomCrosshairWidget extends HudWidget {
    private String style = "plus_gap"; // "cross", "plus_gap", "dot", "circle", "t_shape"
    private int size = 6;
    private int thickness = 1;
    private int gap = 3;
    private boolean outline = true;
    private boolean dynamic = false;

    public CustomCrosshairWidget() {
        super("crosshair", "Custom Crosshair", HudAnchor.CENTER, 0, 0);
        this.width = 24;
        this.height = 24;
        setBackgroundMode("off"); // Never draw bounding background for crosshair
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        if (style != null) this.style = style;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = Math.max(1, Math.min(20, size));
    }

    public int getThickness() {
        return thickness;
    }

    public void setThickness(int thickness) {
        this.thickness = Math.max(1, Math.min(6, thickness));
    }

    public int getGap() {
        return gap;
    }

    public void setGap(int gap) {
        this.gap = Math.max(0, Math.min(10, gap));
    }

    public boolean isOutline() {
        return outline;
    }

    public void setOutline(boolean outline) {
        this.outline = outline;
    }

    public boolean isDynamic() {
        return dynamic;
    }

    public void setDynamic(boolean dynamic) {
        this.dynamic = dynamic;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        if (!isEditor && mc.gui != null && mc.gui.screen() != null) {
            return; // Do not render crosshair when in menu
        }

        // Center reticle within widget bounding box
        int cx = x + w / 2;
        int cy = y + h / 2;

        int currentGap = gap;
        if (dynamic && mc.player != null && (mc.player.isSprinting() || mc.player.getDeltaMovement().lengthSqr() > 0.01)) {
            currentGap += 2;
        }

        int col = getTextColor();
        int outlineCol = 0xFF000000;

        switch (style.toLowerCase()) {
            case "dot":
                drawRect(extractor, cx - thickness, cy - thickness, thickness * 2, thickness * 2, col, outline);
                break;
            case "cross":
                drawReticleBars(extractor, cx, cy, 0, size, thickness, col, outline, true);
                break;
            case "t_shape":
                drawReticleBars(extractor, cx, cy, currentGap, size, thickness, col, outline, false);
                break;
            case "circle":
                drawCircleReticle(extractor, cx, cy, currentGap + size / 2, thickness, col, outline);
                break;
            case "plus_gap":
            default:
                drawReticleBars(extractor, cx, cy, currentGap, size, thickness, col, outline, true);
                break;
        }
    }

    private void drawReticleBars(GuiGraphicsExtractor extractor, int cx, int cy, int g, int len, int th, int color, boolean outl, boolean drawTop) {
        int halfTh = th / 2;

        // Top bar
        if (drawTop) {
            drawRect(extractor, cx - halfTh, cy - g - len, th, len, color, outl);
        }
        // Bottom bar
        drawRect(extractor, cx - halfTh, cy + g, th, len, color, outl);
        // Left bar
        drawRect(extractor, cx - g - len, cy - halfTh, len, th, color, outl);
        // Right bar
        drawRect(extractor, cx + g, cy - halfTh, len, th, color, outl);
    }

    private void drawCircleReticle(GuiGraphicsExtractor extractor, int cx, int cy, int radius, int th, int color, boolean outl) {
        // Approximate pixelated circle
        int r = Math.max(2, radius);
        for (int d = -r; d <= r; d++) {
            int yOff = (int) Math.round(Math.sqrt(Math.max(0, r * r - d * d)));
            drawRect(extractor, cx + d, cy + yOff, th, th, color, outl);
            drawRect(extractor, cx + d, cy - yOff, th, th, color, outl);
        }
    }

    private void drawRect(GuiGraphicsExtractor extractor, int rx, int ry, int rw, int rh, int color, boolean outl) {
        if (outl) {
            extractor.fill(rx - 1, ry - 1, rx + rw + 1, ry + rh + 1, 0xFF000000);
        }
        extractor.fill(rx, ry, rx + rw, ry + rh, color);
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.style = cfg.style != null ? cfg.style : "plus_gap";
        this.size = cfg.size;
        this.thickness = cfg.thickness;
        this.gap = cfg.gap;
        this.outline = cfg.outline;
        this.dynamic = cfg.dynamic;
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.style = this.style;
        cfg.size = this.size;
        cfg.thickness = this.thickness;
        cfg.gap = this.gap;
        cfg.outline = this.outline;
        cfg.dynamic = this.dynamic;
    }
}

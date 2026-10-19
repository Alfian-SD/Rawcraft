package com.rawcraft.client.hud;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public abstract class HudWidget {
    private final String id;
    private final String name;
    private HudAnchor anchor = HudAnchor.TOP_LEFT;
    private int offsetX = 16;
    private int offsetY = 16;
    private double scale = 1.0;
    private double opacity = 1.0;
    private boolean enabled = true;
    private int textColor = 0xFFFFFFFF;
    private boolean shadow = true;
    private String backgroundMode = "solid";
    private int backgroundColor = 0xB2120C22; // ~70% alpha dark purple

    protected int width = 80;
    protected int height = 18;

    // Last computed screen coordinates
    private int lastScreenX = 16;
    private int lastScreenY = 16;

    public HudWidget(String id, String name, HudAnchor defaultAnchor, int defX, int defY) {
        this.id = id;
        this.name = name;
        this.anchor = defaultAnchor;
        this.offsetX = defX;
        this.offsetY = defY;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public HudAnchor getAnchor() {
        return anchor;
    }

    public void setAnchor(HudAnchor anchor) {
        if (anchor != null) this.anchor = anchor;
    }

    public int getOffsetX() {
        return offsetX;
    }

    public void setOffsetX(int offsetX) {
        this.offsetX = offsetX;
    }

    public int getOffsetY() {
        return offsetY;
    }

    public void setOffsetY(int offsetY) {
        this.offsetY = offsetY;
    }

    public double getScale() {
        return scale;
    }

    public void setScale(double scale) {
        this.scale = Math.max(0.5, Math.min(2.0, scale));
    }

    public double getOpacity() {
        return opacity;
    }

    public void setOpacity(double opacity) {
        this.opacity = Math.max(0.2, Math.min(1.0, opacity));
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public int getTextColor() {
        return textColor;
    }

    public void setTextColor(int textColor) {
        this.textColor = textColor;
    }

    public boolean isShadow() {
        return shadow;
    }

    public void setShadow(boolean shadow) {
        this.shadow = shadow;
    }

    public String getBackgroundMode() {
        return backgroundMode;
    }

    public void setBackgroundMode(String backgroundMode) {
        this.backgroundMode = backgroundMode;
    }

    public int getBackgroundColor() {
        return backgroundColor;
    }

    public void setBackgroundColor(int backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    public int getWidth() {
        return width;
    }

    public int getHeight() {
        return height;
    }

    public int getScaledWidth() {
        return (int) Math.round(width * scale);
    }

    public int getScaledHeight() {
        return (int) Math.round(height * scale);
    }

    public int getScreenX() {
        return lastScreenX;
    }

    public int getScreenY() {
        return lastScreenY;
    }

    public void updateScreenPosition(int screenWidth, int screenHeight) {
        int w = getScaledWidth();
        int h = getScaledHeight();

        int x = anchor.computeX(offsetX, w, screenWidth);
        int y = anchor.computeY(offsetY, h, screenHeight);

        // Clamping to screen boundaries (PRD §3.4 & §5.4: margin 4px, test says 8px margin safe)
        x = Math.max(8, Math.min(screenWidth - w - 8, x));
        y = Math.max(8, Math.min(screenHeight - h - 8, y));

        this.lastScreenX = x;
        this.lastScreenY = y;
    }

    public void dragTo(int targetX, int targetY, int screenWidth, int screenHeight) {
        int w = getScaledWidth();
        int h = getScaledHeight();

        // 1. Clamp target coordinates inside screen boundaries
        targetX = Math.max(8, Math.min(screenWidth - w - 8, targetX));
        targetY = Math.max(8, Math.min(screenHeight - h - 8, targetY));

        // 2. Determine nearest anchor
        this.anchor = HudAnchor.findNearest(targetX, targetY, w, h, screenWidth, screenHeight);

        // 3. Compute new offset relative to nearest anchor
        switch (anchor) {
            case TOP_LEFT, MIDDLE_LEFT, BOTTOM_LEFT -> this.offsetX = targetX;
            case TOP_CENTER, CENTER, BOTTOM_CENTER -> this.offsetX = targetX - ((screenWidth - w) / 2);
            case TOP_RIGHT, MIDDLE_RIGHT, BOTTOM_RIGHT -> this.offsetX = screenWidth - w - targetX;
        }

        switch (anchor) {
            case TOP_LEFT, TOP_CENTER, TOP_RIGHT -> this.offsetY = targetY;
            case MIDDLE_LEFT, CENTER, MIDDLE_RIGHT -> this.offsetY = targetY - ((screenHeight - h) / 2);
            case BOTTOM_LEFT, BOTTOM_CENTER, BOTTOM_RIGHT -> this.offsetY = screenHeight - h - targetY;
        }

        updateScreenPosition(screenWidth, screenHeight);
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        int w = getScaledWidth();
        int h = getScaledHeight();
        return mouseX >= lastScreenX && mouseX <= lastScreenX + w && mouseY >= lastScreenY && mouseY <= lastScreenY + h;
    }

    public void renderWidget(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int screenWidth, int screenHeight, boolean isEditor) {
        if (!enabled && !isEditor) return;
        updateScreenPosition(screenWidth, screenHeight);

        int x = lastScreenX;
        int y = lastScreenY;
        int w = getScaledWidth();
        int h = getScaledHeight();

        // Background
        if (!"off".equalsIgnoreCase(backgroundMode)) {
            int bgCol = "translucent".equalsIgnoreCase(backgroundMode) ? 0x66000000 : backgroundColor;
            renderBackground(extractor, x, y, w, h, bgCol);
        }

        // Draw element content
        drawContent(extractor, deltaTracker, x, y, w, h, isEditor);

        // Editor selection indicator
        if (isEditor) {
            extractor.outline(x - 1, y - 1, w + 2, h + 2, 0x888B5CF6);
        }
    }

    protected void renderBackground(GuiGraphicsExtractor extractor, int x, int y, int w, int h, int color) {
        extractor.fill(x, y, x + w, y + h, color);
        // 1px subtle border
        extractor.outline(x, y, w, h, 0x3333285C);
    }

    protected abstract void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor);

    protected Font getFont() {
        Minecraft mc = Minecraft.getInstance();
        return mc.gui != null && mc.gui.hud != null ? mc.gui.hud.getFont() : mc.font;
    }

    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        if (cfg == null) return;
        this.enabled = cfg.enabled;
        this.anchor = HudAnchor.fromString(cfg.anchor);
        this.offsetX = cfg.x;
        this.offsetY = cfg.y;
        this.scale = cfg.scale;
        this.opacity = cfg.opacity;
        this.shadow = cfg.shadow;
        this.backgroundMode = cfg.backgroundMode;
        if (cfg.color != null && !cfg.color.isEmpty()) {
            try {
                this.textColor = (int) Long.parseLong(cfg.color.replace("#", ""), 16);
                if (cfg.color.length() <= 7) this.textColor |= 0xFF000000;
            } catch (Exception ignored) {}
        }
    }

    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        if (cfg == null) return;
        cfg.enabled = this.enabled;
        cfg.anchor = this.anchor.name();
        cfg.x = this.offsetX;
        cfg.y = this.offsetY;
        cfg.scale = this.scale;
        cfg.opacity = this.opacity;
        cfg.shadow = this.shadow;
        cfg.backgroundMode = this.backgroundMode;
    }
}

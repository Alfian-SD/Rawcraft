package com.rawcraft.client.hud;

import com.rawcraft.client.ui.RawCraftTheme;

public abstract class HudWidget {
    private final String id;
    private final String name;
    private HudAnchor anchor;
    private int offsetX;
    private int offsetY;
    private double scale;
    private double opacity;
    private boolean enabled;

    // Measured bounding box in unscaled coordinates
    protected int width = 100;
    protected int height = 30;

    // Computed absolute screen render coordinates
    private int screenX = 16;
    private int screenY = 16;

    public HudWidget(String id, String name, HudAnchor anchor, int offsetX, int offsetY, double scale, double opacity, boolean enabled) {
        this.id = id;
        this.name = name;
        this.anchor = anchor;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.scale = clamp(scale, 0.5, 2.0);
        this.opacity = clamp(opacity, 0.35, 1.0);
        this.enabled = enabled;
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
        if (anchor != null) {
            this.anchor = anchor;
        }
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
        this.scale = clamp(scale, 0.5, 2.0);
    }

    public double getOpacity() {
        return opacity;
    }

    public void setOpacity(double opacity) {
        this.opacity = clamp(opacity, 0.35, 1.0);
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
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
        return screenX;
    }

    public int getScreenY() {
        return screenY;
    }

    /**
     * Clamps and updates the absolute screen position relative to viewport and anchor.
     * Matches the formula in reference.html:
     * left = Math.max(8, Math.min(vw - width - 8, left))
     * top = Math.max(8, Math.min(vh - height - 8, top))
     */
    public void updateScreenPosition(int screenWidth, int screenHeight) {
        int w = getScaledWidth();
        int h = getScaledHeight();

        int left = 16;
        int top = 16;

        switch (anchor) {
            case TOP_LEFT:
                left = offsetX;
                top = offsetY;
                break;
            case TOP_RIGHT:
                left = screenWidth - w - offsetX;
                top = offsetY;
                break;
            case BOTTOM_LEFT:
                left = offsetX;
                top = screenHeight - h - offsetY;
                break;
            case BOTTOM_RIGHT:
                left = screenWidth - w - offsetX;
                top = screenHeight - h - offsetY;
                break;
            case CENTER:
                left = (screenWidth / 2) - (w / 2) + offsetX;
                top = (screenHeight / 2) - (h / 2) + offsetY;
                break;
        }

        // Clamp inside usable screen bounds (8px margin from edges)
        left = Math.max(8, Math.min(screenWidth - w - 8, left));
        top = Math.max(8, Math.min(screenHeight - h - 8, top));

        this.screenX = left;
        this.screenY = top;
    }

    /**
     * Updates offset when dragging to a new target screen position.
     */
    public void dragTo(int targetScreenX, int targetScreenY, int screenWidth, int screenHeight) {
        int w = getScaledWidth();
        int h = getScaledHeight();

        // Screen boundary clamp
        int clampedX = Math.max(8, Math.min(screenWidth - w - 8, targetScreenX));
        int clampedY = Math.max(8, Math.min(screenHeight - h - 8, targetScreenY));

        switch (anchor) {
            case TOP_LEFT:
                this.offsetX = clampedX;
                this.offsetY = clampedY;
                break;
            case TOP_RIGHT:
                this.offsetX = screenWidth - w - clampedX;
                this.offsetY = clampedY;
                break;
            case BOTTOM_LEFT:
                this.offsetX = clampedX;
                this.offsetY = screenHeight - h - clampedY;
                break;
            case BOTTOM_RIGHT:
                this.offsetX = screenWidth - w - clampedX;
                this.offsetY = screenHeight - h - clampedY;
                break;
            case CENTER:
                this.offsetX = clampedX - ((screenWidth / 2) - (w / 2));
                this.offsetY = clampedY - ((screenHeight / 2) - (h / 2));
                break;
        }

        updateScreenPosition(screenWidth, screenHeight);
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        int w = getScaledWidth();
        int h = getScaledHeight();
        return mouseX >= screenX && mouseX <= screenX + w && mouseY >= screenY && mouseY <= screenY + h;
    }

    public abstract void render(Object drawContext, float tickDelta);

    public void renderEditorBounds(Object drawContext, boolean isSelected) {
        // Draw bounding box and dashed/solid border in editor
    }

    private static double clamp(double val, double min, double max) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }
}

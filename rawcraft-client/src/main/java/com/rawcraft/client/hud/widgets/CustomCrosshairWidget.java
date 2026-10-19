package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;

public class CustomCrosshairWidget extends HudWidget {
    private String shape = "CROSS"; // CROSS, DOT, RING
    private boolean useAccentColor = false;

    public CustomCrosshairWidget() {
        super("crosshair", "Custom Crosshair", HudAnchor.CENTER, 0, 0, 1.0, 0.95, true);
        this.width = 24;
        this.height = 24;
    }

    public String getShape() {
        return shape;
    }

    public void setShape(String shape) {
        if (shape != null) {
            this.shape = shape;
        }
    }

    public boolean isUseAccentColor() {
        return useAccentColor;
    }

    public void setUseAccentColor(boolean useAccentColor) {
        this.useAccentColor = useAccentColor;
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Native reticle rendering at center of screen
    }
}

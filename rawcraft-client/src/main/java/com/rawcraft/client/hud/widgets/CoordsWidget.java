package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;

public class CoordsWidget extends HudWidget {
    public CoordsWidget() {
        super("coords", "XYZ Coordinates", HudAnchor.TOP_LEFT, 16, 46, 1.0, 0.9, true);
        this.width = 175;
        this.height = 24;
    }

    public String getText(double x, double y, double z, String facing) {
        String dir = (facing == null || facing.isEmpty()) ? "" : " (" + facing + ")";
        return String.format("XYZ: %.1f / %.1f / %.1f%s", x, y, z, dir);
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via native DrawContext
    }
}

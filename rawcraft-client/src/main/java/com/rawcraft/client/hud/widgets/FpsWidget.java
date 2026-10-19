package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.ui.RawCraftTheme;

public class FpsWidget extends HudWidget {
    public FpsWidget() {
        super("fps", "FPS Counter", HudAnchor.TOP_LEFT, 16, 16, 1.0, 0.9, true);
        this.width = 82;
        this.height = 24;
    }

    public String getText(int fps) {
        return "FPS: " + fps;
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via HudRenderer or native DrawContext
    }
}

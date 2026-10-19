package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.input.ClickTracker;

public class CpsWidget extends HudWidget {
    public CpsWidget() {
        super("cps", "CPS Counter", HudAnchor.TOP_LEFT, 16, 190, 1.0, 0.9, true);
        this.width = 120;
        this.height = 24;
    }

    public String getText() {
        ClickTracker tracker = ClickTracker.getInstance();
        return "CPS: " + tracker.getLeftCps() + " | " + tracker.getRightCps();
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via native DrawContext
    }
}

package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;

public class PingWidget extends HudWidget {
    public PingWidget() {
        super("ping", "Ping / Latency", HudAnchor.TOP_RIGHT, 16, 16, 1.0, 0.9, true);
        this.width = 96;
        this.height = 24;
    }

    public String getText(int pingMs) {
        return "PING: " + Math.max(0, pingMs) + " ms";
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via native DrawContext
    }
}

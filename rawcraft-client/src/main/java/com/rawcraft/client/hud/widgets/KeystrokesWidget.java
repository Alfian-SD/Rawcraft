package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;

public class KeystrokesWidget extends HudWidget {
    public KeystrokesWidget() {
        super("keystrokes", "Keystrokes Display", HudAnchor.TOP_LEFT, 16, 80, 1.0, 0.9, true);
        this.width = 76;
        this.height = 100;
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Renders W, A, S, D, LMB, RMB, SPACE boxes with pressed highlight
    }
}

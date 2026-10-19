package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.input.ClickTracker;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class CpsWidget extends HudWidget {
    private String mode = "split"; // "split", "separate", "total"

    public CpsWidget() {
        super("cps", "CPS Counter", HudAnchor.BOTTOM_LEFT, 8, 208);
        this.width = 68;
        this.height = 14;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        ClickTracker tracker = ClickTracker.getInstance();
        int left = isEditor ? 7 : tracker.getLeftCps();
        int right = isEditor ? 3 : tracker.getRightCps();

        String text;
        if ("separate".equalsIgnoreCase(mode)) {
            text = "L " + left + "  R " + right;
        } else if ("total".equalsIgnoreCase(mode)) {
            text = "CPS: " + (left + right);
        } else {
            text = "CPS: " + left + " | " + right;
        }

        Font font = getFont();
        this.width = font.width(text) + 8;
        this.height = font.lineHeight + 6;

        extractor.text(font, text, x + 4, y + 3, getTextColor(), isShadow());
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.mode = cfg.mode != null ? cfg.mode : "split";
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.mode = this.mode;
    }
}

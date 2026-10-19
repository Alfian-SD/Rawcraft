package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class FpsWidget extends HudWidget {
    private int cachedFps = 0;
    private long lastFpsUpdate = 0;

    public FpsWidget() {
        super("fps", "FPS Counter", HudAnchor.TOP_LEFT, 8, 8);
        this.width = 60;
        this.height = 14;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        long now = System.currentTimeMillis();
        if (now - lastFpsUpdate > 250 || cachedFps == 0) { // Update 4x per sec (PRD §6.1)
            cachedFps = Minecraft.getInstance().getFps();
            lastFpsUpdate = now;
        }

        int displayFps = isEditor && cachedFps == 0 ? 144 : cachedFps;
        String text = "FPS: " + displayFps;

        Font font = getFont();
        this.width = font.width(text) + 8;
        this.height = font.lineHeight + 6;

        int color = getTextColor();
        // Threshold colors: >=60 green, 30-59 yellow, <30 red (PRD §6.1)
        if (displayFps >= 60) color = 0xFF34D399;
        else if (displayFps >= 30) color = 0xFFFBBF24;
        else color = 0xFFF87171;

        extractor.text(font, text, x + 4, y + 3, color, isShadow());
    }
}

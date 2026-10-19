package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;

public class PotionHudWidget extends HudWidget {
    public static class PotionEffectEntry {
        public final String name;
        public final int amplifier;
        public final int durationTicks;

        public PotionEffectEntry(String name, int amplifier, int durationTicks) {
            this.name = name;
            this.amplifier = amplifier;
            this.durationTicks = durationTicks;
        }

        public String getDurationFormatted() {
            int totalSeconds = durationTicks / 20;
            int minutes = totalSeconds / 60;
            int seconds = totalSeconds % 60;
            return String.format("%02d:%02d", minutes, seconds);
        }

        public String getDisplayLine() {
            String ampStr = amplifier > 0 ? " " + (amplifier + 1) : "";
            return name + ampStr + " (" + getDurationFormatted() + ")";
        }
    }

    public PotionHudWidget() {
        super("potions", "Active Potion Effects", HudAnchor.BOTTOM_LEFT, 16, 24, 1.0, 0.9, true);
        this.width = 140;
        this.height = 60;
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via native DrawContext
    }
}

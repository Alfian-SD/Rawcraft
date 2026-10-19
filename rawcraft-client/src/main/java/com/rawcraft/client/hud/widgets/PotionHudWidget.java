package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.network.chat.Component;
import net.minecraft.world.effect.MobEffectInstance;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class PotionHudWidget extends HudWidget {
    private boolean hideVanilla = true;
    private int blinkBelowSec = 10;

    public PotionHudWidget() {
        super("potions", "Active Potion Effects", HudAnchor.TOP_RIGHT, 8, 8);
        this.width = 90;
        this.height = 18;
    }

    public boolean isHideVanilla() {
        return hideVanilla;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        List<EffectEntry> entries = new ArrayList<>();

        if (mc.player != null) {
            Collection<MobEffectInstance> effects = mc.player.getActiveEffects();
            for (MobEffectInstance inst : effects) {
                String name = Component.translatable(inst.getDescriptionId()).getString();
                int amp = inst.getAmplifier();
                if (amp > 0) {
                    name += " " + toRoman(amp + 1);
                }
                int durTicks = inst.getDuration();
                boolean infinite = inst.isInfiniteDuration();
                entries.add(new EffectEntry(name, durTicks, infinite));
            }
        }

        if (entries.isEmpty() && isEditor) {
            entries.add(new EffectEntry("Speed II", 20 * 85, false));
            entries.add(new EffectEntry("Strength I", 20 * 42, false));
        }

        Font font = getFont();
        if (entries.isEmpty()) {
            this.width = 70;
            this.height = 14;
            return;
        }

        int curY = y + 3;
        int maxW = 40;

        long now = System.currentTimeMillis();
        boolean blinkHide = ((now / 400) % 2 == 0);

        for (EffectEntry entry : entries) {
            String durStr;
            boolean shouldBlink = false;
            if (entry.infinite) {
                durStr = "∞";
            } else {
                int totalSec = Math.max(0, entry.durationTicks / 20);
                int m = totalSec / 60;
                int s = totalSec % 60;
                durStr = String.format("%02d:%02d", m, s);
                if (totalSec <= blinkBelowSec) {
                    shouldBlink = true;
                }
            }

            int textColor = getTextColor();
            if (shouldBlink && blinkHide) {
                textColor = 0x55F87171; // Faded red during blink
            } else if (shouldBlink) {
                textColor = 0xFFF87171; // Red warning
            }

            String line = entry.name + " §7" + durStr;
            extractor.text(font, line, x + 4, curY, textColor, isShadow());

            maxW = Math.max(maxW, font.width(line));
            curY += font.lineHeight + 2;
        }

        this.width = maxW + 8;
        this.height = Math.max(14, curY - y + 1);
    }

    private static String toRoman(int number) {
        return switch (number) {
            case 1 -> "I";
            case 2 -> "II";
            case 3 -> "III";
            case 4 -> "IV";
            case 5 -> "V";
            default -> String.valueOf(number);
        };
    }

    private static class EffectEntry {
        final String name;
        final int durationTicks;
        final boolean infinite;

        EffectEntry(String name, int durationTicks, boolean infinite) {
            this.name = name;
            this.durationTicks = durationTicks;
            this.infinite = infinite;
        }
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.hideVanilla = cfg.hideVanilla;
        this.blinkBelowSec = cfg.blinkBelowSec;
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.hideVanilla = this.hideVanilla;
        cfg.blinkBelowSec = this.blinkBelowSec;
    }
}

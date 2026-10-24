package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Repositions and restyles the boss bar. */
public class BossBarMod extends HudMod {
    public BossBarMod() {
        super("bossBar", "Boss Bar", "Repositions and restyles the boss bar.", "text:BOSS BAR", ModTag.HUD);
    }

    @Override
    public int width() {
        return 60;
    }

    @Override
    public int height() {
        return 10;
    }

    @Override
    public void render(GuiGraphicsExtractor graphics, int x, int y) {
        // TODO: not implemented yet. Registered so the card, toggle and layout slot exist.
    }
}

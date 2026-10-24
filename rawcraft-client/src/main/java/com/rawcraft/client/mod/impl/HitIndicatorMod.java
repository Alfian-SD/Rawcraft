package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Flashes when your attack lands. */
public class HitIndicatorMod extends HudMod {
    public HitIndicatorMod() {
        super("hitIndicator", "Hit Indicator", "Flashes when your attack lands.", "target", ModTag.HUD, ModTag.PVP);
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

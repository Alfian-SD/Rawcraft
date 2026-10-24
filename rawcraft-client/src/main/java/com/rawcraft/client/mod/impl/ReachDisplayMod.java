package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Distance of your last hit. */
public class ReachDisplayMod extends HudMod {
    public ReachDisplayMod() {
        super("reachDisplay", "Reach Display", "Distance of your last hit.", "crosshair", ModTag.HUD, ModTag.PVP);
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

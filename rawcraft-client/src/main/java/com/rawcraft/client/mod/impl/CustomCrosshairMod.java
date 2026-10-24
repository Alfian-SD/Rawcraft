package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Replaces the vanilla crosshair. */
public class CustomCrosshairMod extends HudMod {
    public CustomCrosshairMod() {
        super("customCrosshair", "Custom Crosshair", "Replaces the vanilla crosshair.", "crosshair", ModTag.HUD, ModTag.PVP);
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

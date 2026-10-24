package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Hides HUD elements while nothing is happening. */
public class AutohideHudMod extends HudMod {
    public AutohideHudMod() {
        super("autohideHud", "Autohide HUD", "Hides HUD elements while nothing is happening.", "eye", ModTag.HUD);
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

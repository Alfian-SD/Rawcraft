package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/** Replaces the vanilla armour row with a cleaner bar. */
public class ArmorBarMod extends HudMod {
    public ArmorBarMod() {
        super("armorBar", "Armor Bar", "Replaces the vanilla armour row with a cleaner bar.", "armor", ModTag.HUD);
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

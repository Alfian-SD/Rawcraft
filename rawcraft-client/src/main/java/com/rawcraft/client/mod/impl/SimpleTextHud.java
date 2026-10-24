package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/**
 * Shared base for single-line HUD readouts.
 *
 * <p>Width and height are derived from the text, so a HUD element never reports a stale size after
 * its value changes length.
 */
abstract class SimpleTextHud extends HudMod {

    protected SimpleTextHud(String id, String displayName, String description, String iconKey,
                            ModTag... tags) {
        super(id, displayName, description, iconKey, tags);
    }

    /** The line to draw. Called several times per frame, so keep it cheap. */
    protected abstract String text();

    @Override
    public int width() {
        Minecraft mc = Minecraft.getInstance();
        return mc == null ? 40 : Math.max(1, mc.font.width(text()));
    }

    @Override
    public int height() {
        return 10;
    }

    @Override
    public void render(GuiGraphicsExtractor graphics, int x, int y) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }
        graphics.text(mc.font, text(), x, y, textColor());
    }
}

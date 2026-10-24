package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.ui.theme.Draw;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/**
 * WASD, jump, sneak and sprint key display.
 *
 * <p>Reads {@code KeyMapping.isDown()} directly, so remapped movement keys are reflected for free.
 */
public class KeystrokesMod extends HudMod {
    private static final int BOX = 15;
    private static final int GAP = 2;

    public KeystrokesMod() {
        super("keystrokes", "Keystrokes", "Shows pressed movement keys.", "key", ModTag.HUD, ModTag.PVP);
    }

    @Override
    public int width() {
        return BOX * 3 + GAP * 2;
    }

    @Override
    public int height() {
        return BOX * 3 + GAP * 2;
    }

    @Override
    public void render(GuiGraphicsExtractor graphics, int x, int y) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }
        int step = BOX + GAP;
        // Row 1: W centred. Row 2: A S D. Row 3: space, shift, sprint.
        box(graphics, mc, mc.options.keyUp, x + step, y, "W");
        box(graphics, mc, mc.options.keyLeft, x, y + step, "A");
        box(graphics, mc, mc.options.keyDown, x + step, y + step, "S");
        box(graphics, mc, mc.options.keyRight, x + step * 2, y + step, "D");
        box(graphics, mc, mc.options.keyJump, x, y + step * 2, "SP");
        box(graphics, mc, mc.options.keyShift, x + step, y + step * 2, "SN");
        box(graphics, mc, mc.options.keySprint, x + step * 2, y + step * 2, "SR");
    }

    private void box(GuiGraphicsExtractor g, Minecraft mc, KeyMapping mapping, int x, int y, String label) {
        boolean down = mapping != null && mapping.isDown();
        int background = down ? (accent.argb() & 0x00FFFFFF) | 0xCC000000 : 0x66000000;
        Draw.rounded(g, x, y, BOX, BOX, 3, background);
        int textColor = down ? 0xFFFFFFFF : textColor();
        g.centeredText(mc.font, label, x + BOX / 2, y + (BOX - 8) / 2, textColor);
    }
}

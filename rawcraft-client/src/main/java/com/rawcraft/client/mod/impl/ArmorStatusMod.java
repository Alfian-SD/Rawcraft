package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.ui.theme.Draw;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.item.ItemStack;

/** Durability bars for the four armour slots. */
public class ArmorStatusMod extends HudMod {
    private static final EquipmentSlot[] SLOTS = {
            EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET
    };
    private static final int BAR_WIDTH = 46;
    private static final int ROW = 11;

    public ArmorStatusMod() {
        super("armorStatus", "Armor Status", "Durability of every equipped armour piece.", "armor",
                ModTag.HUD, ModTag.PVP);
    }

    @Override
    public int width() {
        return BAR_WIDTH + 34;
    }

    @Override
    public int height() {
        return ROW * SLOTS.length;
    }

    @Override
    public void render(GuiGraphicsExtractor graphics, int x, int y) {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return;
        }
        for (int i = 0; i < SLOTS.length; i++) {
            ItemStack stack = player.getItemBySlot(SLOTS[i]);
            int rowY = y + i * ROW;
            if (stack.isEmpty()) {
                graphics.text(mc.font, "--", x, rowY, 0x80FFFFFF);
                continue;
            }
            int max = stack.getMaxDamage();
            int remaining = max <= 0 ? 0 : max - stack.getDamageValue();
            float fraction = max <= 0 ? 1f : remaining / (float) max;

            String label = stack.getHoverName().getString();
            graphics.text(mc.font, Draw.ellipsize(mc.font, label, 32), x, rowY, textColor());

            int barX = x + 34;
            int barY = rowY + 2;
            Draw.rounded(graphics, barX, barY, BAR_WIDTH, 4, 2, 0x66000000);
            int filled = Math.round(BAR_WIDTH * Math.max(0f, Math.min(1f, fraction)));
            int barColor = fraction > 0.5f ? accent.argb()
                    : (fraction > 0.2f ? 0xFFFFB300 : 0xFFE02B2B);
            if (filled > 0) {
                Draw.rounded(graphics, barX, barY, filled, 4, 2, barColor);
            }
            graphics.text(mc.font, String.valueOf(remaining), barX + BAR_WIDTH + 3, rowY, 0xB0FFFFFF);
        }
    }
}

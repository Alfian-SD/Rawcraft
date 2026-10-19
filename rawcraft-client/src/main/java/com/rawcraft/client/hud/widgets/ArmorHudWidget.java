package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.world.entity.EquipmentSlot;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;

import java.util.ArrayList;
import java.util.List;

public class ArmorHudWidget extends HudWidget {
    private String mode = "bar"; // "both", "raw", "percent", "bar"
    private boolean showEmpty = false;

    public static class ArmorItemData {
        public final String name;
        public final int currentDamage;
        public final int maxDamage;
        public final boolean hasDurability;

        public ArmorItemData(String name, int currentDamage, int maxDamage, boolean hasDurability) {
            this.name = name;
            this.currentDamage = currentDamage;
            this.maxDamage = maxDamage;
            this.hasDurability = hasDurability;
        }

        public int getPercentage() {
            if (!hasDurability || maxDamage <= 0) return 100;
            return Math.max(0, Math.min(100, Math.round(((float) currentDamage / maxDamage) * 100f)));
        }

        public int getColor() {
            if (!hasDurability) return 0xFFA79EC7;
            int pct = getPercentage();
            if (pct <= 25) return 0xFFF87171; // ERROR red
            if (pct <= 55) return 0xFFFBBF24; // WARNING amber
            return 0xFF34D399; // SUCCESS green
        }

        public String getReadout(String format) {
            if (!hasDurability) return "NO DURABILITY";
            int pct = getPercentage();
            if ("RAW".equalsIgnoreCase(format)) {
                return currentDamage + "/" + maxDamage;
            } else if ("PERCENT".equalsIgnoreCase(format)) {
                return pct + "%";
            } else {
                return currentDamage + " (" + pct + "%)";
            }
        }
    }

    public ArmorHudWidget() {
        super("armor", "Armor Durability", HudAnchor.BOTTOM_RIGHT, 8, 8);
        this.width = 110;
        this.height = 76;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        List<ItemStack> pieces = new ArrayList<>();

        if (mc.player != null) {
            // Armor order: helmet, chest, legs, boots
            EquipmentSlot[] slots = {EquipmentSlot.HEAD, EquipmentSlot.CHEST, EquipmentSlot.LEGS, EquipmentSlot.FEET};
            for (EquipmentSlot slot : slots) {
                ItemStack stack = mc.player.getItemBySlot(slot);
                if (!stack.isEmpty() || showEmpty) {
                    pieces.add(stack);
                }
            }
        }

        if (pieces.isEmpty() && isEditor) {
            pieces.add(new ItemStack(Items.NETHERITE_HELMET));
            pieces.add(new ItemStack(Items.NETHERITE_CHESTPLATE));
            pieces.add(new ItemStack(Items.NETHERITE_LEGGINGS));
            pieces.add(new ItemStack(Items.NETHERITE_BOOTS));
        }

        if (pieces.isEmpty()) {
            this.width = 60;
            this.height = 14;
            return;
        }

        Font font = getFont();
        int curY = y + 2;
        int maxW = 50;

        for (ItemStack piece : pieces) {
            if (piece.isEmpty()) continue;

            // 1. Draw 16x16 Item Sprite
            extractor.item(piece, x + 2, curY);

            // 2. Compute durability
            boolean hasDurability = piece.isDamageableItem();
            int max = piece.getMaxDamage();
            int current = max - piece.getDamageValue();
            ArmorItemData data = new ArmorItemData(piece.getHoverName().getString(), current, max, hasDurability);

            int textX = x + 22;
            int textY = curY + 4;
            int color = data.getColor();

            if ("bar".equalsIgnoreCase(mode) && hasDurability) {
                // Draw mini durability bar
                int barW = 44;
                int barH = 5;
                extractor.fill(textX, textY + 2, textX + barW, textY + 2 + barH, 0xFF241A44);
                int filledW = (int) Math.round((barW * data.getPercentage()) / 100.0);
                extractor.fill(textX, textY + 2, textX + filledW, textY + 2 + barH, color);
                extractor.outline(textX, textY + 2, barW, barH, 0x8833285C);
                maxW = Math.max(maxW, 22 + barW + 4);
            } else {
                String readout = data.getReadout(mode);
                extractor.text(font, readout, textX, textY, color, isShadow());
                maxW = Math.max(maxW, 22 + font.width(readout) + 4);
            }

            curY += 18;
        }

        this.width = maxW + 4;
        this.height = Math.max(20, curY - y + 2);
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.mode = cfg.mode != null ? cfg.mode : "bar";
        this.showEmpty = cfg.showEmpty;
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.mode = this.mode;
        cfg.showEmpty = this.showEmpty;
    }
}

package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.setting.StringSetting;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.world.item.ItemStack;

import java.util.Locale;

/** Counts one configured item across the inventory. */
public class ItemCounterMod extends SimpleTextHud {
    private final StringSetting itemId = new StringSetting("item", "Item id", "minecraft:ender_pearl", 64);

    public ItemCounterMod() {
        super("itemCounter", "Item Counter", "Counts a chosen item in your inventory.", "block", ModTag.HUD);
        addSetting(itemId);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return "0";
        }
        String wanted = itemId.get().trim().toLowerCase(Locale.ROOT);
        int count = 0;
        for (int slot = 0; slot < player.getInventory().getContainerSize(); slot++) {
            ItemStack stack = player.getInventory().getItem(slot);
            if (stack.isEmpty()) {
                continue;
            }
            String id = BuiltInRegistries.ITEM.getKey(stack.getItem()).toString();
            if (id.equals(wanted)) {
                count += stack.getCount();
            }
        }
        String shortName = wanted.contains(":") ? wanted.substring(wanted.indexOf(':') + 1) : wanted;
        return shortName.replace('_', ' ') + " " + count;
    }
}

package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

/** Keeps the player sprinting while moving forward. */
public class ToggleSprintMod extends ClientMod {

    public ToggleSprintMod() {
        super("toggleSprint", "Toggle Sprint", "Sprint stays on without holding the key.", "bolt", ModTag.PVP);
    }

    @Override
    public void onTick() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return;
        }
        if (player.isShiftKeyDown() || player.getFoodData().getFoodLevel() <= 6) {
            return;
        }
        boolean movingForward = mc.options.keyUp.isDown();
        if (movingForward && !player.isSprinting()) {
            player.setSprinting(true);
        }
    }
}

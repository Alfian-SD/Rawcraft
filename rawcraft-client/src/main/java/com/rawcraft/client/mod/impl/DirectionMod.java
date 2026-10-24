package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

import java.util.Locale;

/** Compass style facing label. */
public class DirectionMod extends SimpleTextHud {

    public DirectionMod() {
        super("direction", "Direction", "Facing direction as a compass label.", "compass", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return "N";
        }
        return player.getDirection().getName().toUpperCase(Locale.ROOT);
    }
}

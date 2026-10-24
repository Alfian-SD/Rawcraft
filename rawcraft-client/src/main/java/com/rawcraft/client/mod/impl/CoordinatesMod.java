package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

import java.util.Locale;

/** X / Y / Z readout, truncated to whole blocks like the vanilla debug screen. */
public class CoordinatesMod extends SimpleTextHud {

    public CoordinatesMod() {
        super("coordinates", "Coordinates", "Shows your X, Y and Z position.", "compass", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return "X 0 Y 0 Z 0";
        }
        return String.format(Locale.US, "X %d Y %d Z %d",
                (int) Math.floor(player.getX()),
                (int) Math.floor(player.getY()),
                (int) Math.floor(player.getZ()));
    }
}

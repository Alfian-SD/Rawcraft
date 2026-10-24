package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

import java.util.Locale;

/** Hunger saturation value. */
public class SaturationMod extends SimpleTextHud {

    public SaturationMod() {
        super("saturation", "Saturation", "Saturation and hunger values.", "potion", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            return "SAT 0.0";
        }
        return String.format(Locale.US, "SAT %.1f", player.getFoodData().getSaturationLevel());
    }
}

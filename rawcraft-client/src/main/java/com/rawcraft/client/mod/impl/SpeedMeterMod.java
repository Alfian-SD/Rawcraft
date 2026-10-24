package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.player.LocalPlayer;

import java.util.Locale;

/** Horizontal movement speed in blocks per second, sampled once per tick. */
public class SpeedMeterMod extends SimpleTextHud {
    private double lastX;
    private double lastZ;
    private boolean primed;
    private double blocksPerSecond;

    public SpeedMeterMod() {
        super("speedMeter", "Speed Meter", "Movement speed in blocks per second.", "gauge", ModTag.HUD);
    }

    @Override
    public void onTick() {
        Minecraft mc = Minecraft.getInstance();
        LocalPlayer player = mc == null ? null : mc.player;
        if (player == null) {
            primed = false;
            blocksPerSecond = 0;
            return;
        }
        if (!primed) {
            lastX = player.getX();
            lastZ = player.getZ();
            primed = true;
            return;
        }
        // A client tick is 50 ms, so multiply the per-tick distance by 20.
        double dx = player.getX() - lastX;
        double dz = player.getZ() - lastZ;
        blocksPerSecond = Math.sqrt(dx * dx + dz * dz) * 20.0;
        lastX = player.getX();
        lastZ = player.getZ();
    }

    @Override
    protected String text() {
        return String.format(Locale.US, "%.2f b/s", blocksPerSecond);
    }
}

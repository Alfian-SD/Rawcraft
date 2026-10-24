package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;

import java.util.Locale;

/**
 * Server ticks per second, estimated from the world game time delta.
 *
 * <p>ponytail: an estimate, not a measurement. A real TPS needs the server's own tick counter, which
 * a client cannot see. Upgrade path: sample {@code ClientboundSetTimePacket} arrivals instead.
 */
public class TpsMod extends SimpleTextHud {
    private long lastGameTime = -1;
    private long lastSampleAt;
    private double tps = 20.0;

    public TpsMod() {
        super("tps", "TPS", "Server ticks per second estimate.", "wave", ModTag.HUD);
    }

    @Override
    public void onTick() {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null || mc.level == null) {
            lastGameTime = -1;
            return;
        }
        long now = System.currentTimeMillis();
        long gameTime = mc.level.getGameTime();
        if (lastGameTime >= 0 && now > lastSampleAt) {
            long ticks = gameTime - lastGameTime;
            double seconds = (now - lastSampleAt) / 1000.0;
            if (seconds > 0.4) {
                tps = Math.max(0, Math.min(20.0, ticks / seconds));
                lastGameTime = gameTime;
                lastSampleAt = now;
            }
        } else {
            lastGameTime = gameTime;
            lastSampleAt = now;
        }
    }

    @Override
    protected String text() {
        return String.format(Locale.US, "%.1f TPS", tps);
    }
}

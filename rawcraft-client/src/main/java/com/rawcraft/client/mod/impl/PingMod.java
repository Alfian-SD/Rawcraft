package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ClientPacketListener;
import net.minecraft.client.multiplayer.PlayerInfo;

/** Round trip latency to the current server. */
public class PingMod extends SimpleTextHud {

    public PingMod() {
        super("ping", "Ping", "Round trip latency to the server.", "ping", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null || mc.player == null || mc.getConnection() == null) {
            return "-- ms";
        }
        ClientPacketListener connection = mc.getConnection();
        PlayerInfo info = connection.getPlayerInfo(mc.player.getUUID());
        return (info == null ? 0 : info.getLatency()) + " ms";
    }
}

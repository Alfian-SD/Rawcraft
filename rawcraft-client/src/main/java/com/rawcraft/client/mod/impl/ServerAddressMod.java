package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;
import net.minecraft.client.multiplayer.ServerData;

/** Address of the server you are connected to. */
public class ServerAddressMod extends SimpleTextHud {

    public ServerAddressMod() {
        super("serverAddress", "Server Address", "Shows the current server address.", "ping", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return "singleplayer";
        }
        ServerData server = mc.getCurrentServer();
        if (server != null && server.ip != null && !server.ip.isBlank()) {
            return server.ip;
        }
        return mc.getSingleplayerServer() != null ? "singleplayer" : "not connected";
    }
}

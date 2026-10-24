package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Rejoins the last server after a kick. */
public class ReconnectMod extends ClientMod {
    public ReconnectMod() {
        super("reconnect", "Reconnect", "Rejoins the last server after a kick.", "sync", ModTag.HYPIXEL);
    }
}

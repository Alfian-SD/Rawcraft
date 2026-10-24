package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Skips rendering hidden log blocks. */
public class CullLogsMod extends ClientMod {
    public CullLogsMod() {
        super("cullLogs", "Cull Logs", "Skips rendering hidden log blocks.", "list");
    }
}

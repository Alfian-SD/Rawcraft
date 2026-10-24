package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Records where and how you died. */
public class DeathInfoMod extends ClientMod {
    public DeathInfoMod() {
        super("deathInfo", "Death Info", "Records where and how you died.", "target");
    }
}

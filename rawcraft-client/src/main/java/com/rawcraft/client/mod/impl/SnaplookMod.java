package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Hold a key to lock your camera forward. */
public class SnaplookMod extends ClientMod {
    public SnaplookMod() {
        super("snaplook", "Snaplook", "Hold a key to lock your camera forward.", "compass", ModTag.PVP);
    }
}

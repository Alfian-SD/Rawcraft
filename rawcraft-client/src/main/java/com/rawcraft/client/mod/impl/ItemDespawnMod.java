package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Timers for items about to despawn. */
public class ItemDespawnMod extends ClientMod {
    public ItemDespawnMod() {
        super("itemDespawn", "Item Despawn", "Timers for items about to despawn.", "clock");
    }
}

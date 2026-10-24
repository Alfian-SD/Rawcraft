package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Dropped items fall with physics. */
public class ItemPhysicMod extends ClientMod {
    public ItemPhysicMod() {
        super("itemPhysic", "Item Physic", "Dropped items fall with physics.", "block");
    }
}

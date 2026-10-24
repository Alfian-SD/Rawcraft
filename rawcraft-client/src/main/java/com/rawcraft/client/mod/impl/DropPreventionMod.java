package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Blocks dropping hotbar items on a key slip. */
public class DropPreventionMod extends ClientMod {
    public DropPreventionMod() {
        super("dropPrevention", "Drop Prevention", "Blocks dropping hotbar items on a key slip.", "shield", ModTag.PVP);
    }
}

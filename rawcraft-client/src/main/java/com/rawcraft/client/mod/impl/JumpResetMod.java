package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Resets sprint on jump for combos. */
public class JumpResetMod extends ClientMod {
    public JumpResetMod() {
        super("jumpReset", "Jump Reset", "Resets sprint on jump for combos.", "bolt", ModTag.PVP);
    }
}

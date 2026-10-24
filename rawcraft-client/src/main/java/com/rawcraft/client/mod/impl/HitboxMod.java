package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Draws entity hitboxes. */
public class HitboxMod extends ClientMod {
    public HitboxMod() {
        super("hitbox", "Hitbox", "Draws entity hitboxes.", "target", ModTag.PVP);
    }
}

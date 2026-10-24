package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Highlights hostile mobs. */
public class MobOverlayMod extends ClientMod {
    public MobOverlayMod() {
        super("mobOverlay", "Mob Overlay", "Highlights hostile mobs.", "team");
    }
}

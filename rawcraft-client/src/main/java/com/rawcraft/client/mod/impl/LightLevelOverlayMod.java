package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Marks blocks where mobs can spawn. */
public class LightLevelOverlayMod extends ClientMod {
    public LightLevelOverlayMod() {
        super("lightLevelOverlay", "Light Level Overlay", "Marks blocks where mobs can spawn.", "bolt");
    }
}

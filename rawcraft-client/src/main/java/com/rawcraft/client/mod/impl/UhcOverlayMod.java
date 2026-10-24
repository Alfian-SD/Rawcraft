package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** UHC specific health and timer overlay. */
public class UhcOverlayMod extends ClientMod {
    public UhcOverlayMod() {
        super("uhcOverlay", "UHC Overlay", "UHC specific health and timer overlay.", "target", ModTag.HYPIXEL);
    }
}

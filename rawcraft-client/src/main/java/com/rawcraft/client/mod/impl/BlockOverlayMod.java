package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Custom outline around the targeted block. */
public class BlockOverlayMod extends ClientMod {
    public BlockOverlayMod() {
        super("blockOverlay", "Block Overlay", "Custom outline around the targeted block.", "block");
    }
}

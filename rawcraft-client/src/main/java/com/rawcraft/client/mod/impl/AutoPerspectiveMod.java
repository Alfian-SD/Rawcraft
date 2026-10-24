package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Switches to third person while sprinting. */
public class AutoPerspectiveMod extends ClientMod {
    public AutoPerspectiveMod() {
        super("autoPerspective", "Auto Perspective", "Switches to third person while sprinting.", "camera");
    }
}

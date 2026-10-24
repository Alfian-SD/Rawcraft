package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Replaces the vanilla swing with a smoother animation. */
public class AnimationsMod extends ClientMod {
    public AnimationsMod() {
        super("animations", "Animations", "Replaces the vanilla swing with a smoother animation.", "star", ModTag.PVP);
    }
}

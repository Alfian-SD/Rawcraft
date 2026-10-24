package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;

/** Frames per second counter. */
public class FpsMod extends SimpleTextHud {

    public FpsMod() {
        super("fps", "FPS", "Frames per second counter.", "gauge", ModTag.HUD);
    }

    @Override
    protected String text() {
        Minecraft mc = Minecraft.getInstance();
        return (mc == null ? 0 : mc.getFps()) + " FPS";
    }
}

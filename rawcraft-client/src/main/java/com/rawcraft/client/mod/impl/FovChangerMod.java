package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.setting.SliderSetting;
import net.minecraft.client.Minecraft;

/** Overrides the field of view while enabled. */
public class FovChangerMod extends ClientMod {
    private final SliderSetting fov = new SliderSetting("fov", "Field of view", 90, 30, 150, 1, "\u00b0");
    private Integer previous;

    public FovChangerMod() {
        super("fovChanger", "FOV Changer", "Overrides the field of view.", "eye");
        addSetting(fov);
    }

    @Override
    protected void onEnable() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null) {
            previous = mc.options.fov().get();
        }
    }

    @Override
    protected void onDisable() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null && previous != null) {
            mc.options.fov().set(previous);
            previous = null;
        }
    }

    @Override
    public void onTick() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null && !mc.options.fov().get().equals(fov.asInt())) {
            mc.options.fov().set(fov.asInt());
        }
    }
}

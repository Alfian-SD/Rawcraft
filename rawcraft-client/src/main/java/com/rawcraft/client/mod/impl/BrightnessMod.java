package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;

/**
 * Pushes gamma to the vanilla maximum while enabled and restores the player's value on disable.
 *
 * <p>ponytail: capped at 1.0 because {@code OptionInstance} clamps to its declared range. Going
 * further needs a lightmap mixin. Upgrade path: inject into {@code LightmapTextureManager}.
 */
public class BrightnessMod extends ClientMod {
    private Double previous;

    public BrightnessMod() {
        super("brightness", "Brightness", "Maxes out gamma brightness.", "star");
    }

    @Override
    protected void onEnable() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null) {
            previous = mc.options.gamma().get();
            mc.options.gamma().set(1.0D);
        }
    }

    @Override
    protected void onDisable() {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null && previous != null) {
            mc.options.gamma().set(previous);
            previous = null;
        }
    }
}

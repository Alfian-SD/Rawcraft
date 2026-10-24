package com.rawcraft.client.mixin;

import com.rawcraft.client.mod.ModManager;
import net.minecraft.client.Minecraft;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Drives the mod tick loop and the debounced config save. */
@Mixin(value = Minecraft.class, remap = false)
public class MinecraftMixin {

    @Inject(method = "tick", at = @At("HEAD"))
    private void rawcraft$tick(CallbackInfo ci) {
        ModManager.get().tick();
    }
}

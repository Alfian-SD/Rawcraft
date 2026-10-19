package com.rawcraft.client.mixin;

import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.module.impl.FullbrightModule;
import net.minecraft.client.renderer.LightmapRenderStateExtractor;
import net.minecraft.client.renderer.state.LightmapRenderState;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = LightmapRenderStateExtractor.class, remap = false)
public class LightmapMixin {

    @Inject(method = "extract", at = @At("RETURN"))
    private void onExtractLightmap(LightmapRenderState state, float tickDelta, CallbackInfo ci) {
        FullbrightModule mod = ModuleManager.getInstance().getModule(FullbrightModule.class);
        if (mod != null && mod.isEnabled()) {
            state.brightness = 1.0f;
            state.blockFactor = 1.0f;
            state.skyFactor = 1.0f;
            state.nightVisionEffectIntensity = 1.0f;
            state.darknessEffectScale = 0.0f;
            state.needsUpdate = true;
        }
    }
}

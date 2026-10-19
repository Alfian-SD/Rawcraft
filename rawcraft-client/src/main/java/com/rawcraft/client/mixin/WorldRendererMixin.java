package com.rawcraft.client.mixin;

import com.rawcraft.client.performance.PerformanceManager;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(targets = "net.minecraft.client.renderer.LevelRenderer", remap = false)
public class WorldRendererMixin {

    @Inject(method = {"renderSnowAndRain", "renderSnowAndRain(Lnet/minecraft/client/renderer/LightTexture;FDDD)V"},
            at = @At("HEAD"), cancellable = true, require = 0)
    private void onRenderSnowAndRain(CallbackInfo ci) {
        if (!PerformanceManager.getInstance().isWeatherPrecipitation()) {
            ci.cancel();
        }
    }
}

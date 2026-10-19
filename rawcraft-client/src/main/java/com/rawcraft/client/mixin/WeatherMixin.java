package com.rawcraft.client.mixin;

import com.rawcraft.client.config.ConfigManager;
import net.minecraft.client.multiplayer.ClientLevel;
import net.minecraft.client.renderer.WeatherEffectRenderer;
import net.minecraft.client.renderer.state.level.WeatherRenderState;
import net.minecraft.world.phys.Vec3;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = WeatherEffectRenderer.class, remap = false)
public class WeatherMixin {

    @Inject(method = "extractRenderState", at = @At("HEAD"), cancellable = true)
    private void onExtractRenderState(ClientLevel level, float tickDelta, Vec3 pos, WeatherRenderState state, CallbackInfo ci) {
        if (!ConfigManager.getInstance().getConfig().modules.weather.precipitation) {
            state.reset();
            ci.cancel();
        }
    }
}

package com.rawcraft.client.mixin;

import com.rawcraft.client.input.ClickTracker;
import net.minecraft.client.MouseHandler;
import net.minecraft.client.input.MouseButtonInfo;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(value = MouseHandler.class, remap = false)
public class MouseHandlerMixin {

    @Inject(method = "onButton(JLnet/minecraft/client/input/MouseButtonInfo;I)V", at = @At("HEAD"))
    private void rawcraft$onButton(long window, MouseButtonInfo info, int action, CallbackInfo ci) {
        if (action == 1) { // GLFW_PRESS
            ClickTracker.record(info.button());
        }
    }
}

package com.rawcraft.client.mixin;

import com.rawcraft.client.input.ClickTracker;
import net.minecraft.client.MouseHandler;
import net.minecraft.client.input.MouseButtonInfo;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(value = MouseHandler.class, remap = false)
public class MouseMixin {

    // Modern Minecraft 26.x signature
    @Inject(method = "onButton(JLnet/minecraft/client/input/MouseButtonInfo;I)V", at = @At("HEAD"), require = 0)
    private void onModernMouseButton(long window, MouseButtonInfo info, int action, CallbackInfo ci) {
        if (action == 1) { // GLFW_PRESS
            ClickTracker.getInstance().recordClick(info.button());
        }
    }

    // Intermediary / legacy signature
    @Inject(method = {"onPress", "onMouseButton"}, at = @At("HEAD"), require = 0)
    private void onLegacyMouseButton(long window, int button, int action, int mods, CallbackInfo ci) {
        if (action == 1) {
            ClickTracker.getInstance().recordClick(button);
        }
    }
}

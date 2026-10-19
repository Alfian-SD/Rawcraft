package com.rawcraft.client.mixin;

import com.rawcraft.client.modules.ModuleManager;
import com.rawcraft.client.modules.impl.CustomCrosshairModule;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(targets = "net.minecraft.client.gui.Gui", remap = false)
public class InGameHudMixin {

    @Inject(method = {"renderCrosshair", "renderCrosshair(Lnet/minecraft/client/gui/GuiGraphics;F)V"},
            at = @At("HEAD"), cancellable = true, require = 0)
    private void onRenderCrosshair(CallbackInfo ci) {
        CustomCrosshairModule mod = ModuleManager.getInstance().getModule(CustomCrosshairModule.class);
        if (mod != null && mod.isEnabled()) {
            ci.cancel();
        }
    }
}

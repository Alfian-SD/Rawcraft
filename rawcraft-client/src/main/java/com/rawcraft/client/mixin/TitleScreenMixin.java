package com.rawcraft.client.mixin;

import com.rawcraft.client.ui.ModMenuScreen;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.gui.screens.TitleScreen;
import net.minecraft.network.chat.Component;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Adds the Mod Menu entry point to the title screen. */
@Mixin(value = TitleScreen.class, remap = false)
public abstract class TitleScreenMixin extends Screen {

    protected TitleScreenMixin(Component title) {
        super(title);
    }

    @Inject(method = "init", at = @At("RETURN"))
    private void rawcraft$addModMenuButton(CallbackInfo ci) {
        int width = 200;
        int x = this.width / 2 - width / 2;
        int y = this.height - 36;
        this.addRenderableWidget(Button.builder(Component.literal("Mod Menu"), button -> ModMenuScreen.open(this))
                .bounds(x, y, width, 20)
                .build());
    }
}

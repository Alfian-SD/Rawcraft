package com.rawcraft.client.mixin;

import com.rawcraft.client.ui.ModMenuScreen;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.screens.PauseScreen;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** Adds the Mod Menu entry point to the pause menu, stacked above the disconnect button. */
@Mixin(value = PauseScreen.class, remap = false)
public abstract class PauseScreenMixin extends Screen {

    @Shadow
    private Button disconnectButton;

    protected PauseScreenMixin(Component title) {
        super(title);
    }

    @Inject(method = "init", at = @At("RETURN"))
    private void rawcraft$addModMenuButton(CallbackInfo ci) {
        int width = 204;
        int height = 20;
        int x = this.width / 2 - width / 2;
        int y;

        if (this.disconnectButton != null) {
            x = this.disconnectButton.getX();
            width = this.disconnectButton.getWidth();
            y = this.disconnectButton.getY() - height - 4;
        } else {
            y = this.height / 2 + 48;
        }

        this.addRenderableWidget(Button.builder(Component.literal("Mod Menu"), button -> ModMenuScreen.open(this))
                .bounds(x, y, width, height)
                .build());
    }
}

package com.rawcraft.client.mixin;

import com.rawcraft.client.ui.RawCraftMenuScreen;
import net.minecraft.client.gui.components.Button;
import net.minecraft.client.gui.screens.PauseScreen;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.network.chat.Component;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(value = PauseScreen.class, remap = false)
public abstract class PauseMenuMixin extends Screen {

    protected PauseMenuMixin(Component title) {
        super(title);
    }

    @Inject(method = "init", at = @At("RETURN"), require = 0)
    private void onInitPauseMenu(CallbackInfo ci) {
        try {
            // Prominent RawCraft Client button in top-left pause menu
            Button rawcraftBtn = Button.builder(
                Component.literal("RAWCRAFT CLIENT // [R-SHIFT]"),
                btn -> {
                    RawCraftMenuScreen.openScreen(new RawCraftMenuScreen(this));
                }
            ).bounds(10, 10, 185, 20).build();

            this.addRenderableWidget(rawcraftBtn);
        } catch (Throwable t) {
            System.err.println("[RawCraft] Could not inject pause menu button: " + t.getMessage());
        }
    }
}

package com.rawcraft.client.mixin;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.ui.ModMenuScreen;
import net.minecraft.client.KeyboardHandler;
import net.minecraft.client.Minecraft;
import net.minecraft.client.input.KeyEvent;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Global Mod Menu keybind.
 *
 * <p>Only fires while no screen is open; once a screen owns the keyboard it handles its own keys, so
 * there is no double-toggle. Fabric's {@code KeyBindingHelper} is not available (no Fabric API on the
 * classpath), so the key is read straight from {@link ModManager#menuKeybind}.
 */
@Mixin(value = KeyboardHandler.class, remap = false)
public class KeyboardHandlerMixin {

    @Inject(method = "keyPress(JILnet/minecraft/client/input/KeyEvent;)V", at = @At("HEAD"), cancellable = true)
    private void rawcraft$onKeyPress(long window, int action, KeyEvent event, CallbackInfo ci) {
        if (action != 1) { // GLFW_PRESS
            return;
        }
        Minecraft mc = Minecraft.getInstance();
        if (mc == null || mc.gui == null || mc.gui.screen() != null) {
            return;
        }
        if (ModManager.get().menuKeybind.matches(event.key())) {
            ModMenuScreen.open(null);
            ci.cancel();
            return;
        }
        for (ClientMod mod : ModManager.get().mods()) {
            if (mod.enabled()) {
                mod.onKey(event.key());
            }
        }
    }
}

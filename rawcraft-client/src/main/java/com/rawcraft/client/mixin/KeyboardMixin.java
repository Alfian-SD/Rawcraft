package com.rawcraft.client.mixin;

import com.rawcraft.client.input.KeybindManager;
import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.ui.HudEditorScreen;
import com.rawcraft.client.ui.RawCraftMenuScreen;
import com.rawcraft.client.util.RawCraftLogger;
import net.minecraft.client.KeyboardHandler;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.KeyEvent;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Pseudo;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Pseudo
@Mixin(value = KeyboardHandler.class, remap = false)
public class KeyboardMixin {

    @Shadow
    @Final
    private Minecraft minecraft;

    // Modern Minecraft 26.x signature: keyPress(long, int, KeyEvent)
    @Inject(method = "keyPress(JILnet/minecraft/client/input/KeyEvent;)V", at = @At("HEAD"), require = 0)
    private void onModernKeyPress(long window, int action, KeyEvent event, CallbackInfo ci) {
        if (action == 1) { // GLFW_PRESS
            handleKey(event.key());
        }
    }

    // Standard / Fabric intermediary signature: onKey(JIIII)V
    @Inject(method = {"onKey", "keyPress(JIIII)V"}, at = @At("HEAD"), require = 0)
    private void onLegacyKeyPress(long window, int key, int scancode, int action, int modifiers, CallbackInfo ci) {
        if (action == 1) { // GLFW_PRESS
            handleKey(key);
        }
    }

    private void handleKey(int key) {
        if (key <= 0) return;

        // 1. Menu open shortcut (Default Right Shift)
        if (KeybindManager.getInstance().matchesMenuKey(key)) {
            try {
                Screen curScreen = RawCraftMenuScreen.getCurrentScreen();
                if (curScreen == null) {
                    RawCraftMenuScreen.openScreen(new RawCraftMenuScreen(null));
                } else if (curScreen instanceof RawCraftMenuScreen) {
                    curScreen.onClose();
                } else {
                    RawCraftMenuScreen.openScreen(new RawCraftMenuScreen(curScreen));
                }
            } catch (Throwable t) {
                RawCraftLogger.error("Error handling client shortcut key", t);
            }
            return;
        }

        // Only handle gameplay toggles if no screen is open
        boolean noScreen = (minecraft.gui == null || minecraft.gui.screen() == null);
        if (noScreen) {
            KeybindManager km = KeybindManager.getInstance();
            if (km.getFullbrightKey() != null && key == km.getFullbrightKey()) {
                ModuleManager.getInstance().toggleModule("fullbright");
            } else if (km.getSprintKey() != null && key == km.getSprintKey()) {
                ModuleManager.getInstance().toggleModule("togglesprint");
            }
        }
    }
}

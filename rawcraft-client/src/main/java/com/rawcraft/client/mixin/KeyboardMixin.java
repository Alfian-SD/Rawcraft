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

    private int qaTickCounter = 0;

    @Inject(method = "tick", at = @At("RETURN"), require = 0)
    private void onKeyboardTick(CallbackInfo ci) {
        qaTickCounter++;
        if (qaTickCounter % 5 != 0) return;

        if (this.minecraft == null || this.minecraft.gameDirectory == null) return;
        java.io.File qaFile = new java.io.File(this.minecraft.gameDirectory, "rawcraft_qa.txt");
        if (!qaFile.exists()) return;

        try {
            java.util.List<String> lines = java.nio.file.Files.readAllLines(qaFile.toPath());
            qaFile.delete();

            for (String rawCmd : lines) {
                String cmd = rawCmd.trim();
                if (cmd.isEmpty() || cmd.startsWith("#")) continue;
                RawCraftLogger.info("[QA Action]: Executing: " + cmd);

                String[] parts = cmd.split(" ");
                String action = parts[0].toLowerCase();

                switch (action) {
                    case "diag": {
                        RawCraftLogger.info("-------------------- /rawcraft diag --------------------");
                        for (com.rawcraft.client.module.Module m : ModuleManager.getInstance().getModules()) {
                            RawCraftLogger.info("  Module [" + m.getId() + "] " + m.getName() + " -> " + m.getStatus() + " (enabled=" + m.isEnabled() + ")");
                        }
                        for (com.rawcraft.client.hud.HudWidget w : com.rawcraft.client.hud.HudManager.getInstance().getWidgets()) {
                            RawCraftLogger.info("  HUD [" + w.getName() + "] -> anchor=" + w.getAnchor() + ", offset=(" + w.getOffsetX() + "," + w.getOffsetY() + "), enabled=" + w.isEnabled());
                        }
                        RawCraftLogger.info("  Performance Profile -> " + com.rawcraft.client.performance.PerformanceManager.getInstance().getCurrentProfile());
                        RawCraftLogger.info("-------------------------------------------------------");
                        break;
                    }
                    case "screenshot": {
                        net.minecraft.client.Screenshot.grab(this.minecraft, false);
                        RawCraftLogger.info("[QA Screenshot Captured via Screenshot.grab]");
                        break;
                    }
                    case "open_menu": {
                        RawCraftMenuScreen.openScreen(new RawCraftMenuScreen(null));
                        RawCraftLogger.info("[QA Action]: Opened RawCraftMenuScreen");
                        break;
                    }
                    case "open_editor": {
                        RawCraftMenuScreen.openScreen(new HudEditorScreen(null));
                        RawCraftLogger.info("[QA Action]: Opened HudEditorScreen");
                        break;
                    }
                    case "close_screen": {
                        RawCraftMenuScreen.openScreen(null);
                        RawCraftLogger.info("[QA Action]: Closed active screen");
                        break;
                    }
                    case "tab": {
                        if (parts.length > 1) {
                            String tabName = parts[1].toUpperCase();
                            Screen cur = RawCraftMenuScreen.getCurrentScreen();
                            if (cur instanceof RawCraftMenuScreen menu) {
                                try {
                                    RawCraftMenuScreen.Tab tab = RawCraftMenuScreen.Tab.valueOf(tabName);
                                    menu.setActiveTab(tab);
                                    RawCraftLogger.info("[QA Action]: Switched menu tab to " + tab);
                                } catch (Exception e) {
                                    RawCraftLogger.error("Unknown tab: " + tabName);
                                }
                            }
                        }
                        break;
                    }
                    case "toggle": {
                        if (parts.length > 1) {
                            String modId = parts[1].toLowerCase();
                            ModuleManager.getInstance().toggleModule(modId);
                            RawCraftLogger.info("[QA Action]: Toggled module " + modId);
                        }
                        break;
                    }
                    case "profile": {
                        if (parts.length > 1) {
                            try {
                                com.rawcraft.client.performance.PerformanceProfile p = com.rawcraft.client.performance.PerformanceProfile.valueOf(parts[1].toUpperCase());
                                com.rawcraft.client.performance.PerformanceManager.getInstance().applyProfile(p);
                                RawCraftLogger.info("[QA Action]: Applied performance profile " + p);
                            } catch (Exception e) {
                                RawCraftLogger.error("Unknown profile: " + parts[1]);
                            }
                        }
                        break;
                    }
                    default:
                        RawCraftLogger.warn("[QA Action]: Unknown QA command: " + cmd);
                        break;
                }
            }
        } catch (Throwable t) {
            RawCraftLogger.error("Failed executing QA command from file", t);
        }
    }
}

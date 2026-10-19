package com.rawcraft.client.hud;

import com.rawcraft.client.config.ConfigManager;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class HudRenderer {

    public static void render(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) return;

        // 1. F1 Hide GUI check
        if (mc.gui != null && mc.gui.hud != null && mc.gui.hud.isHidden()) {
            return;
        }

        // 2. Hide when screen is open (e.g. inventory, pause, chat) unless in HUD Editor
        boolean inEditor = mc.gui != null && mc.gui.screen() != null && mc.gui.screen().getClass().getSimpleName().contains("HudEditor");
        if (!inEditor && mc.gui != null && mc.gui.screen() != null) {
            // Keep chat visible if chat screen is open, but do not render full HUD over pause/inventory
            String screenName = mc.gui.screen().getClass().getSimpleName();
            if (!screenName.toLowerCase().contains("chat")) {
                return;
            }
        }

        // 3. F3 Debug Screen check
        boolean hideOnF3 = ConfigManager.getInstance().getConfig().hud.hideOnF3;
        if (hideOnF3 && mc.gui != null && mc.gui.hud != null && mc.gui.hud.getDebugOverlay() != null) {
            if (mc.gui.hud.getDebugOverlay().showDebugScreen()) {
                return;
            }
        }

        int screenW = mc.getWindow().getGuiScaledWidth();
        int screenH = mc.getWindow().getGuiScaledHeight();

        // 4. Render all enabled widgets
        for (HudWidget widget : HudManager.getInstance().getWidgets()) {
            if (widget.isEnabled() || inEditor) {
                try {
                    widget.renderWidget(extractor, deltaTracker, screenW, screenH, inEditor);
                } catch (Throwable t) {
                    // Fail-safe: one widget render error never crashes the HUD or game
                }
            }
        }
    }

    public static boolean shouldCancelVanillaCrosshair() {
        HudWidget crosshair = HudManager.getInstance().getWidget("crosshair");
        return crosshair != null && crosshair.isEnabled();
    }

    public static boolean shouldHideVanillaEffects() {
        HudWidget potions = HudManager.getInstance().getWidget("potions");
        if (potions instanceof com.rawcraft.client.hud.widgets.PotionHudWidget pw) {
            return pw.isEnabled() && pw.isHideVanilla();
        }
        return false;
    }
}

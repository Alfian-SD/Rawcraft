package com.rawcraft.client.hud;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.ui.theme.Draw;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/**
 * Draws every enabled {@link HudMod}.
 *
 * <p>Called from {@code HudMixin} at the tail of the vanilla HUD pass. A disabled mod is skipped
 * before any matrix or draw work happens, which is what keeps disabled mods at zero cost.
 */
public final class HudRenderer {
    private static final int BACKGROUND = 0x66000000;

    private HudRenderer() {
    }

    public static void render(GuiGraphicsExtractor graphics, DeltaTracker deltaTracker) {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }
        int screenWidth = graphics.guiWidth();
        int screenHeight = graphics.guiHeight();

        for (ClientMod mod : ModManager.get().mods()) {
            if (!(mod instanceof HudMod hud) || !hud.enabled()) {
                continue;
            }
            int x = hud.resolveX(screenWidth);
            int y = hud.resolveY(screenHeight);
            float scale = hud.scale.asFloat();

            graphics.pose().pushMatrix();
            graphics.pose().translate((float) x, (float) y);
            graphics.pose().scale(scale, scale);
            if (hud.background.get()) {
                Draw.rounded(graphics, -3, -3, hud.width() + 6, hud.height() + 6, 4, BACKGROUND);
            }
            try {
                hud.render(graphics, 0, 0);
            } catch (Throwable t) {
                // A broken HUD mod must never take the whole frame down.
                hud.setEnabled(false);
                ModManager.get().markDirty();
            }
            graphics.pose().popMatrix();
        }
    }
}

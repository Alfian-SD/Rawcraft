package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.Options;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class KeystrokesWidget extends HudWidget {
    private String layout = "compact";
    private int idleColor = 0x33FFFFFF;
    private int pressedColor = 0xCC8B5CF6; // RawCraft Accent

    public KeystrokesWidget() {
        super("keystrokes", "Keystrokes Display", HudAnchor.BOTTOM_LEFT, 8, 100);
        this.width = 68;
        this.height = 68;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        Options opt = mc.options;

        boolean wDown = isEditor || (opt != null && opt.keyUp.isDown());
        boolean aDown = !isEditor && (opt != null && opt.keyLeft.isDown());
        boolean sDown = !isEditor && (opt != null && opt.keyDown.isDown());
        boolean dDown = !isEditor && (opt != null && opt.keyRight.isDown());
        boolean lmbDown = !isEditor && (opt != null && opt.keyAttack.isDown());
        boolean rmbDown = !isEditor && (opt != null && opt.keyUse.isDown());
        boolean spaceDown = !isEditor && (opt != null && opt.keyJump.isDown());

        Font font = getFont();

        int boxSize = 20;
        int gap = 2;

        // W key: center top
        int wx = x + boxSize + gap;
        int wy = y;
        drawKeyBox(extractor, font, "W", wx, wy, boxSize, boxSize, wDown);

        // A key
        int ax = x;
        int ay = y + boxSize + gap;
        drawKeyBox(extractor, font, "A", ax, ay, boxSize, boxSize, aDown);

        // S key
        int sx = x + boxSize + gap;
        int sy = y + boxSize + gap;
        drawKeyBox(extractor, font, "S", sx, sy, boxSize, boxSize, sDown);

        // D key
        int dx = x + (boxSize + gap) * 2;
        int dy = y + boxSize + gap;
        drawKeyBox(extractor, font, "D", dx, dy, boxSize, boxSize, dDown);

        // Mouse buttons: LMB & RMB
        int mouseW = (boxSize * 3 + gap * 2 - gap) / 2;
        int my = y + (boxSize + gap) * 2;
        drawKeyBox(extractor, font, "LMB", x, my, mouseW, 16, lmbDown);
        drawKeyBox(extractor, font, "RMB", x + mouseW + gap, my, mouseW, 16, rmbDown);

        int totalH = (boxSize + gap) * 2 + 16;
        if ("full".equalsIgnoreCase(layout)) {
            int spaceY = my + 16 + gap;
            int totalW = boxSize * 3 + gap * 2;
            drawKeyBox(extractor, font, "───────", x, spaceY, totalW, 12, spaceDown);
            totalH += 12 + gap;
        }

        this.width = boxSize * 3 + gap * 2;
        this.height = totalH;
    }

    private void drawKeyBox(GuiGraphicsExtractor extractor, Font font, String label, int bx, int by, int bw, int bh, boolean isPressed) {
        int bg = isPressed ? pressedColor : idleColor;
        extractor.fill(bx, by, bx + bw, by + bh, bg);
        extractor.outline(bx, by, bw, bh, isPressed ? 0xFF8B5CF6 : 0x44FFFFFF);

        int textCol = isPressed ? 0xFFFFFFFF : 0xFFE0E0E0;
        int textW = font.width(label);
        int tx = bx + (bw - textW) / 2;
        int ty = by + (bh - font.lineHeight) / 2 + 1;
        extractor.text(font, label, tx, ty, textCol, isShadow());
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.layout = cfg.layout;
        try {
            if (cfg.idleColor != null) this.idleColor = (int) Long.parseLong(cfg.idleColor.replace("#", ""), 16);
            if (cfg.pressedColor != null) this.pressedColor = (int) Long.parseLong(cfg.pressedColor.replace("#", ""), 16);
        } catch (Exception ignored) {}
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.layout = this.layout;
    }
}

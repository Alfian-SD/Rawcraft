package com.rawcraft.client.ui.components;

import com.rawcraft.client.ui.RawCraftTheme;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

public class RawCraftButton {
    public int x;
    public int y;
    public int width;
    public int height;
    public String text;
    public Runnable action;
    public boolean enabled = true;
    public boolean active = false;
    public boolean danger = false;
    public boolean secondary = false;
    public int customColor = 0;

    public RawCraftButton(int x, int y, int width, int height, String text, Runnable action) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.action = action;
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (enabled && button == 0 && isMouseOver(mouseX, mouseY)) {
            if (action != null) {
                action.run();
                return true;
            }
        }
        return false;
    }

    public void render(GuiGraphicsExtractor extractor, Font font, int mouseX, int mouseY) {
        boolean hovered = enabled && isMouseOver(mouseX, mouseY);
        int bg;
        int border;
        int textColor;

        if (!enabled) {
            bg = 0xFF140E26;
            border = 0xFF2A2048;
            textColor = RawCraftTheme.TEXT_DISABLED;
        } else if (danger) {
            bg = hovered ? 0xFF882020 : 0xFF551515;
            border = hovered ? 0xFFF87171 : 0xFF882020;
            textColor = 0xFFFEE2E2;
        } else if (active) {
            bg = RawCraftTheme.ACCENT;
            border = RawCraftTheme.ACCENT_HOVER;
            textColor = 0xFFFFFFFF;
        } else if (secondary) {
            bg = hovered ? 0xFF241A44 : 0xFF1B1334;
            border = hovered ? 0xFF4C3D7E : RawCraftTheme.BORDER_SUBTLE;
            textColor = hovered ? RawCraftTheme.TEXT_PRIMARY : RawCraftTheme.TEXT_SECONDARY;
        } else {
            bg = hovered ? 0xFF2A1E50 : 0xFF1E1538;
            border = hovered ? RawCraftTheme.ACCENT : RawCraftTheme.BORDER_SUBTLE;
            textColor = hovered ? 0xFFFFFFFF : RawCraftTheme.TEXT_PRIMARY;
        }

        // Fill background & 1px border
        extractor.fill(x, y, x + width, y + height, bg);
        extractor.outline(x, y, width, height, border);

        // Center text
        int textW = font.width(text);
        int textX = x + (width - textW) / 2;
        int textY = y + (height - font.lineHeight) / 2 + 1;
        extractor.text(font, text, textX, textY, textColor, true);
    }
}

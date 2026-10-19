package com.rawcraft.client.ui.components;

import com.rawcraft.client.ui.RawCraftTheme;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

import java.util.function.Consumer;

public class RawCraftToggle {
    public int x;
    public int y;
    public int width;
    public int height;
    public boolean state;
    public Consumer<Boolean> onToggle;

    public RawCraftToggle(int x, int y, int width, int height, boolean initialState, Consumer<Boolean> onToggle) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.state = initialState;
        this.onToggle = onToggle;
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (button == 0 && isMouseOver(mouseX, mouseY)) {
            this.state = !this.state;
            if (onToggle != null) {
                onToggle.accept(this.state);
            }
            return true;
        }
        return false;
    }

    public void render(GuiGraphicsExtractor extractor, Font font, int mouseX, int mouseY) {
        boolean hovered = isMouseOver(mouseX, mouseY);
        int trackBg = state ? RawCraftTheme.ACCENT : 0xFF241A44;
        int trackBorder = hovered ? RawCraftTheme.ACCENT_HOVER : RawCraftTheme.BORDER_SUBTLE;

        // Draw track
        extractor.fill(x, y, x + width, y + height, trackBg);
        extractor.outline(x, y, width, height, trackBorder);

        // Draw slider thumb / knob
        int knobPadding = 2;
        int knobSize = height - (knobPadding * 2);
        int knobX = state ? (x + width - knobSize - knobPadding) : (x + knobPadding);
        int knobY = y + knobPadding;
        int knobColor = state ? 0xFFFFFFFF : 0xFFA79EC7;

        extractor.fill(knobX, knobY, knobX + knobSize, knobY + knobSize, knobColor);
    }
}

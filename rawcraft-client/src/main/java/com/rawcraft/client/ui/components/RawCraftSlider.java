package com.rawcraft.client.ui.components;

import com.rawcraft.client.ui.RawCraftTheme;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;

import java.util.function.Consumer;
import java.util.function.Function;

public class RawCraftSlider {
    public int x;
    public int y;
    public int width;
    public int height;
    public double value;
    public double min;
    public double max;
    public double step;
    public Consumer<Double> onValueChange;
    public Function<Double, String> labelFormatter;
    public boolean dragging = false;

    public RawCraftSlider(int x, int y, int width, int height, double value, double min, double max, double step,
                          Function<Double, String> labelFormatter, Consumer<Double> onValueChange) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.min = min;
        this.max = max;
        this.step = step;
        this.value = Math.max(min, Math.min(max, value));
        this.labelFormatter = labelFormatter;
        this.onValueChange = onValueChange;
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (button == 0 && isMouseOver(mouseX, mouseY)) {
            this.dragging = true;
            updateFromMouse(mouseX);
            return true;
        }
        return false;
    }

    public void mouseReleased(int button) {
        if (button == 0) {
            this.dragging = false;
        }
    }

    public void mouseDragged(int mouseX) {
        if (dragging) {
            updateFromMouse(mouseX);
        }
    }

    private void updateFromMouse(int mouseX) {
        double pct = (double) (mouseX - x) / (double) width;
        pct = Math.max(0.0, Math.min(1.0, pct));
        double rawVal = min + pct * (max - min);
        if (step > 0) {
            rawVal = Math.round(rawVal / step) * step;
        }
        this.value = Math.max(min, Math.min(max, rawVal));
        if (onValueChange != null) {
            onValueChange.accept(this.value);
        }
    }

    public void render(GuiGraphicsExtractor extractor, Font font, int mouseX, int mouseY) {
        boolean hovered = isMouseOver(mouseX, mouseY);
        int trackBg = 0xFF1B1334;
        int trackBorder = hovered || dragging ? RawCraftTheme.ACCENT : RawCraftTheme.BORDER_SUBTLE;

        // Draw track background
        extractor.fill(x, y, x + width, y + height, trackBg);

        // Draw filled progress
        double pct = (max > min) ? ((value - min) / (max - min)) : 0;
        int filledW = (int) Math.round(width * Math.max(0.0, Math.min(1.0, pct)));
        if (filledW > 0) {
            extractor.fill(x, y, x + filledW, y + height, 0xFF4C2889);
        }

        // Draw border
        extractor.outline(x, y, width, height, trackBorder);

        // Draw knob / thumb line
        int knobX = Math.max(x, Math.min(x + width - 4, x + filledW - 2));
        extractor.fill(knobX, y + 1, knobX + 4, y + height - 1, RawCraftTheme.ACCENT);

        // Draw text label centered
        String label = (labelFormatter != null) ? labelFormatter.apply(value) : String.format("%.1f", value);
        int textW = font.width(label);
        int textX = x + (width - textW) / 2;
        int textY = y + (height - font.lineHeight) / 2 + 1;
        extractor.text(font, label, textX, textY, RawCraftTheme.TEXT_PRIMARY, true);
    }
}

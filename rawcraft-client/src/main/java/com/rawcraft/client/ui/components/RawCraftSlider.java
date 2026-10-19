package com.rawcraft.client.ui.components;

import java.util.function.Consumer;

public class RawCraftSlider {
    public int x;
    public int y;
    public int width;
    public int height;
    public double value;
    public double min;
    public double max;
    public Consumer<Double> onValueChange;
    public boolean dragging = false;

    public RawCraftSlider(int x, int y, int width, int height, double value, double min, double max, Consumer<Double> onValueChange) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.min = min;
        this.max = max;
        this.value = Math.max(min, Math.min(max, value));
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
        this.value = min + pct * (max - min);
        if (onValueChange != null) {
            onValueChange.accept(this.value);
        }
    }
}

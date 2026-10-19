package com.rawcraft.client.ui.components;

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
}

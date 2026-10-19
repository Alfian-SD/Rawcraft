package com.rawcraft.client.ui.components;

import com.rawcraft.client.ui.RawCraftTheme;

public class RawCraftButton {
    public int x;
    public int y;
    public int width;
    public int height;
    public String text;
    public Runnable action;
    public boolean enabled = true;
    public boolean active = false;
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
}

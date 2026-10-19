package com.rawcraft.client.ui.components;

import java.util.function.Consumer;

public class RawCraftSearchField {
    public int x;
    public int y;
    public int width;
    public int height;
    public String text = "";
    public String placeholder = "Search modules...";
    public boolean focused = false;
    public Consumer<String> onTextChange;

    public RawCraftSearchField(int x, int y, int width, int height, Consumer<String> onTextChange) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.onTextChange = onTextChange;
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (button == 0) {
            this.focused = isMouseOver(mouseX, mouseY);
            return this.focused;
        }
        return false;
    }

    public boolean charTyped(char chr) {
        if (focused && chr >= 32 && chr != 127) {
            this.text += chr;
            if (onTextChange != null) onTextChange.accept(this.text);
            return true;
        }
        return false;
    }

    public boolean keyPressed(int keyCode) {
        if (focused) {
            // 259 = GLFW.GLFW_KEY_BACKSPACE
            if (keyCode == 259 && !text.isEmpty()) {
                this.text = text.substring(0, text.length() - 1);
                if (onTextChange != null) onTextChange.accept(this.text);
                return true;
            }
        }
        return false;
    }
}

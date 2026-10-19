package com.rawcraft.client.ui.components;

import java.util.List;
import java.util.function.Consumer;

public class RawCraftDropdown {
    public int x;
    public int y;
    public int width;
    public int height;
    public List<String> choices;
    public String selected;
    public Consumer<String> onSelect;
    public boolean open = false;

    public RawCraftDropdown(int x, int y, int width, int height, List<String> choices, String selected, Consumer<String> onSelect) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.choices = choices;
        this.selected = selected;
        this.onSelect = onSelect;
    }

    public boolean isMouseOver(int mouseX, int mouseY) {
        return mouseX >= x && mouseX <= x + width && mouseY >= y && mouseY <= y + height;
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        if (button == 0) {
            if (isMouseOver(mouseX, mouseY)) {
                this.open = !this.open;
                return true;
            } else if (open) {
                // Check choices
                for (int i = 0; i < choices.size(); i++) {
                    int optY = y + height + (i * height);
                    if (mouseX >= x && mouseX <= x + width && mouseY >= optY && mouseY <= optY + height) {
                        this.selected = choices.get(i);
                        this.open = false;
                        if (onSelect != null) {
                            onSelect.accept(this.selected);
                        }
                        return true;
                    }
                }
                this.open = false;
            }
        }
        return false;
    }
}

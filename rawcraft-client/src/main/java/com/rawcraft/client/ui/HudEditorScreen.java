package com.rawcraft.client.ui;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.ui.components.RawCraftButton;

import java.util.ArrayList;
import java.util.List;

public class HudEditorScreen {
    private HudWidget selectedWidget;
    private boolean isDragging = false;
    private int dragStartOffsetX = 0;
    private int dragStartOffsetY = 0;

    private int screenWidth = 850;
    private int screenHeight = 480;

    private final List<RawCraftButton> inspectorButtons = new ArrayList<>();

    public HudEditorScreen() {
        this.selectedWidget = HudManager.getInstance().getWidget("fps");
        initInspector();
    }

    public void initInspector() {
        inspectorButtons.clear();

        // Cycle Anchor button
        inspectorButtons.add(new RawCraftButton(280, 16, 120, 24, "Anchor: " + (selectedWidget != null ? selectedWidget.getAnchor().name() : "NONE"), () -> {
            if (selectedWidget != null) {
                HudAnchor[] anchors = HudAnchor.values();
                int nextIdx = (selectedWidget.getAnchor().ordinal() + 1) % anchors.length;
                selectedWidget.setAnchor(anchors[nextIdx]);
                selectedWidget.updateScreenPosition(screenWidth, screenHeight);
                initInspector();
            }
        }));

        // Scale - button
        inspectorButtons.add(new RawCraftButton(410, 16, 32, 24, "[-]", () -> {
            if (selectedWidget != null) {
                selectedWidget.setScale(selectedWidget.getScale() - 0.1);
                selectedWidget.updateScreenPosition(screenWidth, screenHeight);
            }
        }));

        // Scale + button
        inspectorButtons.add(new RawCraftButton(448, 16, 32, 24, "[+]", () -> {
            if (selectedWidget != null) {
                selectedWidget.setScale(selectedWidget.getScale() + 0.1);
                selectedWidget.updateScreenPosition(screenWidth, screenHeight);
            }
        }));

        // Toggle Enabled
        inspectorButtons.add(new RawCraftButton(490, 16, 90, 24, selectedWidget != null && selectedWidget.isEnabled() ? "ENABLED" : "DISABLED", () -> {
            if (selectedWidget != null) {
                selectedWidget.setEnabled(!selectedWidget.isEnabled());
                initInspector();
            }
        }));

        // Done button
        inspectorButtons.add(new RawCraftButton(590, 16, 70, 24, "DONE", () -> {
            ConfigManager.getInstance().save();
        }));
    }

    public void setDimensions(int width, int height) {
        this.screenWidth = width;
        this.screenHeight = height;
        HudManager.getInstance().updateAllScreenPositions(width, height);
    }

    public HudWidget getSelectedWidget() {
        return selectedWidget;
    }

    public void selectWidget(HudWidget widget) {
        this.selectedWidget = widget;
        initInspector();
    }

    public boolean mouseClicked(int mouseX, int mouseY, int button) {
        // First check inspector buttons
        for (RawCraftButton btn : inspectorButtons) {
            if (btn.mouseClicked(mouseX, mouseY, button)) {
                return true;
            }
        }

        // Next check HUD widgets for selection and dragging
        if (button == 0) {
            for (HudWidget w : HudManager.getInstance().getWidgets()) {
                if (w.isEnabled() && w.isMouseOver(mouseX, mouseY)) {
                    selectWidget(w);
                    this.isDragging = true;
                    this.dragStartOffsetX = mouseX - w.getScreenX();
                    this.dragStartOffsetY = mouseY - w.getScreenY();
                    return true;
                }
            }
        }
        return false;
    }

    public void mouseReleased(int mouseX, int mouseY, int button) {
        if (button == 0 && isDragging) {
            this.isDragging = false;
            ConfigManager.getInstance().save();
        }
    }

    public void mouseDragged(int mouseX, int mouseY) {
        if (isDragging && selectedWidget != null) {
            int targetX = mouseX - dragStartOffsetX;
            int targetY = mouseY - dragStartOffsetY;
            selectedWidget.dragTo(targetX, targetY, screenWidth, screenHeight);
        }
    }

    public void render(Object drawContext, int mouseX, int mouseY, float delta) {
        // Native rendering via DrawContext
    }
}

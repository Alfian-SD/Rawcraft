package com.rawcraft.client.ui;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.ui.components.RawCraftButton;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.network.chat.Component;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class HudEditorScreen extends Screen {

    private final Screen parentScreen;
    private HudWidget selectedWidget;
    private boolean isDragging = false;
    private int dragStartOffsetX = 0;
    private int dragStartOffsetY = 0;

    // Snapping state
    private boolean snapToGrid = true;
    private boolean snappedCenterX = false;
    private boolean snappedCenterY = false;

    // Undo History (up to 20 steps)
    public static class WidgetStateSnapshot {
        public final String widgetName;
        public final HudAnchor anchor;
        public final int offsetX;
        public final int offsetY;
        public final double scale;

        public WidgetStateSnapshot(HudWidget w) {
            this.widgetName = w.getName();
            this.anchor = w.getAnchor();
            this.offsetX = w.getOffsetX();
            this.offsetY = w.getOffsetY();
            this.scale = w.getScale();
        }
    }
    private final Deque<WidgetStateSnapshot> undoStack = new ArrayDeque<>();

    // Context Menu
    private boolean contextMenuOpen = false;
    private int contextMenuX = 0;
    private int contextMenuY = 0;

    // Inspector buttons
    private final List<RawCraftButton> inspectorButtons = new ArrayList<>();

    public HudEditorScreen(Screen parentScreen) {
        super(Component.literal("RawCraft HUD Studio"));
        this.parentScreen = parentScreen;
        this.selectedWidget = HudManager.getInstance().getWidget("fps");
    }

    public void selectWidget(HudWidget w) {
        this.selectedWidget = w;
        initInspector();
    }

    @Override
    protected void init() {
        super.init();
        HudManager.getInstance().updateAllScreenPositions(this.width, this.height);
        initInspector();
    }

    private void initInspector() {
        inspectorButtons.clear();
        int barY = this.height - 34;
        int btnH = 22;

        // 1. Cycle Anchor button
        String anchorName = (selectedWidget != null) ? selectedWidget.getAnchor().name() : "NONE";
        inspectorButtons.add(new RawCraftButton(150, barY, 110, btnH, "Anchor: " + anchorName, () -> {
            if (selectedWidget != null) {
                pushUndoState();
                HudAnchor[] anchors = HudAnchor.values();
                int next = (selectedWidget.getAnchor().ordinal() + 1) % anchors.length;
                selectedWidget.setAnchor(anchors[next]);
                selectedWidget.updateScreenPosition(this.width, this.height);
                initInspector();
                ConfigManager.getInstance().save();
            }
        }));

        // 2. Scale controls [-] [1.0x] [+]
        inspectorButtons.add(new RawCraftButton(266, barY, 26, btnH, "-", () -> {
            if (selectedWidget != null) {
                pushUndoState();
                selectedWidget.setScale(selectedWidget.getScale() - 0.1);
                selectedWidget.updateScreenPosition(this.width, this.height);
                initInspector();
                ConfigManager.getInstance().save();
            }
        }));

        String scaleText = String.format("%.1fx", (selectedWidget != null ? selectedWidget.getScale() : 1.0));
        RawCraftButton scaleLabel = new RawCraftButton(296, barY, 44, btnH, scaleText, null);
        scaleLabel.enabled = false;
        inspectorButtons.add(scaleLabel);

        inspectorButtons.add(new RawCraftButton(344, barY, 26, btnH, "+", () -> {
            if (selectedWidget != null) {
                pushUndoState();
                selectedWidget.setScale(selectedWidget.getScale() + 0.1);
                selectedWidget.updateScreenPosition(this.width, this.height);
                initInspector();
                ConfigManager.getInstance().save();
            }
        }));

        // 3. Snap toggle button
        inspectorButtons.add(new RawCraftButton(376, barY, 78, btnH, "Snap: " + (snapToGrid ? "ON" : "OFF"), () -> {
            this.snapToGrid = !this.snapToGrid;
            initInspector();
        }));

        // 4. Background Mode cycle
        String bgMode = (selectedWidget != null) ? selectedWidget.getBackgroundMode() : "off";
        inspectorButtons.add(new RawCraftButton(460, barY, 78, btnH, "BG: " + bgMode.toUpperCase(), () -> {
            if (selectedWidget != null) {
                pushUndoState();
                String nextMode = "off".equalsIgnoreCase(bgMode) ? "solid" : ("solid".equalsIgnoreCase(bgMode) ? "translucent" : "off");
                selectedWidget.setBackgroundMode(nextMode);
                initInspector();
                ConfigManager.getInstance().save();
            }
        }));

        // 5. Reset Element Position
        inspectorButtons.add(new RawCraftButton(544, barY, 68, btnH, "Reset", () -> {
            if (selectedWidget != null) {
                pushUndoState();
                selectedWidget.setAnchor(HudAnchor.TOP_LEFT);
                selectedWidget.setOffsetX(16);
                selectedWidget.setOffsetY(16);
                selectedWidget.setScale(1.0);
                selectedWidget.updateScreenPosition(this.width, this.height);
                initInspector();
                ConfigManager.getInstance().save();
            }
        }));

        // 6. Done / Exit button
        RawCraftButton doneBtn = new RawCraftButton(this.width - 80, barY, 68, btnH, "Done ✓", () -> {
            onClose();
        });
        doneBtn.active = true;
        inspectorButtons.add(doneBtn);
    }

    private void pushUndoState() {
        if (selectedWidget != null) {
            if (undoStack.size() >= 20) {
                undoStack.removeFirst();
            }
            undoStack.addLast(new WidgetStateSnapshot(selectedWidget));
        }
    }

    private void performUndo() {
        if (!undoStack.isEmpty()) {
            WidgetStateSnapshot snap = undoStack.removeLast();
            HudWidget w = HudManager.getInstance().getWidget(snap.widgetName);
            if (w != null) {
                w.setAnchor(snap.anchor);
                w.setOffsetX(snap.offsetX);
                w.setOffsetY(snap.offsetY);
                w.setScale(snap.scale);
                w.updateScreenPosition(this.width, this.height);
                this.selectedWidget = w;
                initInspector();
                ConfigManager.getInstance().save();
            }
        }
    }

    @Override
    public void extractRenderState(GuiGraphicsExtractor extractor, int mouseX, int mouseY, float delta) {
        // 1. Subtle scrim overlay behind HUD Studio
        extractor.fill(0, 0, this.width, this.height, 0x44000000);

        Font font = this.font != null ? this.font : Minecraft.getInstance().font;

        // 2. Draw Snap Guideline axes if snapped
        if (snappedCenterX) {
            extractor.fill(this.width / 2, 0, this.width / 2 + 1, this.height, 0x998B5CF6);
        }
        if (snappedCenterY) {
            extractor.fill(0, this.height / 2, this.width, this.height / 2 + 1, 0x998B5CF6);
        }

        // 3. Render Widgets selection bounding boxes & labels
        for (HudWidget w : HudManager.getInstance().getWidgets()) {
            int sx = w.getScreenX();
            int sy = w.getScreenY();
            int sw = w.getScaledWidth();
            int sh = w.getScaledHeight();

            boolean isSel = (w == selectedWidget);
            boolean isHov = w.isMouseOver(mouseX, mouseY);

            if (isSel) {
                // Bright purple selection outline
                extractor.outline(sx - 1, sy - 1, sw + 2, sh + 2, RawCraftTheme.ACCENT);
                // 4 Corner Anchor Dots
                int dotSize = 3;
                extractor.fill(sx - 2, sy - 2, sx + dotSize - 2, sy + dotSize - 2, 0xFFFFFFFF);
                extractor.fill(sx + sw - 1, sy - 2, sx + sw + dotSize - 1, sy + dotSize - 2, 0xFFFFFFFF);
                extractor.fill(sx - 2, sy + sh - 1, sx + dotSize - 2, sy + sh + dotSize - 1, 0xFFFFFFFF);
                extractor.fill(sx + sw - 1, sy + sh - 1, sx + sw + dotSize - 1, sy + sh + dotSize - 1, 0xFFFFFFFF);

                // Small element label above bounding box
                String title = w.getName().toUpperCase();
                int labelW = font.width(title) + 6;
                extractor.fill(sx, sy - 12, sx + labelW, sy - 2, 0xCC120C22);
                extractor.text(font, title, sx + 3, sy - 11, RawCraftTheme.ACCENT_HOVER, false);
            } else if (isHov) {
                // Dim outline when hovered
                extractor.outline(sx - 1, sy - 1, sw + 2, sh + 2, 0x778B5CF6);
            }
        }

        // 4. Bottom Inspector Bar
        int barY = this.height - 38;
        int barH = 32;
        extractor.fill(10, barY, this.width - 10, barY + barH, 0xEB120C22);
        extractor.outline(10, barY, this.width - 20, barH, RawCraftTheme.BORDER_SUBTLE);

        // Selected title badge on left
        String selName = (selectedWidget != null) ? selectedWidget.getName().toUpperCase() : "NO SELECTION";
        extractor.text(font, "Element: §d" + selName, 20, barY + 11, RawCraftTheme.TEXT_PRIMARY, true);

        // Render Inspector buttons
        for (RawCraftButton btn : inspectorButtons) {
            btn.render(extractor, font, mouseX, mouseY);
        }

        // 5. Context Menu popup
        if (contextMenuOpen && selectedWidget != null) {
            int menuW = 120;
            int menuH = 68;
            extractor.fill(contextMenuX, contextMenuY, contextMenuX + menuW, contextMenuY + menuH, 0xF0120C22);
            extractor.outline(contextMenuX, contextMenuY, menuW, menuH, RawCraftTheme.ACCENT);

            String[] items = {"Toggle Visibility", "Toggle Shadow", "Cycle Background", "Reset Position"};
            int itemY = contextMenuY + 4;
            for (String item : items) {
                boolean itemHover = mouseX >= contextMenuX && mouseX <= contextMenuX + menuW && mouseY >= itemY && mouseY <= itemY + 14;
                if (itemHover) {
                    extractor.fill(contextMenuX + 1, itemY, contextMenuX + menuW - 1, itemY + 14, 0xFF2A1E50);
                }
                extractor.text(font, item, contextMenuX + 6, itemY + 3, itemHover ? 0xFFFFFFFF : RawCraftTheme.TEXT_PRIMARY, false);
                itemY += 15;
            }
        }
    }

    @Override
    public boolean mouseClicked(MouseButtonEvent event, boolean isDoubleClick) {
        int mx = (int) event.x();
        int my = (int) event.y();
        int button = event.button();

        // 1. Context Menu Click handling
        if (contextMenuOpen && selectedWidget != null) {
            int menuW = 120;
            int menuH = 68;
            if (mx >= contextMenuX && mx <= contextMenuX + menuW && my >= contextMenuY && my <= contextMenuY + menuH) {
                int clickedIndex = (my - contextMenuY - 4) / 15;
                pushUndoState();
                if (clickedIndex == 0) {
                    selectedWidget.setEnabled(!selectedWidget.isEnabled());
                } else if (clickedIndex == 1) {
                    selectedWidget.setShadow(!selectedWidget.isShadow());
                } else if (clickedIndex == 2) {
                    String cur = selectedWidget.getBackgroundMode();
                    selectedWidget.setBackgroundMode("off".equalsIgnoreCase(cur) ? "solid" : ("solid".equalsIgnoreCase(cur) ? "translucent" : "off"));
                } else if (clickedIndex == 3) {
                    selectedWidget.setAnchor(HudAnchor.TOP_LEFT);
                    selectedWidget.setOffsetX(16);
                    selectedWidget.setOffsetY(16);
                    selectedWidget.setScale(1.0);
                }
                selectedWidget.updateScreenPosition(this.width, this.height);
                ConfigManager.getInstance().save();
                initInspector();
                contextMenuOpen = false;
                return true;
            } else {
                contextMenuOpen = false;
            }
        }

        // 2. Check Inspector Bar buttons
        for (RawCraftButton btn : inspectorButtons) {
            if (btn.mouseClicked(mx, my, button)) {
                return true;
            }
        }

        // 3. Right Click on Widget opens Context Menu
        if (button == 1) { // RMB
            for (HudWidget w : HudManager.getInstance().getWidgets()) {
                if (w.isMouseOver(mx, my)) {
                    selectWidget(w);
                    this.contextMenuOpen = true;
                    this.contextMenuX = Math.min(this.width - 130, mx);
                    this.contextMenuY = Math.min(this.height - 80, my);
                    return true;
                }
            }
        }

        // 4. Left Click on Widget selects & starts drag
        if (button == 0) { // LMB
            for (HudWidget w : HudManager.getInstance().getWidgets()) {
                if (w.isMouseOver(mx, my)) {
                    pushUndoState();
                    selectWidget(w);
                    this.isDragging = true;
                    this.dragStartOffsetX = mx - w.getScreenX();
                    this.dragStartOffsetY = my - w.getScreenY();
                    return true;
                }
            }
        }

        return super.mouseClicked(event, isDoubleClick);
    }

    @Override
    public boolean mouseReleased(MouseButtonEvent event) {
        if (event.button() == 0 && isDragging) {
            this.isDragging = false;
            this.snappedCenterX = false;
            this.snappedCenterY = false;
            ConfigManager.getInstance().save();
            initInspector();
            return true;
        }
        return super.mouseReleased(event);
    }

    @Override
    public boolean mouseDragged(MouseButtonEvent event, double deltaX, double deltaY) {
        if (isDragging && selectedWidget != null) {
            int mx = (int) event.x();
            int my = (int) event.y();

            int targetX = mx - dragStartOffsetX;
            int targetY = my - dragStartOffsetY;

            this.snappedCenterX = false;
            this.snappedCenterY = false;

            if (snapToGrid) {
                // 1. Snap to 4px grid
                targetX = (int) (Math.round((double) targetX / 4.0) * 4);
                targetY = (int) (Math.round((double) targetY / 4.0) * 4);

                // 2. Snap to center axes (within 6px threshold)
                int midScreenX = this.width / 2;
                int widgetMidX = targetX + selectedWidget.getScaledWidth() / 2;
                if (Math.abs(widgetMidX - midScreenX) <= 6) {
                    targetX = midScreenX - selectedWidget.getScaledWidth() / 2;
                    this.snappedCenterX = true;
                }

                int midScreenY = this.height / 2;
                int widgetMidY = targetY + selectedWidget.getScaledHeight() / 2;
                if (Math.abs(widgetMidY - midScreenY) <= 6) {
                    targetY = midScreenY - selectedWidget.getScaledHeight() / 2;
                    this.snappedCenterY = true;
                }
            }

            selectedWidget.dragTo(targetX, targetY, this.width, this.height);
            return true;
        }
        return super.mouseDragged(event, deltaX, deltaY);
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontalAmount, double verticalAmount) {
        if (verticalAmount != 0 && selectedWidget != null && selectedWidget.isMouseOver((int) mouseX, (int) mouseY)) {
            pushUndoState();
            double newScale = Math.round((selectedWidget.getScale() + (verticalAmount > 0 ? 0.1 : -0.1)) * 10.0) / 10.0;
            selectedWidget.setScale(newScale);
            selectedWidget.updateScreenPosition(this.width, this.height);
            initInspector();
            ConfigManager.getInstance().save();
            return true;
        }
        return super.mouseScrolled(mouseX, mouseY, horizontalAmount, verticalAmount);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        int key = event.key();

        // 256 = GLFW.GLFW_KEY_ESCAPE
        if (key == 256) {
            onClose();
            return true;
        }

        // Ctrl + Z (Undo)
        if (key == 90 && (event.modifiers() & 2) != 0) {
            performUndo();
            return true;
        }

        // Keyboard arrow nudge (1px or 5px with Shift)
        if (selectedWidget != null) {
            int step = (event.modifiers() & 1) != 0 ? 5 : 1;
            boolean nudged = false;
            int curX = selectedWidget.getScreenX();
            int curY = selectedWidget.getScreenY();

            if (key == 263) { // LEFT
                curX -= step;
                nudged = true;
            } else if (key == 262) { // RIGHT
                curX += step;
                nudged = true;
            } else if (key == 265) { // UP
                curY -= step;
                nudged = true;
            } else if (key == 264) { // DOWN
                curY += step;
                nudged = true;
            }

            if (nudged) {
                pushUndoState();
                selectedWidget.dragTo(curX, curY, this.width, this.height);
                ConfigManager.getInstance().save();
                return true;
            }
        }

        return super.keyPressed(event);
    }

    @Override
    public void onClose() {
        ConfigManager.getInstance().saveNow();
        if (this.parentScreen != null) {
            RawCraftMenuScreen.openScreen(this.parentScreen);
        } else {
            RawCraftMenuScreen.openScreen(null);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return false;
    }
}

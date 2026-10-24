package com.rawcraft.client.ui;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.HudAnchor;
import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.ui.icon.IconSet;
import com.rawcraft.client.ui.theme.Draw;
import com.rawcraft.client.ui.theme.Theme;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.client.resources.sounds.SimpleSoundInstance;
import net.minecraft.network.chat.Component;
import net.minecraft.sounds.SoundEvents;

import java.util.ArrayList;
import java.util.List;

/**
 * Drag-and-drop HUD editor.
 *
 * <p>Every enabled {@link HudMod} is drawn at its live position with a dashed selection frame.
 * Dragging snaps to the nearest {@link HudAnchor} and writes {@code offsetX}/{@code offsetY} back to
 * the mod, so the layout survives a restart. Positions are saved on close.
 */
public class HudEditorScreen extends Screen {
    private final Screen parent;
    private final ModManager mods = ModManager.get();

    private HudMod dragging;
    private int dragGrabX;
    private int dragGrabY;
    private boolean moved;

    private HudMod selected;

    public HudEditorScreen(Screen parent) {
        super(Component.literal("HUD Editor"));
        this.parent = parent;
    }

    @Override
    protected void init() {
        mods.bootstrap();
        selected = null;
    }

    @Override
    public void onClose() {
        mods.save();
        if (this.minecraft != null) {
            this.minecraft.setScreenAndShow(parent);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return true;
    }

    private List<HudMod> editableMods() {
        List<HudMod> out = new ArrayList<>();
        for (ClientMod mod : mods.mods()) {
            if (mod instanceof HudMod hud) {
                out.add(hud);
            }
        }
        return out;
    }

    @Override
    public void extractBackground(GuiGraphicsExtractor graphics, int mouseX, int mouseY, float partialTick) {
        super.extractBackground(graphics, mouseX, mouseY, partialTick);
        // Lighter scrim than the menu: the point is to see the HUD against the world.
        Draw.rect(graphics, 0, 0, this.width, this.height, 0x66000000);
    }

    @Override
    public void extractRenderState(GuiGraphicsExtractor graphics, int mouseX, int mouseY, float partialTick) {
        int guiW = this.width;
        int guiH = this.height;

        for (HudMod hud : editableMods()) {
            if (!hud.enabled()) {
                continue;
            }
            int x = hud.resolveX(guiW);
            int y = hud.resolveY(guiH);
            int w = hud.scaledWidth();
            int h = hud.scaledHeight();

            boolean hovered = Draw.inside(mouseX, mouseY, x - 3, y - 3, w + 6, h + 6);
            if (hovered || hud == selected) {
                Draw.roundedOutline(graphics, x - 3, y - 3, w + 6, h + 6, 4,
                        hud == selected ? Theme.ACCENT : Theme.BORDER_STRONG);
            }
            Draw.rounded(graphics, x - 1, y - 1, w + 2, h + 2, 3, 0x22000000);

            graphics.pose().pushMatrix();
            graphics.pose().translate((float) x, (float) y);
            float scale = hud.scale.asFloat();
            graphics.pose().scale(scale, scale);
            hud.render(graphics, 0, 0);
            graphics.pose().popMatrix();
        }

        renderToolbar(graphics, mouseX, mouseY);
        renderSelectedPanel(graphics, guiW, guiH, mouseX, mouseY);
    }

    private void renderToolbar(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int w = 300;
        int h = 26;
        int x = (this.width - w) / 2;
        int y = this.height - h - 10;

        Draw.softShadow(g, x, y, w, h, 8, 40);
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CARD, Theme.PANEL);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CARD, Theme.BORDER);
        Draw.textCentered(g, this.font, "Drag to move  \u2022  Scroll to resize  \u2022  Esc to save",
                x + w / 2, y + 9, Theme.TEXT_DIM);

        int doneW = 54;
        int doneX = x + w + 8;
        boolean hovered = Draw.inside(mouseX, mouseY, doneX, y, doneW, h);
        Draw.rounded(g, doneX, y, doneW, h, Theme.RADIUS_CARD,
                hovered ? Theme.ACCENT_HOVER : Theme.ACCENT);
        Draw.textCentered(g, this.font, "Done", doneX + doneW / 2, y + 9, Theme.TEXT);
    }

    private void renderSelectedPanel(GuiGraphicsExtractor g, int guiW, int guiH, int mouseX, int mouseY) {
        if (selected == null) {
            return;
        }
        int w = 168;
        int h = 66;
        int x = 10;
        int y = 10;

        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CARD, Theme.PANEL);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CARD, Theme.BORDER);
        Draw.text(g, this.font, Draw.ellipsize(this.font, selected.displayName(), w - 20), x + 10, y + 8,
                Theme.TEXT);
        Draw.text(g, this.font, "Anchor: " + selected.anchor().label(), x + 10, y + 22, Theme.TEXT_DIM);
        Draw.text(g, this.font, String.format("Scale: %.2fx", selected.scale.get()), x + 10, y + 34,
                Theme.TEXT_DIM);

        int anchorBtn = 20;
        int anchorX = x + w - 10 - anchorBtn;
        boolean anchorHovered = Draw.inside(mouseX, mouseY, anchorX, y + 20, anchorBtn, anchorBtn);
        Draw.rounded(g, anchorX, y + 20, anchorBtn, anchorBtn, Theme.RADIUS_CONTROL,
                anchorHovered ? Theme.CARD_HOVER : Theme.CARD);
        Draw.roundedOutline(g, anchorX, y + 20, anchorBtn, anchorBtn, Theme.RADIUS_CONTROL,
                Theme.BORDER);
        IconSet.draw(g, "target", anchorX + 5, y + 25, 10, Theme.TEXT_DIM);

        int resetX = x + w - 10 - anchorBtn;
        boolean resetHovered = Draw.inside(mouseX, mouseY, resetX, y + 44, anchorBtn, anchorBtn);
        Draw.rounded(g, resetX, y + 44, anchorBtn, anchorBtn, Theme.RADIUS_CONTROL,
                resetHovered ? Theme.CARD_HOVER : Theme.CARD);
        Draw.roundedOutline(g, resetX, y + 44, anchorBtn, anchorBtn, Theme.RADIUS_CONTROL,
                Theme.BORDER);
        IconSet.draw(g, "sync", resetX + 5, y + 49, 10, Theme.TEXT_DIM);
    }

    // ── input ────────────────────────────────────────────────────────────────

    @Override
    public boolean mouseClicked(MouseButtonEvent event, boolean doubled) {
        if (event.button() != 0) {
            return super.mouseClicked(event, doubled);
        }
        double mouseX = event.x();
        double mouseY = event.y();

        int doneW = 54;
        int doneH = 26;
        int doneX = (this.width - 300) / 2 + 300 + 8;
        int doneY = this.height - doneH - 10;
        if (Draw.inside(mouseX, mouseY, doneX, doneY, doneW, doneH)) {
            click();
            onClose();
            return true;
        }

        if (selected != null) {
            int panelX = 10;
            int panelY = 10;
            int panelW = 168;
            int anchorBtn = 20;
            int anchorX = panelX + panelW - 10 - anchorBtn;
            if (Draw.inside(mouseX, mouseY, anchorX, panelY + 20, anchorBtn, anchorBtn)) {
                selected.setAnchor(selected.anchor().next());
                click();
                mods.markDirty();
                return true;
            }
            if (Draw.inside(mouseX, mouseY, anchorX, panelY + 44, anchorBtn, anchorBtn)) {
                selected.offsetX.reset();
                selected.offsetY.reset();
                selected.scale.reset();
                click();
                mods.markDirty();
                return true;
            }
        }

        // Topmost mod wins, so overlapping elements stay reachable.
        List<HudMod> candidates = editableMods();
        for (int i = candidates.size() - 1; i >= 0; i--) {
            HudMod hud = candidates.get(i);
            if (!hud.enabled()) {
                continue;
            }
            int x = hud.resolveX(this.width);
            int y = hud.resolveY(this.height);
            if (Draw.inside(mouseX, mouseY, x, y, hud.scaledWidth(), hud.scaledHeight())) {
                selected = hud;
                dragging = hud;
                dragGrabX = (int) mouseX - x;
                dragGrabY = (int) mouseY - y;
                moved = false;
                click();
                return true;
            }
        }
        selected = null;
        return super.mouseClicked(event, doubled);
    }

    @Override
    public boolean mouseDragged(MouseButtonEvent event, double dragX, double dragY) {
        if (dragging == null) {
            return super.mouseDragged(event, dragX, dragY);
        }
        int targetX = (int) event.x() - dragGrabX;
        int targetY = (int) event.y() - dragGrabY;

        // Snap to the nearest anchor, then store the residual as an inward offset.
        HudAnchor best = dragging.anchor();
        int bestDistance = Integer.MAX_VALUE;
        for (HudAnchor anchor : HudAnchor.values()) {
            int ax = anchor.resolveX(this.width, dragging.scaledWidth(), 0);
            int ay = anchor.resolveY(this.height, dragging.scaledHeight(), 0);
            int distance = Math.abs(ax - targetX) + Math.abs(ay - targetY);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = anchor;
            }
        }
        dragging.setAnchor(best);
        dragging.offsetX.set((double) Math.abs(targetX - best.resolveX(this.width, dragging.scaledWidth(), 0)));
        dragging.offsetY.set((double) Math.abs(targetY - best.resolveY(this.height, dragging.scaledHeight(), 0)));
        moved = true;
        mods.markDirty();
        return true;
    }

    @Override
    public boolean mouseReleased(MouseButtonEvent event) {
        dragging = null;
        return super.mouseReleased(event);
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontal, double vertical) {
        // Resize whatever is under the cursor, falling back to the selection.
        HudMod target = null;
        List<HudMod> candidates = editableMods();
        for (int i = candidates.size() - 1; i >= 0; i--) {
            HudMod hud = candidates.get(i);
            if (!hud.enabled()) {
                continue;
            }
            int x = hud.resolveX(this.width);
            int y = hud.resolveY(this.height);
            if (Draw.inside(mouseX, mouseY, x, y, hud.scaledWidth(), hud.scaledHeight())) {
                target = hud;
                break;
            }
        }
        if (target == null) {
            target = selected;
        }
        if (target != null) {
            target.scale.setFraction(target.scale.fraction() + vertical * 0.05);
            mods.markDirty();
            return true;
        }
        return super.mouseScrolled(mouseX, mouseY, horizontal, vertical);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        if (event.key() == 256) { // ESC
            onClose();
            return true;
        }
        if (mods.menuKeybind.matches(event.key())) {
            onClose();
            return true;
        }
        return super.keyPressed(event);
    }

    private void click() {
        if (this.minecraft != null) {
            this.minecraft.getSoundManager().play(
                    SimpleSoundInstance.forUI(SoundEvents.UI_BUTTON_CLICK, 1.0F));
        }
    }
}

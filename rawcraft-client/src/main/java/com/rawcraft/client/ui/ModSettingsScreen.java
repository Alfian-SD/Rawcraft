package com.rawcraft.client.ui;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.setting.BooleanSetting;
import com.rawcraft.client.setting.ColorSetting;
import com.rawcraft.client.setting.EnumSetting;
import com.rawcraft.client.setting.KeybindSetting;
import com.rawcraft.client.setting.Setting;
import com.rawcraft.client.setting.SliderSetting;
import com.rawcraft.client.setting.StringSetting;
import com.rawcraft.client.ui.icon.IconSet;
import com.rawcraft.client.ui.theme.Draw;
import com.rawcraft.client.ui.theme.Theme;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.CharacterEvent;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.client.resources.sounds.SimpleSoundInstance;
import net.minecraft.network.chat.Component;
import net.minecraft.sounds.SoundEvents;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Settings for one mod, generated from {@link ClientMod#settings()}.
 *
 * <p>Nothing here is per-mod: adding a setting to a mod makes it appear automatically, which is why
 * there is exactly one settings screen instead of eighty.
 */
public class ModSettingsScreen extends Screen {
    private static final int ROW_HEIGHT = 30;
    private static final int ROW_GAP = 6;

    /** Preset swatches, cycled on click. A full HSV picker would be a screen of its own. */
    private static final int[] PALETTE = {
            0xFFFFFFFF, 0xFFE02B2B, 0xFF4CAF50, 0xFF3B82F6,
            0xFFF59E0B, 0xFFA855F7, 0xFF14B8A6, 0xFF8A8F98,
    };

    private final Screen parent;
    private final ClientMod mod;
    private final ModManager mods = ModManager.get();

    private double scroll;
    private double scrollTarget;

    private KeybindSetting listeningKeybind;
    private StringSetting editingString;
    private String editBuffer = "";

    private int panelX;
    private int panelY;
    private int panelW;
    private int panelH;
    private int listX;
    private int listY;
    private int listW;
    private int listH;
    private int contentHeight;

    private String tooltip;
    private int tooltipX;
    private int tooltipY;

    public ModSettingsScreen(Screen parent, ClientMod mod) {
        super(Component.literal(mod == null ? "Settings" : mod.displayName()));
        this.parent = parent;
        this.mod = mod;
    }

    @Override
    protected void init() {
        mods.bootstrap();
    }

    @Override
    public void onClose() {
        commitPendingEdits();
        mods.save();
        if (this.minecraft != null) {
            this.minecraft.setScreenAndShow(parent);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return true;
    }

    private void commitPendingEdits() {
        if (editingString != null) {
            editingString.set(editBuffer);
            editingString = null;
        }
        listeningKeybind = null;
    }

    // ── layout ───────────────────────────────────────────────────────────────

    private void layout() {
        panelW = Math.min(this.width - Theme.PANEL_MARGIN * 2, 520);
        panelH = Math.min(this.height - Theme.PANEL_MARGIN * 2, 460);
        panelX = (this.width - panelW) / 2;
        panelY = (this.height - panelH) / 2;

        listX = panelX + 14;
        listW = panelW - 28;
        listY = panelY + 86;
        listH = Math.max(60, panelY + panelH - Theme.FOOTER_HEIGHT - 8 - listY);

        int rows = 1 + (mod == null ? 0 : mod.settings().size());
        contentHeight = rows * (ROW_HEIGHT + ROW_GAP) - ROW_GAP;
        scrollTarget = clampScroll(scrollTarget);
        scroll = clampScroll(scroll);
    }

    private double clampScroll(double value) {
        double max = Math.max(0, contentHeight - listH);
        return Math.max(0, Math.min(max, value));
    }

    // ── render ───────────────────────────────────────────────────────────────

    @Override
    public void extractBackground(GuiGraphicsExtractor graphics, int mouseX, int mouseY, float partialTick) {
        super.extractBackground(graphics, mouseX, mouseY, partialTick);
        Draw.rect(graphics, 0, 0, this.width, this.height, Theme.SCRIM);
    }

    @Override
    public void extractRenderState(GuiGraphicsExtractor graphics, int mouseX, int mouseY, float partialTick) {
        layout();
        tooltip = null;

        Draw.softShadow(graphics, panelX, panelY, panelW, panelH, 10, 40);
        Draw.rounded(graphics, panelX, panelY, panelW, panelH, 10, Theme.PANEL);
        Draw.roundedOutline(graphics, panelX, panelY, panelW, panelH, 10, Theme.BORDER);

        renderHeader(graphics, mouseX, mouseY);

        Draw.scissor(graphics, listX, listY, listX + listW, listY + listH);
        int y = listY - (int) Math.round(scroll);
        renderEnabledRow(graphics, y, mouseX, mouseY);
        y += ROW_HEIGHT + ROW_GAP;
        if (mod != null) {
            for (Setting<?> setting : mod.settings()) {
                renderSettingRow(graphics, setting, y, mouseX, mouseY);
                y += ROW_HEIGHT + ROW_GAP;
            }
        }
        Draw.unscissor(graphics);

        renderFooter(graphics);

        if (tooltip != null) {
            graphics.setTooltipForNextFrame(Component.literal(tooltip), tooltipX, tooltipY);
        }
    }

    private void renderHeader(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int backSize = 22;
        int backX = panelX + 14;
        int backY = panelY + 14;
        boolean backHovered = Draw.inside(mouseX, mouseY, backX, backY, backSize, backSize);
        Draw.rounded(g, backX, backY, backSize, backSize, Theme.RADIUS_CONTROL,
                backHovered ? Theme.CARD_HOVER : Theme.CARD);
        Draw.roundedOutline(g, backX, backY, backSize, backSize, Theme.RADIUS_CONTROL, Theme.BORDER);
        // Left-pointing chevron.
        for (int i = 0; i < 5; i++) {
            g.fill(backX + 10 - i, backY + 7 + i, backX + 11 - i, backY + 8 + i, Theme.TEXT_DIM);
            g.fill(backX + 10 - i, backY + 14 - i, backX + 11 - i, backY + 15 - i, Theme.TEXT_DIM);
        }

        String title = mod == null ? "Settings" : mod.displayName();
        Draw.text(g, this.font, Draw.ellipsize(this.font, title, panelW - 90), backX + 30, backY + 1,
                Theme.TEXT);
        if (mod != null) {
            Draw.text(g, this.font, Draw.ellipsize(this.font, mod.description(), panelW - 90),
                    backX + 30, backY + 13, Theme.TEXT_DIM);
        }

        // Right-click hint for reset.
        if (mod != null) {
            int resetX = panelX + panelW - 14 - 26;
            boolean resetHovered = Draw.inside(mouseX, mouseY, resetX, backY, 26, backSize);
            Draw.rounded(g, resetX, backY, 26, backSize, Theme.RADIUS_CONTROL,
                    resetHovered ? Theme.CARD_HOVER : Theme.CARD);
            Draw.roundedOutline(g, resetX, backY, 26, backSize, Theme.RADIUS_CONTROL, Theme.BORDER);
            IconSet.draw(g, "sync", resetX + 7, backY + 6, 11,
                    resetHovered ? Theme.TEXT : Theme.TEXT_DIM);
            if (resetHovered) {
                setTooltip("Reset all settings", mouseX, mouseY);
            }
        }

        g.fill(panelX + 1, panelY + 46, panelX + panelW - 1, panelY + 47, Theme.BORDER);
    }

    private void renderEnabledRow(GuiGraphicsExtractor g, int y, int mouseX, int mouseY) {
        Draw.rounded(g, listX, y, listW, ROW_HEIGHT, Theme.RADIUS_CARD, Theme.CARD);
        Draw.roundedOutline(g, listX, y, listW, ROW_HEIGHT, Theme.RADIUS_CARD, Theme.BORDER);
        Draw.text(g, this.font, "Enabled", listX + 10, y + 11, Theme.TEXT);
        renderToggle(g, listX + listW - 74, y + 6, 64, 18,
                mod != null && mod.enabled(), mouseX, mouseY);
    }

    private void renderToggle(GuiGraphicsExtractor g, int x, int y, int w, int h,
                              boolean on, int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, w, h);
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CONTROL,
                on ? (hovered ? Theme.ENABLED_BG_HOVER : Theme.ENABLED_BG)
                        : (hovered ? Theme.DISABLED_BG_HOVER : Theme.DISABLED_BG));
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CONTROL,
                on ? Draw.withAlpha(Theme.ENABLED_TEXT, 0x55) : Theme.BORDER);
        Draw.textCentered(g, this.font, on ? "Enabled" : "Disabled", x + w / 2, y + 5,
                on ? Theme.ENABLED_TEXT : Theme.TEXT_DIM);
    }

    private void renderSettingRow(GuiGraphicsExtractor g, Setting<?> setting, int y,
                                  int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, listX, y, listW, ROW_HEIGHT);
        Draw.rounded(g, listX, y, listW, ROW_HEIGHT, Theme.RADIUS_CARD,
                hovered ? Theme.CARD_HOVER : Theme.CARD);
        Draw.roundedOutline(g, listX, y, listW, ROW_HEIGHT, Theme.RADIUS_CARD, Theme.BORDER);

        String label = Draw.ellipsize(this.font, setting.label(), listW / 2);
        Draw.text(g, this.font, label, listX + 10, y + 11, Theme.TEXT);

        int controlX = listX + listW / 2;
        int controlW = listW - (controlX - listX) - 10;

        if (setting instanceof BooleanSetting bool) {
            renderToggle(g, listX + listW - 74, y + 6, 64, 18, bool.get(), mouseX, mouseY);
        } else if (setting instanceof SliderSetting slider) {
            renderSlider(g, slider, controlX, y, controlW, mouseX, mouseY);
        } else if (setting instanceof ColorSetting color) {
            renderColor(g, color, listX + listW - 74, y + 6, 64, 18, mouseX, mouseY);
        } else if (setting instanceof EnumSetting<?> cycle) {
            renderCycle(g, cycle, controlX, y + 6, controlW, 18, mouseX, mouseY);
        } else if (setting instanceof KeybindSetting keybind) {
            renderKeybind(g, keybind, controlX, y + 6, controlW, 18, mouseX, mouseY);
        } else if (setting instanceof StringSetting text) {
            renderString(g, text, controlX, y + 6, controlW, 18, mouseX, mouseY);
        }
    }

    private void renderSlider(GuiGraphicsExtractor g, SliderSetting slider, int x, int y, int w,
                              int mouseX, int mouseY) {
        int trackY = y + ROW_HEIGHT / 2 - 2;
        int trackW = w - 54;
        Draw.rounded(g, x, trackY, trackW, 4, Theme.RADIUS_PILL, Theme.DISABLED_BG);
        int filled = (int) Math.round(trackW * slider.fraction());
        Draw.rounded(g, x, trackY, Math.max(2, filled), 4, Theme.RADIUS_PILL, Theme.ACCENT);
        int knobX = x + filled - 3;
        Draw.rounded(g, knobX, trackY - 3, 7, 10, Theme.RADIUS_CONTROL, Theme.TEXT);

        String value = formatNumber(slider.get()) + slider.suffix();
        Draw.textRight(g, this.font, value, x + w, y + ROW_HEIGHT / 2 - 4, Theme.TEXT_DIM);
    }

    private void renderColor(GuiGraphicsExtractor g, ColorSetting color, int x, int y, int w, int h,
                             int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, w, h);
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CONTROL,
                hovered ? Theme.DISABLED_BG_HOVER : Theme.DISABLED_BG);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CONTROL, Theme.BORDER);
        Draw.rounded(g, x + 4, y + 4, 10, 10, 3, color.argb());
        Draw.text(g, this.font, String.format("#%06X", color.rgb()), x + 19, y + 5, Theme.TEXT_DIM);
    }

    private void renderCycle(GuiGraphicsExtractor g, EnumSetting<?> cycle, int x, int y, int w, int h,
                             int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, w, h);
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CONTROL,
                hovered ? Theme.DISABLED_BG_HOVER : Theme.DISABLED_BG);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CONTROL, Theme.BORDER);
        String value = String.valueOf(cycle.get());
        Draw.textCentered(g, this.font, Draw.ellipsize(this.font, value, w - 16), x + w / 2, y + 5,
                Theme.TEXT);
    }

    private void renderKeybind(GuiGraphicsExtractor g, KeybindSetting keybind, int x, int y, int w, int h,
                               int mouseX, int mouseY) {
        boolean listening = listeningKeybind == keybind;
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, w, h);
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CONTROL,
                listening ? Draw.withAlpha(Theme.ACCENT, 0x2E)
                        : (hovered ? Theme.DISABLED_BG_HOVER : Theme.DISABLED_BG));
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CONTROL,
                listening ? Theme.ACCENT : Theme.BORDER);
        String value = listening ? "Press a key..." : keybind.displayName();
        Draw.textCentered(g, this.font, value, x + w / 2, y + 5,
                listening ? Theme.TEXT : Theme.TEXT_DIM);
    }

    private void renderString(GuiGraphicsExtractor g, StringSetting text, int x, int y, int w, int h,
                              int mouseX, int mouseY) {
        boolean editing = editingString == text;
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_CONTROL, Theme.DISABLED_BG);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_CONTROL,
                editing ? Theme.ACCENT : Theme.BORDER);
        String value = editing ? editBuffer : text.get();
        Draw.text(g, this.font, Draw.ellipsize(this.font, value, w - 12), x + 6, y + 5,
                editing ? Theme.TEXT : Theme.TEXT_DIM);
        if (editing) {
            int caret = x + 6 + this.font.width(value) + 1;
            g.fill(caret, y + 4, caret + 1, y + h - 4, Theme.TEXT);
        }
    }

    private void renderFooter(GuiGraphicsExtractor g) {
        int y = panelY + panelH - Theme.FOOTER_HEIGHT + 5;
        Draw.text(g, this.font, "Esc to go back", panelX + 14, y, Theme.TEXT_DIMMER);
        Draw.textRight(g, this.font, mod == null ? "" : mod.id(), panelX + panelW - 14, y,
                Theme.TEXT_DIMMER);
    }

    private static String formatNumber(double value) {
        if (Math.abs(value - Math.rint(value)) < 0.0001) {
            return String.valueOf((long) Math.rint(value));
        }
        return String.format(Locale.US, "%.2f", value);
    }

    private void setTooltip(String text, int mouseX, int mouseY) {
        tooltip = text;
        tooltipX = mouseX;
        tooltipY = mouseY;
    }

    private void click() {
        if (this.minecraft != null) {
            this.minecraft.getSoundManager().play(
                    SimpleSoundInstance.forUI(SoundEvents.UI_BUTTON_CLICK, 1.0F));
        }
    }

    // ── input ────────────────────────────────────────────────────────────────

    @Override
    public boolean mouseClicked(MouseButtonEvent event, boolean doubled) {
        layout();
        double mouseX = event.x();
        double mouseY = event.y();
        if (event.button() != 0) {
            return super.mouseClicked(event, doubled);
        }

        // Back / reset.
        int backX = panelX + 14;
        int backY = panelY + 14;
        if (Draw.inside(mouseX, mouseY, backX, backY, 22, 22)) {
            click();
            onClose();
            return true;
        }
        int resetX = panelX + panelW - 14 - 26;
        if (mod != null && Draw.inside(mouseX, mouseY, resetX, backY, 26, 22)) {
            click();
            mods.resetSettings(mod);
            return true;
        }

        if (!Draw.inside(mouseX, mouseY, listX, listY, listW, listH)) {
            commitPendingEdits();
            return super.mouseClicked(event, doubled);
        }

        // Rows, in the same order they were drawn.
        List<Setting<?>> rows = new ArrayList<>();
        if (mod != null) {
            rows.addAll(mod.settings());
        }
        int y = listY - (int) Math.round(scroll);

        // Enabled row.
        if (Draw.inside(mouseX, mouseY, listX, y, listW, ROW_HEIGHT)) {
            if (mouseX >= listX + listW - 80) {
                mods.setEnabled(mod, !mod.enabled());
                click();
            }
            return true;
        }
        y += ROW_HEIGHT + ROW_GAP;

        for (Setting<?> setting : rows) {
            if (!Draw.inside(mouseX, mouseY, listX, y, listW, ROW_HEIGHT)) {
                y += ROW_HEIGHT + ROW_GAP;
                continue;
            }
            handleSettingClick(setting, mouseX, y);
            return true;
        }

        commitPendingEdits();
        return true;
    }

    private void handleSettingClick(Setting<?> setting, double mouseX, int y) {
        commitPendingEdits();
        int controlX = listX + listW / 2;
        int controlW = listW - (controlX - listX) - 10;

        if (setting instanceof BooleanSetting bool) {
            bool.set(!bool.get());
            click();
            mods.markDirty();
        } else if (setting instanceof SliderSetting slider) {
            int trackW = controlW - 54;
            double fraction = (mouseX - controlX) / Math.max(1, trackW);
            slider.setFraction(fraction);
            click();
            mods.markDirty();
        } else if (setting instanceof ColorSetting color) {
            int current = color.argb();
            int next = PALETTE[0];
            for (int i = 0; i < PALETTE.length; i++) {
                if (PALETTE[i] == current) {
                    next = PALETTE[(i + 1) % PALETTE.length];
                    break;
                }
            }
            color.set(next);
            click();
            mods.markDirty();
        } else if (setting instanceof EnumSetting<?> cycle) {
            cycle.cycle(1);
            click();
            mods.markDirty();
        } else if (setting instanceof KeybindSetting keybind) {
            listeningKeybind = keybind;
            click();
        } else if (setting instanceof StringSetting text) {
            editingString = text;
            editBuffer = text.get();
        }
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontal, double vertical) {
        layout();
        if (Draw.inside(mouseX, mouseY, listX, listY, listW, listH)) {
            scrollTarget = clampScroll(scrollTarget - vertical * 20);
            scroll = scrollTarget;
            return true;
        }
        return super.mouseScrolled(mouseX, mouseY, horizontal, vertical);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        int key = event.key();

        if (listeningKeybind != null) {
            if (key != 256) { // Esc cancels instead of binding.
                listeningKeybind.set(key);
                mods.markDirty();
            }
            listeningKeybind = null;
            return true;
        }

        if (editingString != null) {
            if (key == 259) { // BACKSPACE
                if (!editBuffer.isEmpty()) {
                    editBuffer = editBuffer.substring(0, editBuffer.length() - 1);
                }
                return true;
            }
            if (key == 257 || key == 335 || key == 256) {
                editingString.set(editBuffer);
                editingString = null;
                mods.markDirty();
                return true;
            }
        }

        if (key == 256) {
            onClose();
            return true;
        }
        return super.keyPressed(event);
    }

    @Override
    public boolean charTyped(CharacterEvent event) {
        if (editingString != null) {
            String typed = event.codepointAsString();
            if (typed != null && editBuffer.length() + typed.length() <= editingString.maxLength()) {
                editBuffer += typed;
                return true;
            }
            return true;
        }
        return super.charTyped(event);
    }
}

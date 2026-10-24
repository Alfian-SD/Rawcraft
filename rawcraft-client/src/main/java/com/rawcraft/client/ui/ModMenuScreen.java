package com.rawcraft.client.ui;

import com.rawcraft.client.RawCraft;
import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.HudMod;
import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.ui.icon.IconSet;
import com.rawcraft.client.ui.theme.Draw;
import com.rawcraft.client.ui.theme.Theme;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.gui.screens.Screen;
import net.minecraft.client.input.CharacterEvent;
import net.minecraft.client.input.KeyEvent;
import net.minecraft.client.input.MouseButtonEvent;
import net.minecraft.client.resources.sounds.SimpleSoundInstance;
import net.minecraft.network.chat.Component;
import net.minecraft.resources.Identifier;
import net.minecraft.sounds.SoundEvents;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * The client's main menu shell: header, tab bar, toolbar, mod grid and footer.
 *
 * <p>Everything is drawn and hit-tested by hand rather than with vanilla widgets. That is deliberate:
 * vanilla widgets cannot render the card grid, scissored scrolling or the hover fades, and mixing the
 * two would mean fighting two coordinate systems for no gain.
 */
public class ModMenuScreen extends Screen {
    private static final DateTimeFormatter CLOCK =
            DateTimeFormatter.ofPattern("yyyy/MM/dd hh:mm a", Locale.US);

    public enum Tab {
        MOD_MENU("MOD MENU", "grid", "Mod Menu"),
        SETTINGS("Settings", "gear", "Client settings"),
        CHAT("Chat", "chat", "Chat"),
        HUD_EDITOR("HUD Editor", "monitor", "HUD editor"),
        COSMETICS("Cosmetics", "cape", "Cosmetics"),
        DISPLAY("Display", "window", "Display"),
        SOCIAL("Social", "social", "Social"),
        ACCOUNT("Account", "person", "Account");

        public final String label;
        public final String icon;
        public final String description;

        Tab(String label, String icon, String description) {
            this.label = label;
            this.icon = icon;
            this.description = description;
        }
    }

    private enum Filter {
        ALL("All"),
        NEW("New"),
        HUD("HUD"),
        HYPIXEL("Hypixel"),
        PVP("PvP");

        final String label;

        Filter(String label) {
            this.label = label;
        }

        boolean matches(ClientMod mod) {
            return switch (this) {
                case ALL -> true;
                case NEW -> mod.hasTag(ModTag.NEW);
                case HUD -> mod.hasTag(ModTag.HUD);
                case HYPIXEL -> mod.hasTag(ModTag.HYPIXEL);
                case PVP -> mod.hasTag(ModTag.PVP);
            };
        }
    }

    /** Header shortcut buttons, left to right. */
    private static final String[][] HEADER_ICONS = {
            {"grid", "Mod Menu"},
            {"chat", "Chat"},
            {"camera", "Screenshots"},
            {"gear", "Client Settings"},
            {"archive", "Archive"},
            {"flower", "Cosmetics"},
            {"list", "Changelog"},
            {"sync", "Cloud Sync"},
            {"social", "Community"},
            {"home", "Back to Game"},
    };

    private final Screen parent;
    private final ModManager mods = ModManager.get();

    private Tab activeTab = Tab.MOD_MENU;
    private Filter filter = Filter.ALL;
    private String search = "";
    private boolean searchFocused;
    private boolean favoritesOnly;
    private boolean listLayout;

    private double scroll;
    private double scrollTarget;
    private boolean draggingScrollbar;
    private int dragOffsetY;

    private long lastFrameMs = System.currentTimeMillis();

    // Hover fade timers, keyed by mod id / control key.
    private final Map<String, Long> hoverSince = new HashMap<>();
    private final Map<String, Float> hoverAmount = new HashMap<>();

    private String toast;
    private long toastUntil;

    // Layout, recomputed every frame.
    private int panelX;
    private int panelY;
    private int panelW;
    private int panelH;
    private int headerH;
    private int tabH;
    private int toolbarH;
    private int footerH;
    private int headerY;
    private int tabY;
    private int toolbarY;
    private int gridX;
    private int gridY;
    private int gridW;
    private int gridH;
    private int cardW;
    private int cardH;
    private int contentHeight;

    private String clockCache = "";
    private long clockCacheAt;

    private String tooltip;
    private int tooltipX;
    private int tooltipY;

    public ModMenuScreen(Screen parent) {
        super(Component.literal("Mod Menu"));
        this.parent = parent;
    }

    public static void open(Screen parent) {
        Minecraft mc = Minecraft.getInstance();
        if (mc != null) {
            mc.setScreenAndShow(new ModMenuScreen(parent));
        }
    }

    public static void openFromCurrent() {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null) {
            return;
        }
        Screen current = mc.gui == null ? null : mc.gui.screen();
        if (current instanceof ModMenuScreen) {
            current.onClose();
        } else {
            open(current);
        }
    }

    // ── lifecycle ────────────────────────────────────────────────────────────

    @Override
    protected void init() {
        mods.bootstrap();
        scrollTarget = clampScroll(scrollTarget);
        scroll = scrollTarget;
    }

    @Override
    public void onClose() {
        mods.save();
        Minecraft mc = this.minecraft;
        if (mc != null) {
            mc.setScreenAndShow(parent);
        }
    }

    @Override
    public boolean isPauseScreen() {
        return true;
    }

    @Override
    public void tick() {
        long now = System.currentTimeMillis();
        long delta = Math.min(64, now - lastFrameMs);
        lastFrameMs = now;

        // Ease the scroll position toward the wheel target.
        if (Math.abs(scrollTarget - scroll) > 0.35) {
            scroll += (scrollTarget - scroll) * Math.min(1.0, delta / 70.0);
        } else {
            scroll = scrollTarget;
        }

        // Advance hover fades.
        for (Map.Entry<String, Long> entry : hoverSince.entrySet()) {
            float t = Math.min(1f, (now - entry.getValue()) / (float) Theme.HOVER_FADE_MS);
            hoverAmount.put(entry.getKey(), t);
        }
        if (toast != null && now > toastUntil) {
            toast = null;
        }
    }

    // ── layout ───────────────────────────────────────────────────────────────

    private void layout() {
        panelW = Math.min(this.width - Theme.PANEL_MARGIN * 2, 1000);
        panelH = Math.min(this.height - Theme.PANEL_MARGIN * 2, 640);
        panelX = (this.width - panelW) / 2;
        panelY = (this.height - panelH) / 2;

        // Chrome shrinks before the grid does, so a short window still shows usable cards.
        boolean compact = panelH < 340;
        headerH = compact ? 34 : Theme.HEADER_HEIGHT;
        tabH = compact ? 28 : Theme.TAB_BAR_HEIGHT;
        toolbarH = compact ? 30 : Theme.TOOLBAR_HEIGHT;
        footerH = compact ? 16 : Theme.FOOTER_HEIGHT;

        headerY = panelY + headerH / 2;
        tabY = panelY + headerH;
        toolbarY = tabY + tabH;

        gridX = panelX + 14;
        gridW = panelW - 28;
        gridY = toolbarY + toolbarH;
        int footerTop = panelY + panelH - footerH;
        gridH = Math.max(40, footerTop - gridY);

        int columns = columnCount();
        cardW = (gridW - (columns - 1) * Theme.GUTTER) / columns;
        if (listLayout) {
            cardH = 30;
        } else {
            int ideal = Math.round(cardW * Theme.CARD_ASPECT);
            // Never taller than the viewport minus one peek gutter, so a full row always fits.
            int ceiling = Math.max(64, gridH - Theme.GUTTER);
            cardH = Math.max(64, Math.min(ideal, ceiling));
        }

        int visible = visibleMods().size();
        int rows = (visible + columns - 1) / columns;
        contentHeight = rows == 0 ? 0 : rows * (cardH + Theme.GUTTER) - Theme.GUTTER;
        scrollTarget = clampScroll(scrollTarget);
        scroll = clampScroll(scroll);
    }

    private double clampScroll(double value) {
        double max = Math.max(0, contentHeight - gridH);
        return Math.max(0, Math.min(max, value));
    }

    private List<ClientMod> visibleMods() {
        List<ClientMod> out = new ArrayList<>();
        String needle = search.trim().toLowerCase(Locale.ROOT);
        for (ClientMod mod : mods.mods()) {
            if (!filter.matches(mod)) {
                continue;
            }
            if (favoritesOnly && !mod.favorite()) {
                continue;
            }
            if (!needle.isEmpty() && !mod.displayName().toLowerCase(Locale.ROOT).contains(needle)) {
                continue;
            }
            out.add(mod);
        }
        return out;
    }

    private int columnCount() {
        if (listLayout) {
            return 1;
        }
        return Math.max(1, Math.min(Theme.CARD_COLUMNS,
                (gridW + Theme.GUTTER) / (Theme.CARD_MIN_WIDTH + Theme.GUTTER)));
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
        tickAnimations();

        tooltip = null;
        Draw.softShadow(graphics, panelX, panelY, panelW, panelH, 10, 40);
        Draw.rounded(graphics, panelX, panelY, panelW, panelH, 10, Theme.PANEL);
        Draw.roundedOutline(graphics, panelX, panelY, panelW, panelH, 10, Theme.BORDER);

        renderHeader(graphics, mouseX, mouseY);
        renderTabBar(graphics, mouseX, mouseY);
        renderToolbar(graphics, mouseX, mouseY);

        if (activeTab == Tab.MOD_MENU) {
            renderGrid(graphics, mouseX, mouseY);
        } else {
            renderPlaceholder(graphics);
        }

        renderFooter(graphics);
        renderToast(graphics);

        if (tooltip != null) {
            graphics.setTooltipForNextFrame(Component.literal(tooltip), tooltipX, tooltipY);
        }
    }

    private void tickAnimations() {
        // Screen.tick() already handles fades; this only exists because render can outpace tick.
        if (Math.abs(scrollTarget - scroll) <= 0.35) {
            scroll = scrollTarget;
        }
    }

    // ── header ───────────────────────────────────────────────────────────────

    /** Header icon buttons shrink on narrow windows so all ten still fit. */
    private int headerButtonSize() {
        return panelW < 620 ? 18 : 22;
    }

    private int headerGap() {
        return panelW < 620 ? 2 : 3;
    }

    private int headerStripX() {
        int buttonSize = headerButtonSize();
        int stripWidth = HEADER_ICONS.length * buttonSize + (HEADER_ICONS.length - 1) * headerGap();
        return panelX + panelW - 16 - stripWidth;
    }

    private void renderHeader(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int left = panelX + 16;
        int centerY = panelY + headerH / 2;

        IconSet.draw(g, "star", left, centerY - 7, 14, Theme.ACCENT);
        int textX = left + 22;
        Draw.text(g, this.font, "MOD MENU", textX, centerY - 4, Theme.TEXT);
        int clockX = textX + this.font.width("MOD MENU") + 14;

        // Right cluster is measured first; the pill and the clock only appear when they still fit,
        // so a narrow window degrades instead of overlapping.
        int right = panelX + panelW - 16;
        int buttonSize = headerButtonSize();
        int iconSize = buttonSize - 6;
        int gap = headerGap();
        int stripX = headerStripX();

        for (int i = 0; i < HEADER_ICONS.length; i++) {
            int bx = stripX + i * (buttonSize + gap);
            int by = centerY - buttonSize / 2;
            boolean hovered = Draw.inside(mouseX, mouseY, bx, by, buttonSize, buttonSize);
            Draw.rounded(g, bx, by, buttonSize, buttonSize, Theme.RADIUS_CONTROL,
                    hovered ? Theme.CARD_HOVER : Theme.PANEL);
            int iconColor = hovered ? Theme.TEXT : Theme.TEXT_DIM;
            IconSet.draw(g, HEADER_ICONS[i][0], bx + (buttonSize - iconSize) / 2,
                    by + (buttonSize - iconSize) / 2, iconSize, iconColor);
            if (hovered) {
                setTooltip(HEADER_ICONS[i][1], mouseX, mouseY);
            }
        }

        String player = playerName();
        int nameW = this.font.width(player);
        int pillW = 20 + 6 + nameW + 12;
        int pillX = stripX - 10 - pillW;
        if (pillX > clockX) {
            Draw.rounded(g, pillX, centerY - 11, pillW, 22, Theme.RADIUS_PILL, Theme.CARD);
            Draw.roundedOutline(g, pillX, centerY - 11, pillW, 22, Theme.RADIUS_PILL, Theme.BORDER);
            renderPlayerHead(g, pillX + 4, centerY - 8, 16, player);
            Draw.text(g, this.font, player, pillX + 26, centerY - 4, Theme.TEXT_DIM);
        } else {
            pillX = stripX - 10;
        }

        String clock = clockText();
        int clockW = this.font.width(clock) + 34;
        if (clockX + clockW < pillX - 8) {
            Draw.rounded(g, clockX, centerY - 10, clockW, 20, Theme.RADIUS_PILL, Theme.CARD);
            Draw.roundedOutline(g, clockX, centerY - 10, clockW, 20, Theme.RADIUS_PILL, Theme.BORDER);
            IconSet.draw(g, "clock", clockX + 8, centerY - 5, 10, Theme.TEXT_DIM);
            Draw.text(g, this.font, clock, clockX + 22, centerY - 4, Theme.TEXT_DIM);
        }
    }

    private String clockText() {
        long now = System.currentTimeMillis();
        if (now - clockCacheAt > 1000 || clockCache.isEmpty()) {
            clockCache = LocalDateTime.now().format(CLOCK);
            clockCacheAt = now;
        }
        return clockCache;
    }

    private String playerName() {
        if (this.minecraft == null || this.minecraft.getUser() == null) {
            return "Player";
        }
        String name = this.minecraft.getUser().getName();
        return name == null || name.isBlank() ? "Player" : name;
    }

    /**
     * Player skin face, falling back to an initial block when no world is loaded
     * (the title screen has no {@code LocalPlayer}, so there is no skin to sample).
     */
    private void renderPlayerHead(GuiGraphicsExtractor g, int x, int y, int size, String name) {
        Identifier skin = null;
        if (this.minecraft != null && this.minecraft.player != null) {
            try {
                skin = this.minecraft.player.getSkin().body().texturePath();
            } catch (Throwable ignored) {
                skin = null;
            }
        }
        if (skin != null) {
            g.pose().pushMatrix();
            g.pose().translate((float) x, (float) y);
            float factor = size / 8f;
            g.pose().scale(factor, factor);
            // Head front face of a 64x64 skin sheet.
            g.blit(skin, 0, 0, 8, 8, 8f, 8f, 64f, 64f);
            g.pose().popMatrix();
        } else {
            Draw.rounded(g, x, y, size, size, 4, Theme.CARD_HOVER);
            String initial = name.isEmpty() ? "?" : name.substring(0, 1).toUpperCase(Locale.ROOT);
            Draw.textCentered(g, this.font, initial, x + size / 2, y + size / 2 - 4, Theme.TEXT_DIM);
        }
    }

    // ── tab bar ──────────────────────────────────────────────────────────────

    private void renderTabBar(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int barTop = tabY;
        Draw.rect(g, panelX + 1, barTop, panelW - 2, tabH, Theme.PANEL_HEADER);
        g.fill(panelX + 1, barTop, panelX + panelW - 1, barTop + 1, Theme.BORDER);
        g.fill(panelX + 1, barTop + tabH - 1,
                panelX + panelW - 1, barTop + tabH, Theme.BORDER);

        int y = barTop + 5;
        int height = tabH - 10;
        int x = panelX + 14;

        // Active tab: red filled pill with icon + label.
        int labelW = this.font.width(Tab.MOD_MENU.label);
        int pillW = labelW + 34;
        boolean active = activeTab == Tab.MOD_MENU;
        Draw.rounded(g, x, y, pillW, height, Theme.RADIUS_PILL,
                active ? Theme.ACCENT : Theme.CARD);
        if (!active) {
            Draw.roundedOutline(g, x, y, pillW, height, Theme.RADIUS_PILL, Theme.BORDER);
        }
        IconSet.draw(g, "grid", x + 9, y + (height - 12) / 2, 12,
                active ? Theme.TEXT : Theme.TEXT_DIM);
        Draw.text(g, this.font, Tab.MOD_MENU.label, x + 25, y + (height - 8) / 2,
                active ? Theme.TEXT : Theme.TEXT_DIM);
        x += pillW + 4;

        for (Tab tab : Tab.values()) {
            if (tab == Tab.MOD_MENU) {
                continue;
            }
            boolean isActive = activeTab == tab;
            boolean hovered = Draw.inside(mouseX, mouseY, x, y, height, height);
            Draw.rounded(g, x, y, height, height, Theme.RADIUS_CONTROL,
                    isActive ? Theme.CARD_HOVER : (hovered ? Theme.CARD : Theme.PANEL_HEADER));
            IconSet.draw(g, tab.icon, x + (height - 14) / 2, y + (height - 14) / 2, 14,
                    isActive ? Theme.TEXT : (hovered ? Theme.TEXT : Theme.TEXT_DIM));
            if (hovered) {
                setTooltip(tab.description, mouseX, mouseY);
            }
            x += height + 4;
        }

        // Close button: red outlined square at the right end.
        int closeSize = height;
        int closeX = panelX + panelW - 14 - closeSize;
        boolean closeHovered = Draw.inside(mouseX, mouseY, closeX, y, closeSize, closeSize);
        Draw.rounded(g, closeX, y, closeSize, closeSize, Theme.RADIUS_CONTROL,
                closeHovered ? Draw.withAlpha(Theme.ACCENT, 0x33) : Theme.PANEL_HEADER);
        Draw.roundedOutline(g, closeX, y, closeSize, closeSize, Theme.RADIUS_CONTROL, Theme.ACCENT);
        int inset = 6;
        int crossColor = closeHovered ? Theme.ACCENT_HOVER : Theme.ACCENT;
        g.fill(closeX + inset, y + inset, closeX + inset + 1, y + closeSize - inset, crossColor);
        // Draw a crisp X with two diagonals made of 1px steps.
        for (int i = inset; i < closeSize - inset; i++) {
            g.fill(closeX + i, y + i, closeX + i + 1, y + i + 1, crossColor);
            g.fill(closeX + closeSize - i - 1, y + i, closeX + closeSize - i, y + i + 1, crossColor);
        }
        if (closeHovered) {
            setTooltip("Close (Esc)", mouseX, mouseY);
        }
    }

    // ── toolbar ──────────────────────────────────────────────────────────────

    private void renderToolbar(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int y = toolbarY + 6;
        int height = toolbarH - 12;
        int x = panelX + 14;

        for (Filter value : Filter.values()) {
            int w = this.font.width(value.label) + 20;
            boolean active = filter == value;
            boolean hovered = Draw.inside(mouseX, mouseY, x, y, w, height);
            Draw.rounded(g, x, y, w, height, Theme.RADIUS_PILL,
                    active ? Theme.ACCENT : (hovered ? Theme.CARD : Theme.PANEL_HEADER));
            if (!active) {
                Draw.roundedOutline(g, x, y, w, height, Theme.RADIUS_PILL,
                        hovered ? Theme.BORDER_STRONG : Theme.BORDER);
            }
            Draw.text(g, this.font, value.label, x + 10, y + (height - 8) / 2,
                    active ? Theme.TEXT : (hovered ? Theme.TEXT : Theme.TEXT_DIM));
            x += w + 5;
        }

        // Right cluster: layout toggle, favourites, search.
        int right = panelX + panelW - 14;
        int iconBtn = height;
        int layoutX = right - iconBtn;
        int favX = layoutX - iconBtn - 5;
        int searchW = Math.min(190, panelW / 3);
        int searchX = favX - 5 - searchW;

        renderIconButton(g, layoutX, y, iconBtn, listLayout ? "list" : "grid", mouseX, mouseY,
                listLayout ? "Switch to grid view" : "Switch to list view");

        boolean favHovered = Draw.inside(mouseX, mouseY, favX, y, iconBtn, iconBtn);
        Draw.rounded(g, favX, y, iconBtn, iconBtn, Theme.RADIUS_CONTROL,
                favoritesOnly ? Draw.withAlpha(Theme.ACCENT, 0x2E)
                        : (favHovered ? Theme.CARD : Theme.PANEL_HEADER));
        Draw.roundedOutline(g, favX, y, iconBtn, iconBtn, Theme.RADIUS_CONTROL,
                favoritesOnly ? Theme.ACCENT : Theme.BORDER);
        IconSet.draw(g, "heart", favX + (iconBtn - 13) / 2, y + (iconBtn - 13) / 2, 13,
                favoritesOnly ? Theme.ACCENT : (favHovered ? Theme.TEXT : Theme.TEXT_DIM));
        if (favHovered) {
            setTooltip(favoritesOnly ? "Showing favourites only" : "Show favourites only", mouseX, mouseY);
        }

        Draw.rounded(g, searchX, y, searchW, iconBtn, Theme.RADIUS_CONTROL, Theme.CARD);
        Draw.roundedOutline(g, searchX, y, searchW, iconBtn, Theme.RADIUS_CONTROL,
                searchFocused ? Theme.ACCENT : Theme.BORDER);
        IconSet.draw(g, "zoom", searchX + 7, y + (iconBtn - 11) / 2, 11, Theme.TEXT_DIMMER);
        String shown = search.isEmpty() ? "Search" : search;
        int textColor = search.isEmpty() ? Theme.TEXT_DIMMER : Theme.TEXT;
        Draw.text(g, this.font, Draw.ellipsize(this.font, shown, searchW - 34), searchX + 23,
                y + (iconBtn - 8) / 2, textColor);
        if (searchFocused) {
            int caretX = searchX + 23 + this.font.width(shown) + 1;
            g.fill(caretX, y + 5, caretX + 1, y + iconBtn - 5, Theme.TEXT);
        }
    }

    private void renderIconButton(GuiGraphicsExtractor g, int x, int y, int size, String icon,
                                  int mouseX, int mouseY, String label) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, size, size);
        Draw.rounded(g, x, y, size, size, Theme.RADIUS_CONTROL,
                hovered ? Theme.CARD : Theme.PANEL_HEADER);
        Draw.roundedOutline(g, x, y, size, size, Theme.RADIUS_CONTROL, Theme.BORDER);
        IconSet.draw(g, icon, x + (size - 13) / 2, y + (size - 13) / 2, 13,
                hovered ? Theme.TEXT : Theme.TEXT_DIM);
        if (hovered) {
            setTooltip(label, mouseX, mouseY);
        }
    }

    // ── grid ─────────────────────────────────────────────────────────────────

    private void renderGrid(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        List<ClientMod> visible = visibleMods();

        Draw.scissor(g, gridX, gridY, gridX + gridW, gridY + gridH);
        int columns = columnCount();
        for (int index = 0; index < visible.size(); index++) {
            int column = index % columns;
            int row = index / columns;
            int x = gridX + column * (cardW + Theme.GUTTER);
            int y = gridY + row * (cardH + Theme.GUTTER) - (int) Math.round(scroll);

            // Skip cards fully outside the viewport; keeps big lists cheap.
            if (y + cardH < gridY || y > gridY + gridH) {
                continue;
            }
            ClientMod mod = visible.get(index);
            if (listLayout) {
                renderListRow(g, mod, x, y, mouseX, mouseY);
            } else {
                renderCard(g, mod, x, y, mouseX, mouseY);
            }
        }
        Draw.unscissor(g);

        if (visible.isEmpty()) {
            String empty = search.isEmpty() ? "No mods match this filter" : "No mods match \"" + search + "\"";
            Draw.textCentered(g, this.font, empty, gridX + gridW / 2, gridY + gridH / 2 - 4,
                    Theme.TEXT_DIM);
        }

        renderScrollbar(g, mouseX, mouseY);
    }

    private void renderScrollbar(GuiGraphicsExtractor g, int mouseX, int mouseY) {
        int max = (int) Math.max(0, contentHeight - gridH);
        if (max <= 0) {
            return;
        }
        int trackX = panelX + panelW - 8;
        int trackW = 3;
        Draw.rounded(g, trackX, gridY, trackW, gridH, Theme.RADIUS_PILL, Theme.CARD);

        int thumbH = Math.max(24, (int) ((float) gridH * gridH / contentHeight));
        int thumbY = gridY + (int) ((float) (gridH - thumbH) * (scroll / max));
        boolean hovered = Draw.inside(mouseX, mouseY, trackX - 3, thumbY, trackW + 6, thumbH);
        Draw.rounded(g, trackX, thumbY, trackW, thumbH, Theme.RADIUS_PILL,
                draggingScrollbar || hovered ? Theme.TEXT_DIM : Theme.TEXT_DIMMER);
    }

    private float hoverOf(String key, boolean hovered) {
        if (hovered) {
            hoverSince.putIfAbsent(key, System.currentTimeMillis());
            Float cached = hoverAmount.get(key);
            if (cached != null) {
                return cached;
            }
            return 0f;
        }
        hoverSince.remove(key);
        hoverAmount.put(key, 0f);
        return 0f;
    }

    private void renderCard(GuiGraphicsExtractor g, ClientMod mod, int x, int y,
                            int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, cardW, cardH);
        float fade = hoverOf(mod.id(), hovered);

        int background = mod.enabled() ? Theme.CARD : Theme.CARD_DISABLED;
        Draw.rounded(g, x, y, cardW, cardH, Theme.RADIUS_CARD,
                Draw.mix(background, Theme.CARD_HOVER, fade));
        Draw.roundedOutline(g, x, y, cardW, cardH, Theme.RADIUS_CARD,
                Draw.mix(Theme.BORDER, Theme.BORDER_STRONG, fade));

        int titleColor = mod.enabled() ? Theme.TEXT : Theme.TEXT_DIM;
        String title = Draw.ellipsize(this.font, mod.displayName(), cardW - 40);
        Draw.text(g, this.font, title, x + 10, y + 9, titleColor);

        // Favourite heart, top-right.
        int heartX = x + cardW - 20;
        int heartY = y + 8;
        boolean heartHovered = Draw.inside(mouseX, mouseY, heartX - 3, heartY - 3, 14, 14);
        IconSet.draw(g, "heart", heartX, heartY, 10,
                mod.favorite() ? Theme.ACCENT : (heartHovered ? Theme.TEXT : Theme.TEXT_DIMMER));

        // Centre icon or text preview.
        int iconSize = Math.min(34, cardH / 3);
        int centerX = x + cardW / 2;
        int centerY = y + cardH / 2 - 4;
        if (IconSet.isTextPreview(mod.iconKey())) {
            String preview = IconSet.previewText(mod.iconKey());
            int color = mod.enabled() ? Theme.TEXT : Theme.TEXT_DIM;
            Draw.textCentered(g, this.font, Draw.ellipsize(this.font, preview, cardW - 24),
                    centerX, centerY - 4, color);
        } else {
            IconSet.draw(g, mod.iconKey(), centerX - iconSize / 2, centerY - iconSize / 2,
                    iconSize, mod.enabled() ? Theme.TEXT : Theme.TEXT_DIMMER);
        }

        // Bottom row: gear + wide toggle.
        int rowY = y + cardH - 26;
        int gearSize = 18;
        int gearX = x + 10;
        boolean gearHovered = Draw.inside(mouseX, mouseY, gearX, rowY, gearSize, gearSize);
        Draw.rounded(g, gearX, rowY, gearSize, gearSize, Theme.RADIUS_CONTROL,
                gearHovered ? Theme.CARD_HOVER : Theme.DISABLED_BG);
        Draw.roundedOutline(g, gearX, rowY, gearSize, gearSize, Theme.RADIUS_CONTROL, Theme.BORDER);
        IconSet.draw(g, "gear", gearX + 4, rowY + 4, 10,
                mod.hasSettings() ? (gearHovered ? Theme.TEXT : Theme.TEXT_DIM) : Theme.TEXT_DIMMER);

        int toggleX = gearX + gearSize + 6;
        int toggleW = x + cardW - 10 - toggleX;
        int toggleH = gearSize;
        boolean toggleHovered = Draw.inside(mouseX, mouseY, toggleX, rowY, toggleW, toggleH);
        int toggleBg = mod.enabled()
                ? (toggleHovered ? Theme.ENABLED_BG_HOVER : Theme.ENABLED_BG)
                : (toggleHovered ? Theme.DISABLED_BG_HOVER : Theme.DISABLED_BG);
        Draw.rounded(g, toggleX, rowY, toggleW, toggleH, Theme.RADIUS_CONTROL, toggleBg);
        Draw.roundedOutline(g, toggleX, rowY, toggleW, toggleH, Theme.RADIUS_CONTROL,
                mod.enabled() ? Draw.withAlpha(Theme.ENABLED_TEXT, 0x55) : Theme.BORDER);
        String state = mod.enabled() ? "Enabled" : "Disabled";
        int stateColor = mod.enabled() ? Theme.ENABLED_TEXT : Theme.TEXT_DIM;
        Draw.textCentered(g, this.font, state, toggleX + toggleW / 2, rowY + 5, stateColor);
    }

    private void renderListRow(GuiGraphicsExtractor g, ClientMod mod, int x, int y,
                               int mouseX, int mouseY) {
        boolean hovered = Draw.inside(mouseX, mouseY, x, y, cardW, cardH);
        float fade = hoverOf("row:" + mod.id(), hovered);
        int background = mod.enabled() ? Theme.CARD : Theme.CARD_DISABLED;
        Draw.rounded(g, x, y, cardW, cardH, Theme.RADIUS_CONTROL,
                Draw.mix(background, Theme.CARD_HOVER, fade));
        Draw.roundedOutline(g, x, y, cardW, cardH, Theme.RADIUS_CONTROL, Theme.BORDER);

        IconSet.draw(g, mod.iconKey(), x + 8, y + (cardH - 14) / 2, 14,
                mod.enabled() ? Theme.TEXT : Theme.TEXT_DIMMER);
        String title = Draw.ellipsize(this.font, mod.displayName(), cardW - 250);
        Draw.text(g, this.font, title, x + 30, y + (cardH - 8) / 2,
                mod.enabled() ? Theme.TEXT : Theme.TEXT_DIM);

        IconSet.draw(g, "heart", x + cardW - 150, y + (cardH - 10) / 2, 10,
                mod.favorite() ? Theme.ACCENT : Theme.TEXT_DIMMER);
        IconSet.draw(g, "gear", x + cardW - 126, y + (cardH - 10) / 2, 10, Theme.TEXT_DIM);

        int toggleW = 96;
        int toggleX = x + cardW - toggleW - 8;
        int toggleY = y + (cardH - 18) / 2;
        Draw.rounded(g, toggleX, toggleY, toggleW, 18, Theme.RADIUS_CONTROL,
                mod.enabled() ? Theme.ENABLED_BG : Theme.DISABLED_BG);
        Draw.textCentered(g, this.font, mod.enabled() ? "Enabled" : "Disabled",
                toggleX + toggleW / 2, toggleY + 5,
                mod.enabled() ? Theme.ENABLED_TEXT : Theme.TEXT_DIM);
    }

    private void renderPlaceholder(GuiGraphicsExtractor g) {
        int centerX = gridX + gridW / 2;
        int centerY = gridY + gridH / 2;
        IconSet.draw(g, activeTab.icon, centerX - 18, centerY - 46, 36, Theme.TEXT_DIMMER);
        Draw.textCentered(g, this.font, activeTab.label, centerX, centerY + 2, Theme.TEXT);
        Draw.textCentered(g, this.font, "This tab is not built yet.", centerX, centerY + 18,
                Theme.TEXT_DIM);
        Draw.textCentered(g, this.font, "Mod Menu is the only finished tab.", centerX, centerY + 32,
                Theme.TEXT_DIMMER);
    }

    private void renderFooter(GuiGraphicsExtractor g) {
        int y = panelY + panelH - footerH + 5;
        String left = mods.enabledCount() + " of " + mods.mods().size() + " enabled";
        Draw.text(g, this.font, left, panelX + 14, y, Theme.TEXT_DIMMER);
        Draw.textCentered(g, this.font, RawCraft.footer(), panelX + panelW / 2, y, Theme.TEXT_DIM);
        Draw.textRight(g, this.font, "Right Shift", panelX + panelW - 14, y, Theme.TEXT_DIMMER);
    }

    private void renderToast(GuiGraphicsExtractor g) {
        if (toast == null) {
            return;
        }
        int w = this.font.width(toast) + 28;
        int h = 24;
        int x = panelX + (panelW - w) / 2;
        int y = panelY + panelH - footerH - h - 10;
        Draw.rounded(g, x, y, w, h, Theme.RADIUS_PILL, Theme.CARD_HOVER);
        Draw.roundedOutline(g, x, y, w, h, Theme.RADIUS_PILL, Theme.BORDER_STRONG);
        Draw.textCentered(g, this.font, toast, x + w / 2, y + 8, Theme.TEXT);
    }

    private void setTooltip(String text, int mouseX, int mouseY) {
        tooltip = text;
        tooltipX = mouseX;
        tooltipY = mouseY;
    }

    private void showToast(String text) {
        toast = text;
        toastUntil = System.currentTimeMillis() + 1600;
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
        double mouseX = event.x();
        double mouseY = event.y();
        int button = event.button();
        layout();

        // Close button.
        int closeSize = tabH - 10;
        int closeX = panelX + panelW - 14 - closeSize;
        if (button == 0 && Draw.inside(mouseX, mouseY, closeX, tabY + 5, closeSize, closeSize)) {
            click();
            onClose();
            return true;
        }

        // Header icons.
        int centerY = panelY + headerH / 2;
        int buttonSize = headerButtonSize();
        int gap = headerGap();
        int stripX = headerStripX();
        if (button == 0) {
            for (int i = 0; i < HEADER_ICONS.length; i++) {
                int bx = stripX + i * (buttonSize + gap);
                if (Draw.inside(mouseX, mouseY, bx, centerY - buttonSize / 2, buttonSize, buttonSize)) {
                    handleHeaderIcon(i);
                    return true;
                }
            }
        }

        // Tabs.
        int y = tabY + 5;
        int height = tabH - 10;
        int pillW = this.font.width(Tab.MOD_MENU.label) + 34;
        if (button == 0 && Draw.inside(mouseX, mouseY, panelX + 14, y, pillW, height)) {
            click();
            activeTab = Tab.MOD_MENU;
            return true;
        }
        int tabX = panelX + 14 + pillW + 4;
        for (Tab tab : Tab.values()) {
            if (tab == Tab.MOD_MENU) {
                continue;
            }
            if (Draw.inside(mouseX, mouseY, tabX, y, height, height)) {
                if (button == 0) {
                    selectTab(tab);
                }
                return true;
            }
            tabX += height + 4;
        }

        // Toolbar.
        if (Draw.inside(mouseX, mouseY, gridX, toolbarY, gridW, toolbarH)) {
            return handleToolbarClick(mouseX, mouseY, button);
        }

        // Grid.
        if (button == 0 || button == 1) {
            if (Draw.inside(mouseX, mouseY, gridX, gridY, gridW, gridH)) {
                return handleGridClick(mouseX, mouseY, button);
            }
        }

        // Scrollbar drag.
        if (button == 0 && Draw.inside(mouseX, mouseY, panelX + panelW - 12, gridY, 12, gridH)) {
            draggingScrollbar = true;
            dragOffsetY = (int) mouseY - gridY;
            return true;
        }

        searchFocused = false;
        return super.mouseClicked(event, doubled);
    }

    private void handleHeaderIcon(int index) {
        switch (HEADER_ICONS[index][0]) {
            case "grid" -> {
                click();
                activeTab = Tab.MOD_MENU;
            }
            case "gear" -> selectTab(Tab.SETTINGS);
            case "flower" -> selectTab(Tab.COSMETICS);
            case "social" -> selectTab(Tab.SOCIAL);
            case "home" -> {
                click();
                onClose();
            }
            default -> {
                click();
                showToast("Coming soon");
            }
        }
    }

    private void selectTab(Tab tab) {
        click();
        if (tab == Tab.HUD_EDITOR) {
            if (this.minecraft != null) {
                this.minecraft.setScreenAndShow(new HudEditorScreen(this));
            }
            return;
        }
        activeTab = tab;
        if (tab != Tab.MOD_MENU) {
            searchFocused = false;
        }
    }

    private boolean handleToolbarClick(double mouseX, double mouseY, int button) {
        if (button != 0) {
            return false;
        }
        int y = toolbarY + 6;
        int height = toolbarH - 12;
        int x = panelX + 14;

        for (Filter value : Filter.values()) {
            int w = this.font.width(value.label) + 20;
            if (Draw.inside(mouseX, mouseY, x, y, w, height)) {
                click();
                filter = value;
                scrollTarget = 0;
                return true;
            }
            x += w + 5;
        }

        int right = panelX + panelW - 14;
        int iconBtn = height;
        int layoutX = right - iconBtn;
        int favX = layoutX - iconBtn - 5;
        int searchW = Math.min(190, panelW / 3);
        int searchX = favX - 5 - searchW;

        if (Draw.inside(mouseX, mouseY, layoutX, y, iconBtn, iconBtn)) {
            click();
            listLayout = !listLayout;
            scrollTarget = 0;
            return true;
        }
        if (Draw.inside(mouseX, mouseY, favX, y, iconBtn, iconBtn)) {
            click();
            favoritesOnly = !favoritesOnly;
            scrollTarget = 0;
            return true;
        }
        if (Draw.inside(mouseX, mouseY, searchX, y, searchW, iconBtn)) {
            searchFocused = true;
            return true;
        }
        searchFocused = false;
        return true;
    }

    private boolean handleGridClick(double mouseX, double mouseY, int button) {
        List<ClientMod> visible = visibleMods();
        int columns = columnCount();
        for (int index = 0; index < visible.size(); index++) {
            int column = index % columns;
            int row = index / columns;
            int x = gridX + column * (cardW + Theme.GUTTER);
            int y = gridY + row * (cardH + Theme.GUTTER) - (int) Math.round(scroll);
            if (!Draw.inside(mouseX, mouseY, x, y, cardW, cardH)) {
                continue;
            }
            ClientMod mod = visible.get(index);

            if (button == 1) {
                mods.resetSettings(mod);
                click();
                showToast(mod.displayName() + ": settings reset");
                return true;
            }

            if (listLayout) {
                if (mouseX >= x + cardW - 110) {
                    mods.toggle(mod);
                    click();
                    return true;
                }
                if (mouseX >= x + cardW - 160 && mouseX < x + cardW - 138) {
                    mods.setFavorite(mod, !mod.favorite());
                    click();
                    return true;
                }
                if (mouseX >= x + cardW - 136 && mouseX < x + cardW - 116) {
                    openSettings(mod);
                    return true;
                }
                return true;
            }

            int rowY = y + cardH - 26;
            int gearSize = 18;
            int gearX = x + 10;
            int toggleX = gearX + gearSize + 6;
            int toggleW = x + cardW - 10 - toggleX;

            if (Draw.inside(mouseX, mouseY, toggleX, rowY, toggleW, gearSize)) {
                mods.toggle(mod);
                click();
                return true;
            }
            if (Draw.inside(mouseX, mouseY, gearX, rowY, gearSize, gearSize)) {
                openSettings(mod);
                return true;
            }
            int heartX = x + cardW - 20;
            if (Draw.inside(mouseX, mouseY, heartX - 3, y + 5, 16, 16)) {
                mods.setFavorite(mod, !mod.favorite());
                click();
                return true;
            }
            return true;
        }
        return false;
    }

    private void openSettings(ClientMod mod) {
        if (mod == null) {
            return;
        }
        click();
        if (!mod.hasSettings()) {
            showToast(mod.displayName() + " has no settings yet");
            return;
        }
        if (this.minecraft != null) {
            this.minecraft.setScreenAndShow(new ModSettingsScreen(this, mod));
        }
    }

    @Override
    public boolean mouseScrolled(double mouseX, double mouseY, double horizontal, double vertical) {
        layout();
        if (Draw.inside(mouseX, mouseY, gridX, gridY, gridW, gridH)) {
            scrollTarget = clampScroll(scrollTarget - vertical * 26);
            return true;
        }
        return super.mouseScrolled(mouseX, mouseY, horizontal, vertical);
    }

    @Override
    public boolean mouseDragged(MouseButtonEvent event, double dragX, double dragY) {
        if (draggingScrollbar) {
            layout();
            int max = (int) Math.max(0, contentHeight - gridH);
            int thumbH = Math.max(24, (int) ((float) gridH * gridH / Math.max(1, contentHeight)));
            double fraction = (event.y() - gridY - dragOffsetY) / (double) Math.max(1, gridH - thumbH);
            scrollTarget = clampScroll(fraction * max);
            scroll = scrollTarget;
            return true;
        }
        return super.mouseDragged(event, dragX, dragY);
    }

    @Override
    public boolean mouseReleased(MouseButtonEvent event) {
        draggingScrollbar = false;
        return super.mouseReleased(event);
    }

    @Override
    public boolean keyPressed(KeyEvent event) {
        int key = event.key();

        if (key == 256) { // GLFW_KEY_ESCAPE
            onClose();
            return true;
        }
        if (mods.menuKeybind.matches(key)) {
            onClose();
            return true;
        }
        if (searchFocused) {
            if (key == 259) { // BACKSPACE
                if (!search.isEmpty()) {
                    search = search.substring(0, search.length() - 1);
                    scrollTarget = 0;
                }
                return true;
            }
            if (key == 257 || key == 335) { // ENTER / KP_ENTER
                searchFocused = false;
                return true;
            }
        }
        return super.keyPressed(event);
    }

    @Override
    public boolean charTyped(CharacterEvent event) {
        if (searchFocused) {
            String typed = event.codepointAsString();
            if (typed != null && !typed.isBlank() && search.length() < 32) {
                search += typed;
                scrollTarget = 0;
                return true;
            }
        }
        return super.charTyped(event);
    }
}

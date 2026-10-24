package com.rawcraft.client.ui.theme;

/** The whole palette in one place. Values are packed ARGB. */
public final class Theme {
    private Theme() {
    }

    // Surfaces
    public static final int PANEL = 0xFF12141A;
    public static final int PANEL_HEADER = 0xFF15171E;
    public static final int CARD = 0xFF161920;
    public static final int CARD_HOVER = 0xFF1F2937;
    public static final int CARD_DISABLED = 0xFF1B1E25;

    // Lines
    public static final int BORDER = 0xFF23262E;
    public static final int BORDER_STRONG = 0xFF2E323C;

    // Text
    public static final int TEXT = 0xFFFFFFFF;
    public static final int TEXT_DIM = 0xFF8A8F98;
    public static final int TEXT_DIMMER = 0xFF5D626B;

    // Accent + state
    public static final int ACCENT = 0xFFE02B2B;
    public static final int ACCENT_HOVER = 0xFFF03B3B;
    public static final int ENABLED_BG = 0xFF1F6B2A;
    public static final int ENABLED_BG_HOVER = 0xFF257F33;
    public static final int ENABLED_TEXT = 0xFF4CAF50;
    public static final int DISABLED_BG = 0xFF1B1E25;
    public static final int DISABLED_BG_HOVER = 0xFF24272F;

    // Radii
    public static final int RADIUS_CARD = 8;
    public static final int RADIUS_CONTROL = 6;
    public static final int RADIUS_PILL = 999;

    // Metrics
    public static final int PANEL_MARGIN = 14;
    public static final int HEADER_HEIGHT = 46;
    public static final int TAB_BAR_HEIGHT = 36;
    public static final int TOOLBAR_HEIGHT = 38;
    public static final int FOOTER_HEIGHT = 22;
    public static final int GUTTER = 10;
    public static final int CARD_COLUMNS = 4;
    /** Below this width the grid drops a column instead of squeezing cards. */
    public static final int CARD_MIN_WIDTH = 132;
    /** 170 / 210 from the reference layout, kept as a ratio so cards scale with the window. */
    public static final float CARD_ASPECT = 170f / 210f;

    // Animation
    public static final long HOVER_FADE_MS = 100;

    // Scrim behind the panel
    public static final int SCRIM = 0x8C000000;
}

package com.rawcraft.client.ui;

public final class RawCraftTheme {
    private RawCraftTheme() {}

    // PRD §4.2 Design Tokens
    public static final int BG_SCRIM = 0x8C07040F; // #07040F @ 55%
    public static final int BG_PANEL = 0xEB120C22; // #120C22 @ 92%
    public static final int BG_PANEL_SOLID = 0xFF120C22;
    public static final int BG_SURFACE = 0xFF1B1334;
    public static final int BG_SURFACE_HOVER = 0xFF241A44;
    public static final int BORDER_SUBTLE = 0xFF33285C;

    // Accent & Highlights
    public static final int ACCENT = 0xFF8B5CF6;
    public static final int ACCENT_HOVER = 0xFFA78BFA;
    public static final int ACCENT_PRESSED = 0xFF7C3AED;
    public static final int ACCENT_TRANSLUCENT = 0x408B5CF6;

    // Typography & Content
    public static final int TEXT_PRIMARY = 0xFFF3F0FF;
    public static final int TEXT_SECONDARY = 0xFFA79EC7;
    public static final int TEXT_DISABLED = 0xFF625A82;

    // Status & Telemetry Indicators
    public static final int SUCCESS = 0xFF34D399;
    public static final int WARNING = 0xFFFBBF24;
    public static final int ERROR = 0xFFF87171;
    public static final int DANGER = 0xFFF87171;

    // HUD Studio Specific
    public static final int HUD_OVERLAY_BG = 0xB2120C22; // ~70% opacity
    public static final int HUD_OVERLAY_EDIT_BG = 0xEB1B1334; // ~92% opacity
}

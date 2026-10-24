package com.rawcraft.client;

/**
 * Single source of truth for client identity strings.
 *
 * <p>Deliberate split: {@link #CLIENT_VERSION} is the client build version, {@link #MINECRAFT_VERSION}
 * is the version string shown to the player. They are independent on purpose.
 */
public final class RawCraft {
    public static final String MOD_ID = "rawcraft-client";
    public static final String CLIENT_NAME = "RawCraft";
    public static final String CLIENT_VERSION = "26.2";
    public static final String MINECRAFT_VERSION = "1.21.1";

    private RawCraft() {
    }

    /** Footer line, e.g. {@code RawCraft 26.2 (Minecraft 1.21.1)}. */
    public static String footer() {
        return CLIENT_NAME + " " + CLIENT_VERSION + " (Minecraft " + MINECRAFT_VERSION + ")";
    }
}

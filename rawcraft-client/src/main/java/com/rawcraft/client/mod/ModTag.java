package com.rawcraft.client.mod;

/** Grid filter tags. {@link #NEW} is assigned from the registry, not hardcoded per mod. */
public enum ModTag {
    HUD("HUD"),
    HYPIXEL("Hypixel"),
    PVP("PvP"),
    NEW("New");

    public final String label;

    ModTag(String label) {
        this.label = label;
    }
}

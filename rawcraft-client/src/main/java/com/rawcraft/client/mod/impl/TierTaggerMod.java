package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Shows known PvP tiers next to names. */
public class TierTaggerMod extends ClientMod {
    public TierTaggerMod() {
        super("tierTagger", "Tier Tagger", "Shows known PvP tiers next to names.", "trophy", ModTag.HYPIXEL, ModTag.PVP);
    }
}

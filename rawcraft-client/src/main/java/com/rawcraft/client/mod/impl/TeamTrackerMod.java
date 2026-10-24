package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Tracks nearby teammates. */
public class TeamTrackerMod extends ClientMod {
    public TeamTrackerMod() {
        super("teamTracker", "Team Tracker", "Tracks nearby teammates.", "team");
    }
}

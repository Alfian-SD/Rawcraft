package com.rawcraft.client.mod.impl;

import com.rawcraft.client.input.ClickTracker;
import com.rawcraft.client.mod.ModTag;

/** Left and right clicks per second. */
public class CpsMod extends SimpleTextHud {

    public CpsMod() {
        super("cps", "CPS", "Clicks per second.", "gauge", ModTag.HUD, ModTag.PVP);
    }

    @Override
    protected String text() {
        return ClickTracker.leftCps() + " | " + ClickTracker.rightCps() + " CPS";
    }
}

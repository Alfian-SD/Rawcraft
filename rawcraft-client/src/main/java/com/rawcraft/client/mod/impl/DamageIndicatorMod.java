package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Shows damage dealt above entities. */
public class DamageIndicatorMod extends ClientMod {
    public DamageIndicatorMod() {
        super("damageIndicator", "Damage Indicator", "Shows damage dealt above entities.", "target", ModTag.PVP);
    }
}

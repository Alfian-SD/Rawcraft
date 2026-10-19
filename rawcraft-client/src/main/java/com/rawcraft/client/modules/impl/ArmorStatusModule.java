package com.rawcraft.client.modules.impl;

import com.rawcraft.client.modules.Module;
import com.rawcraft.client.modules.ModuleCategory;
import com.rawcraft.client.settings.BooleanSetting;
import com.rawcraft.client.settings.EnumSetting;

public class ArmorStatusModule extends Module {
    private final EnumSetting format;
    private final BooleanSetting includeOffhand;

    public ArmorStatusModule() {
        super("armor_hud_mod", "Armor Status Format", ModuleCategory.HUD,
                "Reads equipped item damage and gracefully handles non-damageable items (e.g., Totem/Apples).", true);
        this.format = new EnumSetting("format", "Durability Display", "Durability format readout", "BOTH", "PERCENT", "RAW", "BOTH");
        this.includeOffhand = new BooleanSetting("includeOffhand", "Show Offhand Non-Durability Item", "Render offhand item even if it has no durability", true);
        registerSetting(format);
        registerSetting(includeOffhand);
    }

    public EnumSetting getFormat() {
        return format;
    }

    public BooleanSetting getIncludeOffhand() {
        return includeOffhand;
    }
}

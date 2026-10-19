package com.rawcraft.client.settings;

public class BooleanSetting extends Setting<Boolean> {
    public BooleanSetting(String id, String label, String description, boolean defaultValue) {
        super(id, label, description, defaultValue);
    }

    public void toggle() {
        setValue(!getValue());
    }
}

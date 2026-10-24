package com.rawcraft.client.setting;

import com.google.gson.JsonElement;

/**
 * Base for every typed mod setting. Settings are pure data plus JSON round-trip;
 * rendering lives in {@code ModSettingsScreen} so a setting never knows about the GUI.
 */
public abstract class Setting<T> {
    private final String id;
    private final String label;
    private final T defaultValue;
    protected T value;

    protected Setting(String id, String label, T defaultValue) {
        this.id = id;
        this.label = label;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    }

    /** Restores the constructor default. Used by the card right-click "Reset settings" action. */
    public void reset() {
        set(defaultValue);
    }

    public String id() {
        return id;
    }

    public String label() {
        return label;
    }

    public T get() {
        return value;
    }

    public void set(T newValue) {
        this.value = newValue;
    }

    public abstract JsonElement toJson();

    public abstract void fromJson(JsonElement json);
}

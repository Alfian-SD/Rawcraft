package com.rawcraft.client.modules;

import com.rawcraft.client.settings.Setting;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class Module {
    private final String id;
    private final String name;
    private final ModuleCategory category;
    private final String description;
    private boolean enabled;
    private final boolean defaultEnabled;
    private final List<Setting<?>> settings = new ArrayList<>();

    public Module(String id, String name, ModuleCategory category, String description, boolean defaultEnabled) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.description = description;
        this.defaultEnabled = defaultEnabled;
        this.enabled = defaultEnabled;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ModuleCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        if (this.enabled != enabled) {
            this.enabled = enabled;
            if (enabled) {
                onEnable();
            } else {
                onDisable();
            }
        }
    }

    public void toggle() {
        setEnabled(!enabled);
    }

    public List<Setting<?>> getSettings() {
        return Collections.unmodifiableList(settings);
    }

    protected void registerSetting(Setting<?> setting) {
        settings.add(setting);
    }

    public Setting<?> getSetting(String id) {
        for (Setting<?> s : settings) {
            if (s.getId().equals(id)) return s;
        }
        return null;
    }

    public void reset() {
        setEnabled(defaultEnabled);
        for (Setting<?> s : settings) {
            s.reset();
        }
    }

    public void onEnable() {}

    public void onDisable() {}

    public void onTick() {}
}

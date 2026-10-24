package com.rawcraft.client.mod;

import com.rawcraft.client.setting.Setting;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * One toggleable client feature.
 *
 * <p>Every mod starts disabled. {@link #defaultEnabled()} is intentionally hardcoded to
 * {@code false} rather than stored per mod, so a new mod can never ship enabled by accident.
 * Saved state from {@code mods.json} wins after the first launch.
 */
public abstract class ClientMod {
    private final String id;
    private final String displayName;
    private final String description;
    private final String iconKey;
    private final List<ModTag> tags;
    private final List<Setting<?>> settings = new ArrayList<>();

    private boolean enabled;
    private boolean favorite;

    protected ClientMod(String id, String displayName, String description, String iconKey, ModTag... tags) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.iconKey = iconKey;
        this.tags = new ArrayList<>(List.of(tags));
    }

    public String id() {
        return id;
    }

    public String displayName() {
        return displayName;
    }

    public String description() {
        return description;
    }

    public String iconKey() {
        return iconKey;
    }

    public List<ModTag> tags() {
        return Collections.unmodifiableList(tags);
    }

    public boolean hasTag(ModTag tag) {
        return tags.contains(tag);
    }

    public boolean defaultEnabled() {
        return false;
    }

    public boolean enabled() {
        return enabled;
    }

    public void setEnabled(boolean value) {
        if (this.enabled == value) {
            return;
        }
        this.enabled = value;
        if (value) {
            onEnable();
        } else {
            onDisable();
        }
    }

    public boolean favorite() {
        return favorite;
    }

    public void setFavorite(boolean value) {
        this.favorite = value;
    }

    public List<Setting<?>> settings() {
        return Collections.unmodifiableList(settings);
    }

    public boolean hasSettings() {
        return !settings.isEmpty();
    }

    protected void addSetting(Setting<?> setting) {
        settings.add(setting);
    }

    /** Called once when the mod flips to enabled. Register listeners here, not in the constructor. */
    protected void onEnable() {
    }

    /** Called once when the mod flips to disabled. Must undo everything {@link #onEnable()} did. */
    protected void onDisable() {
    }

    /** Client tick, only invoked while enabled. */
    public void onTick() {
    }

    /**
     * Global key press while no screen is open, only invoked while enabled.
     * Replaces a per-mod keybind mixin: one hook dispatches to every mod.
     */
    public void onKey(int key) {
    }
}

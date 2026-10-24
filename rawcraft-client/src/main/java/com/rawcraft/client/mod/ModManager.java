package com.rawcraft.client.mod;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.rawcraft.client.RawCraft;
import com.rawcraft.client.mod.impl.ModRegistry;
import com.rawcraft.client.setting.KeybindSetting;
import com.rawcraft.client.setting.Setting;
import com.rawcraft.client.util.Log;
import net.minecraft.client.Minecraft;
import org.lwjgl.glfw.GLFW;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Owns the mod registry, enable state and {@code config/rawcraft/mods.json} persistence.
 *
 * <p>Saving is debounced: {@link #markDirty()} only sets a flag, and {@link #tick()} flushes it once
 * the player has stopped clicking. Every toggle also flushes immediately on menu close and on exit,
 * so a hard crash can lose at most {@link #SAVE_DEBOUNCE_MS} of changes.
 */
public final class ModManager {
    private static final long SAVE_DEBOUNCE_MS = 600;
    private static final int CONFIG_VERSION = 1;

    private static final ModManager INSTANCE = new ModManager();

    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final Map<String, ClientMod> byId = new LinkedHashMap<>();
    private final List<ClientMod> sorted = new ArrayList<>();

    public final KeybindSetting menuKeybind = new KeybindSetting("menuKeybind", "Mod Menu key", GLFW.GLFW_KEY_RIGHT_SHIFT);

    private boolean dirty;
    private long lastChangeAt;
    private boolean loaded;

    private ModManager() {
    }

    public static ModManager get() {
        return INSTANCE;
    }

    // ── registry ─────────────────────────────────────────────────────────────

    public void bootstrap() {
        if (!sorted.isEmpty()) {
            return;
        }
        for (ClientMod mod : ModRegistry.createAll()) {
            byId.put(mod.id(), mod);
            sorted.add(mod);
        }
        sorted.sort(Comparator.comparing(ClientMod::displayName, String.CASE_INSENSITIVE_ORDER));
        load();
        loaded = true;
        Log.info("Registered " + sorted.size() + " mods (" + enabledCount() + " enabled)");
    }

    public List<ClientMod> mods() {
        return List.copyOf(sorted);
    }

    public ClientMod get(String id) {
        return byId.get(id);
    }

    public int enabledCount() {
        int count = 0;
        for (ClientMod mod : sorted) {
            if (mod.enabled()) {
                count++;
            }
        }
        return count;
    }

    // ── state changes ────────────────────────────────────────────────────────

    public void setEnabled(ClientMod mod, boolean value) {
        if (mod == null) {
            return;
        }
        mod.setEnabled(value);
        markDirty();
    }

    public void toggle(ClientMod mod) {
        if (mod != null) {
            setEnabled(mod, !mod.enabled());
        }
    }

    public void setFavorite(ClientMod mod, boolean value) {
        if (mod != null) {
            mod.setFavorite(value);
            markDirty();
        }
    }

    public void resetSettings(ClientMod mod) {
        if (mod == null) {
            return;
        }
        for (Setting<?> setting : mod.settings()) {
            setting.reset();
        }
        markDirty();
    }

    public void markDirty() {
        dirty = true;
        lastChangeAt = System.currentTimeMillis();
    }

    /** Called from the client tick hook. Cheap no-op while nothing is pending. */
    public void tick() {
        if (dirty && System.currentTimeMillis() - lastChangeAt >= SAVE_DEBOUNCE_MS) {
            save();
        }
        for (ClientMod mod : sorted) {
            if (mod.enabled()) {
                try {
                    mod.onTick();
                } catch (Throwable t) {
                    Log.error("Mod '" + mod.id() + "' threw in onTick; disabling it", t);
                    mod.setEnabled(false);
                    markDirty();
                }
            }
        }
    }

    // ── persistence ──────────────────────────────────────────────────────────

    private Path configPath() {
        Minecraft mc = Minecraft.getInstance();
        Path gameDir = mc != null && mc.gameDirectory != null
                ? mc.gameDirectory.toPath()
                : Path.of(".");
        return gameDir.resolve("config").resolve(RawCraft.CLIENT_NAME.toLowerCase(java.util.Locale.ROOT))
                .resolve("mods.json");
    }

    public void save() {
        dirty = false;
        JsonObject root = new JsonObject();
        root.addProperty("version", CONFIG_VERSION);
        root.add("menuKeybind", menuKeybind.toJson());

        JsonObject modsJson = new JsonObject();
        for (ClientMod mod : sorted) {
            JsonObject entry = new JsonObject();
            entry.addProperty("enabled", mod.enabled());
            entry.addProperty("favorite", mod.favorite());
            if (mod instanceof HudMod hud) {
                entry.addProperty("anchor", hud.anchor().name());
            }
            JsonObject settingsJson = new JsonObject();
            for (Setting<?> setting : mod.settings()) {
                settingsJson.add(setting.id(), setting.toJson());
            }
            entry.add("settings", settingsJson);
            modsJson.add(mod.id(), entry);
        }
        root.add("mods", modsJson);

        try {
            Path path = configPath();
            Files.createDirectories(path.getParent());
            Path tmp = path.resolveSibling("mods.json.tmp");
            Files.writeString(tmp, gson.toJson(root), StandardCharsets.UTF_8);
            // Atomic-ish replace so a crash mid-write cannot truncate the real config.
            Files.move(tmp, path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            Log.error("Failed to save mods.json", e);
        }
    }

    private void load() {
        Path path = configPath();
        if (!Files.isRegularFile(path)) {
            Log.info("No mods.json yet; every mod starts disabled");
            return;
        }
        try {
            String raw = Files.readString(path, StandardCharsets.UTF_8);
            JsonObject root = JsonParser.parseString(raw).getAsJsonObject();

            JsonElement key = root.get("menuKeybind");
            if (key != null) {
                menuKeybind.fromJson(key);
            }

            JsonElement modsElement = root.get("mods");
            if (modsElement == null || !modsElement.isJsonObject()) {
                return;
            }
            JsonObject modsJson = modsElement.getAsJsonObject();
            for (ClientMod mod : sorted) {
                JsonElement entryElement = modsJson.get(mod.id());
                if (entryElement == null || !entryElement.isJsonObject()) {
                    continue;
                }
                JsonObject entry = entryElement.getAsJsonObject();
                if (entry.has("favorite")) {
                    mod.setFavorite(entry.get("favorite").getAsBoolean());
                }
                if (mod instanceof HudMod hud && entry.has("anchor")) {
                    try {
                        hud.setAnchor(HudAnchor.valueOf(entry.get("anchor").getAsString()));
                    } catch (IllegalArgumentException ignored) {
                        // Unknown anchor in an old config; keep the default.
                    }
                }
                JsonElement settingsElement = entry.get("settings");
                if (settingsElement != null && settingsElement.isJsonObject()) {
                    JsonObject settingsJson = settingsElement.getAsJsonObject();
                    for (Setting<?> setting : mod.settings()) {
                        setting.fromJson(settingsJson.get(setting.id()));
                    }
                }
                // Apply enable state last: onEnable() may read settings.
                if (entry.has("enabled")) {
                    mod.setEnabled(entry.get("enabled").getAsBoolean());
                }
            }
        } catch (Exception e) {
            Log.error("mods.json is corrupt; falling back to safe defaults (all disabled)", e);
            for (ClientMod mod : sorted) {
                mod.setEnabled(false);
                mod.setFavorite(false);
            }
        }
    }

    public boolean isLoaded() {
        return loaded;
    }
}

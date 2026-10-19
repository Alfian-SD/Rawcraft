package com.rawcraft.client.config;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.rawcraft.client.util.RawCraftLogger;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.Timer;
import java.util.TimerTask;
import java.util.function.Consumer;

public class ConfigManager {
    private static ConfigManager instance;
    private static final Gson GSON = new GsonBuilder().setPrettyPrinting().create();

    private File configFile;
    private File tempFile;
    private ConfigData config;
    private Timer debounceTimer;
    private final Object saveLock = new Object();
    private String pendingToast = null;

    private ConfigManager() {
        File configDir = new File("config" + File.separator + "rawcraft");
        if (!configDir.exists()) {
            configDir.mkdirs();
        }
        this.configFile = new File(configDir, "client.json");
        this.tempFile = new File(configDir, "client.json.tmp");
        this.config = ConfigData.createDefault();
    }

    public static synchronized ConfigManager getInstance() {
        if (instance == null) {
            instance = new ConfigManager();
        }
        return instance;
    }

    public void setConfigFileForTesting(File file) {
        this.configFile = file;
        this.tempFile = new File(file.getParentFile(), file.getName() + ".tmp");
    }

    public void setConfigPath(File file) {
        setConfigFileForTesting(file);
    }

    public synchronized ConfigData getConfig() {
        if (config == null) {
            config = ConfigData.createDefault();
        }
        return config;
    }

    public synchronized ConfigData getCurrentConfig() {
        return getConfig();
    }

    public void save() {
        saveNow();
    }

    public synchronized void resetToDefaults() {
        this.config = ConfigData.createDefault();
        saveNow();
    }

    public synchronized void update(Consumer<ConfigData> mutator) {
        if (mutator != null) {
            mutator.accept(getConfig());
            scheduleDebouncedSave(500);
        }
    }

    public synchronized void load() {
        if (!configFile.exists()) {
            RawCraftLogger.info("Config file not found. Creating default client.json.");
            config = ConfigData.createDefault();
            saveNow();
            return;
        }

        try (FileReader reader = new FileReader(configFile)) {
            ConfigData loaded = GSON.fromJson(reader, ConfigData.class);
            if (loaded == null || loaded.hud == null || loaded.hud.elements == null || loaded.hud.elements.isEmpty()) {
                handleCorruptConfig("Incomplete or missing HUD elements in config");
            } else {
                this.config = loaded;
                RawCraftLogger.info("Loaded configuration successfully from " + configFile.getPath());
            }
        } catch (Throwable t) {
            handleCorruptConfig("JSON parse failure: " + t.getMessage());
        }
    }

    private void handleCorruptConfig(String reason) {
        RawCraftLogger.warn("Config corruption detected (" + reason + "). Backing up and restoring defaults.");
        try {
            if (configFile.exists()) {
                File backup = new File(configFile.getParentFile(), "client.json.broken-" + System.currentTimeMillis());
                Files.move(configFile.toPath(), backup.toPath(), StandardCopyOption.REPLACE_EXISTING);
                RawCraftLogger.info("Moved broken config to " + backup.getName());
            }
        } catch (Exception e) {
            RawCraftLogger.error("Could not backup broken config file", e);
        }

        this.config = ConfigData.createDefault();
        this.pendingToast = "Config rusak, memakai default.";
        saveNow();
    }

    public void scheduleDebouncedSave(long delayMs) {
        synchronized (saveLock) {
            if (debounceTimer != null) {
                debounceTimer.cancel();
            }
            debounceTimer = new Timer("RawCraft-ConfigDebounce", true);
            debounceTimer.schedule(new TimerTask() {
                @Override
                public void run() {
                    saveNow();
                }
            }, delayMs);
        }
    }

    public void saveNow() {
        synchronized (saveLock) {
            if (debounceTimer != null) {
                debounceTimer.cancel();
                debounceTimer = null;
            }

            try {
                File parent = configFile.getParentFile();
                if (parent != null && !parent.exists()) {
                    parent.mkdirs();
                }

                // Write atomic temp file
                try (FileWriter writer = new FileWriter(tempFile)) {
                    GSON.toJson(getConfig(), writer);
                    writer.flush();
                }

                // Atomic replace
                Files.move(tempFile.toPath(), configFile.toPath(),
                        StandardCopyOption.REPLACE_EXISTING,
                        StandardCopyOption.ATOMIC_MOVE);

                RawCraftLogger.info("Saved configuration atomically to " + configFile.getName());
            } catch (Throwable t) {
                RawCraftLogger.error("Failed to save client configuration", t);
            }
        }
    }

    public String consumePendingToast() {
        String msg = pendingToast;
        pendingToast = null;
        return msg;
    }

    public void setPendingToast(String toast) {
        this.pendingToast = toast;
    }
}

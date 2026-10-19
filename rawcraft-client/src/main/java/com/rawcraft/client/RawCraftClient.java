package com.rawcraft.client;

import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudManager;
import com.rawcraft.client.input.KeybindManager;
import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.performance.PerformanceManager;
import com.rawcraft.client.util.RawCraftLogger;
import net.fabricmc.api.ClientModInitializer;

public class RawCraftClient implements ClientModInitializer {
    public static final String MOD_ID = "rawcraft-client";
    public static final String MOD_NAME = "RawCraft Client";
    public static final String MOD_VERSION = "1.0.0";

    private static RawCraftClient instance;

    @Override
    public void onInitializeClient() {
        instance = this;
        RawCraftLogger.info("==================================================");
        RawCraftLogger.info("Initializing built-in client engine v" + MOD_VERSION);
        RawCraftLogger.info("Target: Minecraft 26.2 (Fabric)");
        RawCraftLogger.info("==================================================");

        // 1. Load Configuration (v1 Schema with atomic save and auto-recovery)
        ConfigManager.getInstance().load();

        // 2. Initialize Managers
        KeybindManager.getInstance();
        ModuleManager.getInstance();
        HudManager.getInstance();
        PerformanceManager.getInstance();

        // 3. Register Shutdown Hook for clean persistence
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            RawCraftLogger.info("Saving client configuration on JVM shutdown...");
            ConfigManager.getInstance().saveNow();
        }));

        RawCraftLogger.info("Initialization complete. Press Right-Shift to open Client Menu.");
    }

    public static RawCraftClient getInstance() {
        return instance;
    }
}

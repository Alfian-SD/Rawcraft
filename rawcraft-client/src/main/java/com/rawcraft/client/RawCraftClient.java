package com.rawcraft.client;

import com.rawcraft.client.mod.ModManager;
import com.rawcraft.client.util.Log;
import net.fabricmc.api.ClientModInitializer;

/** Fabric client entrypoint. Registers the mod list and wires the shutdown save. */
public class RawCraftClient implements ClientModInitializer {
    private static RawCraftClient instance;

    @Override
    public void onInitializeClient() {
        instance = this;
        Log.info("Initializing " + RawCraft.CLIENT_NAME + " " + RawCraft.CLIENT_VERSION);

        ModManager.get().bootstrap();

        // Belt and braces: the debounced save normally already ran, but a clean exit should never
        // lose the last toggle.
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            Log.info("Saving mods.json on shutdown");
            ModManager.get().save();
        }, "RawCraft-Shutdown"));

        Log.info("Ready. Press Right-Shift to open the Mod Menu.");
    }

    public static RawCraftClient getInstance() {
        return instance;
    }
}

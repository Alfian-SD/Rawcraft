package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import net.minecraft.client.Minecraft;

import java.util.Locale;

/** Heap usage of the running JVM. */
public class SystemResourcesMod extends SimpleTextHud {

    public SystemResourcesMod() {
        super("systemResources", "System Resources", "CPU and memory usage.", "bars", ModTag.HUD);
    }

    @Override
    protected String text() {
        Runtime runtime = Runtime.getRuntime();
        long usedMb = (runtime.totalMemory() - runtime.freeMemory()) / (1024L * 1024L);
        long maxMb = runtime.maxMemory() / (1024L * 1024L);
        int cores = Runtime.getRuntime().availableProcessors();
        Minecraft mc = Minecraft.getInstance();
        String fps = mc == null ? "0" : String.valueOf(mc.getFps());
        return String.format(Locale.US, "%d/%d MB  %d cores  %s fps", usedMb, maxMb, cores, fps);
    }
}

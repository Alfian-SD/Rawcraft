package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;
import com.rawcraft.client.setting.KeybindSetting;
import org.lwjgl.glfw.GLFW;

import java.util.Locale;

/** Lap timer. The keybind starts and stops it; right-clicking the card resets it. */
public class StopwatchMod extends SimpleTextHud {
    private final KeybindSetting toggleKey = new KeybindSetting("toggleKey", "Toggle key", GLFW.GLFW_KEY_KP_0);

    private boolean running;
    private long accumulatedMs;
    private long startedAt;

    public StopwatchMod() {
        super("stopwatch", "Stopwatch", "Simple lap timer.", "clock", ModTag.HUD);
        addSetting(toggleKey);
    }

    /** Called by the global key hook, not by a per-mod mixin. */
    public void onKey(int key) {
        if (!enabled() || !toggleKey.matches(key)) {
            return;
        }
        if (running) {
            accumulatedMs += System.currentTimeMillis() - startedAt;
            running = false;
        } else {
            startedAt = System.currentTimeMillis();
            running = true;
        }
    }

    public void resetTimer() {
        running = false;
        accumulatedMs = 0;
    }

    private long elapsedMs() {
        return running ? accumulatedMs + (System.currentTimeMillis() - startedAt) : accumulatedMs;
    }

    @Override
    protected String text() {
        long total = elapsedMs();
        long minutes = total / 60000;
        long seconds = (total / 1000) % 60;
        long hundredths = (total % 1000) / 10;
        return String.format(Locale.US, "%02d:%02d.%02d", minutes, seconds, hundredths);
    }
}

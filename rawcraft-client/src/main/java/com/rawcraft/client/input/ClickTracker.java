package com.rawcraft.client.input;

import com.rawcraft.client.config.ConfigManager;
import net.minecraft.client.Minecraft;

import java.util.ArrayDeque;
import java.util.Deque;

public class ClickTracker {
    private static ClickTracker instance;
    private final Deque<Long> leftClicks = new ArrayDeque<>();
    private final Deque<Long> rightClicks = new ArrayDeque<>();

    private ClickTracker() {}

    public static synchronized ClickTracker getInstance() {
        if (instance == null) {
            instance = new ClickTracker();
        }
        return instance;
    }

    public synchronized void recordClick(int button) {
        boolean ignoreOnScreen = ConfigManager.getInstance().getConfig().cps.ignoreWhenScreenOpen;
        if (ignoreOnScreen) {
            try {
                Minecraft mc = Minecraft.getInstance();
                if (mc.gui != null && mc.gui.screen() != null) {
                    return; // Ignore clicks when any UI screen is open
                }
            } catch (Throwable ignored) {}
        }

        long now = System.nanoTime();
        if (button == 0) {
            leftClicks.addLast(now);
        } else if (button == 1) {
            rightClicks.addLast(now);
        }
    }

    public synchronized void recordLeftClick() {
        recordClick(0);
    }

    public synchronized void recordRightClick() {
        recordClick(1);
    }

    public synchronized int getLeftCps() {
        double windowSec = getWindowSec();
        purgeOldClicks(leftClicks, windowSec);
        return (int) Math.round(leftClicks.size() / windowSec);
    }

    public synchronized int getRightCps() {
        double windowSec = getWindowSec();
        purgeOldClicks(rightClicks, windowSec);
        return (int) Math.round(rightClicks.size() / windowSec);
    }

    public synchronized int getTotalCps() {
        return getLeftCps() + getRightCps();
    }

    private double getWindowSec() {
        double sec = ConfigManager.getInstance().getConfig().cps.samplingWindowSec;
        return Math.max(0.5, Math.min(5.0, sec));
    }

    public long getWindowMs() {
        return (long) (getWindowSec() * 1000.0);
    }

    public void setWindowMs(long windowMs) {
        double sec = windowMs / 1000.0;
        ConfigManager.getInstance().update(cfg -> cfg.cps.samplingWindowSec = Math.max(0.5, Math.min(5.0, sec)));
    }

    private void purgeOldClicks(Deque<Long> queue, double windowSec) {
        long thresholdNanos = System.nanoTime() - (long) (windowSec * 1_000_000_000L);
        while (!queue.isEmpty() && queue.peekFirst() < thresholdNanos) {
            queue.pollFirst();
        }
    }

    public synchronized void reset() {
        leftClicks.clear();
        rightClicks.clear();
    }
}

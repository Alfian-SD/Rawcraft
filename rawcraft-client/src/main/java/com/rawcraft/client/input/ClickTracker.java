package com.rawcraft.client.input;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Rolling one-second click history for the CPS HUD mod.
 *
 * <p>Fed by {@code MouseHandlerMixin} on every button press, so a click is counted exactly once no
 * matter how fast it is. Sampling {@code isLeftPressed()} at 20 tps would miss anything under 50 ms.
 */
public final class ClickTracker {
    private static final Deque<Long> LEFT = new ArrayDeque<>();
    private static final Deque<Long> RIGHT = new ArrayDeque<>();

    private ClickTracker() {
    }

    public static void record(int button) {
        long now = System.currentTimeMillis();
        if (button == 0) {
            LEFT.addLast(now);
        } else if (button == 1) {
            RIGHT.addLast(now);
        } else {
            return;
        }
        prune(now);
    }

    public static int leftCps() {
        prune(System.currentTimeMillis());
        return LEFT.size();
    }

    public static int rightCps() {
        prune(System.currentTimeMillis());
        return RIGHT.size();
    }

    private static void prune(long now) {
        long cutoff = now - 1000L;
        while (!LEFT.isEmpty() && LEFT.peekFirst() < cutoff) {
            LEFT.pollFirst();
        }
        while (!RIGHT.isEmpty() && RIGHT.peekFirst() < cutoff) {
            RIGHT.pollFirst();
        }
    }
}

package com.rawcraft.client.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Thin wrapper so every subsystem logs under one prefix. */
public final class Log {
    private static final Logger LOGGER = LoggerFactory.getLogger("RawCraft");

    private Log() {
    }

    public static void info(String message) {
        LOGGER.info("[RawCraft] {}", message);
    }

    public static void warn(String message) {
        LOGGER.warn("[RawCraft] {}", message);
    }

    public static void error(String message, Throwable t) {
        LOGGER.error("[RawCraft] {}", message, t);
    }
}

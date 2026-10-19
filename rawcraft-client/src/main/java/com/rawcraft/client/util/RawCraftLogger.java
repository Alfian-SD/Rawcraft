package com.rawcraft.client.util;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

public class RawCraftLogger {
    private static final String PREFIX = "[RawCraft] ";
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final Deque<String> recentLogs = new ArrayDeque<>(64);
    private static String lastError = null;

    public static synchronized void info(String message) {
        String formatted = formatLog("INFO", message);
        System.out.println(formatted);
        record(formatted);
    }

    public static synchronized void warn(String message) {
        String formatted = formatLog("WARN", message);
        System.out.println(formatted);
        record(formatted);
    }

    public static synchronized void error(String message) {
        String formatted = formatLog("ERROR", message);
        System.err.println(formatted);
        record(formatted);
        lastError = formatted;
    }

    public static synchronized void error(String message, Throwable t) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        t.printStackTrace(pw);
        String details = message + " | Exception: " + t.getMessage() + "\n" + sw;
        String formatted = formatLog("ERROR", details);
        System.err.println(formatted);
        record(formatted);
        lastError = formatted;
    }

    private static String formatLog(String level, String msg) {
        return "[" + LocalTime.now().format(TIME_FMT) + "] " + PREFIX + "[" + level + "] " + msg;
    }

    private static void record(String line) {
        if (recentLogs.size() >= 60) {
            recentLogs.pollFirst();
        }
        recentLogs.addLast(line);
    }

    public static synchronized List<String> getRecentLogs() {
        return new ArrayList<>(recentLogs);
    }

    public static synchronized String getLastError() {
        return lastError != null ? lastError : "None";
    }

    public static synchronized void clearLastError() {
        lastError = null;
    }
}

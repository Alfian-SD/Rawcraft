package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ModTag;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/** Real world clock. */
public class TimeMod extends SimpleTextHud {
    private static final DateTimeFormatter FORMAT = DateTimeFormatter.ofPattern("HH:mm:ss", Locale.US);

    public TimeMod() {
        super("time", "Time", "Real world clock on screen.", "clock", ModTag.HUD);
    }

    @Override
    protected String text() {
        return LocalTime.now().format(FORMAT);
    }
}

package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Client side weather override. */
public class WeatherChangerMod extends ClientMod {
    public WeatherChangerMod() {
        super("weatherChanger", "Weather Changer", "Client side weather override.", "drop");
    }
}

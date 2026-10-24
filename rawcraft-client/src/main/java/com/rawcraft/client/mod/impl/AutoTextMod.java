package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Sends saved messages with a single key. */
public class AutoTextMod extends ClientMod {
    public AutoTextMod() {
        super("autoText", "Auto Text", "Sends saved messages with a single key.", "chat", ModTag.HYPIXEL);
    }
}

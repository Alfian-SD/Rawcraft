package com.rawcraft.client.mod.impl;

import com.rawcraft.client.mod.ClientMod;
import com.rawcraft.client.mod.ModTag;

/** Snapshots your worlds on a schedule. */
public class BackupsMod extends ClientMod {
    public BackupsMod() {
        super("backups", "Backups", "Snapshots your worlds on a schedule.", "archive");
    }
}

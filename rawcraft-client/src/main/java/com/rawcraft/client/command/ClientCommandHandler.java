package com.rawcraft.client.command;

import com.rawcraft.client.RawCraftClient;
import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.module.Module;
import com.rawcraft.client.module.ModuleManager;
import com.rawcraft.client.util.RawCraftLogger;
import net.minecraft.client.Minecraft;
import net.minecraft.network.chat.Component;

public class ClientCommandHandler {

    public static boolean handleCommand(String rawCommand) {
        if (rawCommand == null) return false;
        String cmd = rawCommand.trim();
        if (cmd.startsWith("/")) cmd = cmd.substring(1);

        String[] parts = cmd.split("\\s+");
        if (parts.length == 0 || !parts[0].equalsIgnoreCase("rawcraft")) {
            return false;
        }

        if (parts.length == 1 || parts[1].equalsIgnoreCase("help")) {
            sendChat("§d§l[RawCraft Client]§r Available commands:");
            sendChat("§7- §f/rawcraft diag §7: Display environment & module diagnostics.");
            sendChat("§7- §f/rawcraft reset [confirm] §7: Reset all settings to factory default.");
            return true;
        }

        String sub = parts[1].toLowerCase();
        if (sub.equals("diag")) {
            runDiagnostics();
            return true;
        } else if (sub.equals("reset")) {
            if (parts.length > 2 && parts[2].equalsIgnoreCase("confirm")) {
                ConfigManager.getInstance().update(cfg -> {
                    ConfigData def = ConfigData.createDefault();
                    cfg.ui = def.ui;
                    cfg.cps = def.cps;
                    cfg.hud = def.hud;
                    cfg.modules = def.modules;
                    cfg.performance = def.performance;
                });
                ConfigManager.getInstance().saveNow();
                sendChat("§a[RawCraft] Client configuration reset to factory defaults.");
            } else {
                sendChat("§e[RawCraft] WARNING: This will reset all client settings, keybinds, and HUD layouts.");
                sendChat("§eTo proceed, type: §f/rawcraft reset confirm");
            }
            return true;
        }

        sendChat("§c[RawCraft] Unknown sub-command: " + parts[1] + ". Type /rawcraft help");
        return true;
    }

    public static void runDiagnostics() {
        sendChat("§d§l========================================");
        sendChat("§d§l[RawCraft Client Diagnostics]");
        sendChat("§7- Version: §f" + RawCraftClient.MOD_VERSION + " §7| Target MC: §f26.2 (Fabric)");
        sendChat("§7- Java Runtime: §f" + System.getProperty("java.version") + " (" + System.getProperty("java.vendor") + ")");
        sendChat("§7- Active Modules: §a" + ModuleManager.getInstance().getActiveCount() + "§7 / " + ModuleManager.getInstance().getTotalCount());

        for (Module m : ModuleManager.getInstance().getModules()) {
            String statusColor = switch (m.getStatus()) {
                case ACTIVE -> "§a";
                case DISABLED -> "§7";
                case ERROR -> "§c";
                case UNAVAILABLE -> "§e";
            };
            String detail = m.getStatusDetail().isEmpty() ? "" : " §8(" + m.getStatusDetail() + ")";
            sendChat("  §f" + m.getName() + " §7[" + m.getId() + "]: " + statusColor + m.getStatus().getDisplayLabel() + detail);
        }

        sendChat("§7- Last Logged Error: §c" + RawCraftLogger.getLastError());
        sendChat("§d§l========================================");
    }

    private static void sendChat(String text) {
        RawCraftLogger.info(text);
        try {
            Minecraft mc = Minecraft.getInstance();
            if (mc.gui != null && mc.gui.hud != null && mc.gui.hud.getChat() != null) {
                mc.gui.hud.getChat().addClientSystemMessage(Component.literal(text));
            }
        } catch (Throwable ignored) {}
    }
}

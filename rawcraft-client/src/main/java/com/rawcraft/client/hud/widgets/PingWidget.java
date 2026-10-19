package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.config.ConfigManager;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.client.multiplayer.PlayerInfo;

public class PingWidget extends HudWidget {
    private boolean hideInSingleplayer = true;

    public PingWidget() {
        super("ping", "Ping / Latency", HudAnchor.TOP_LEFT, 8, 24);
        this.width = 68;
        this.height = 14;
    }

    public boolean isHideInSingleplayer() {
        return hideInSingleplayer;
    }

    public void setHideInSingleplayer(boolean hideInSingleplayer) {
        this.hideInSingleplayer = hideInSingleplayer;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        boolean isSingleplayer = mc.hasSingleplayerServer();

        if (isSingleplayer && hideInSingleplayer && !isEditor) {
            return;
        }

        String text;
        int color = getTextColor();

        if (isSingleplayer) {
            text = "Ping: —";
            color = 0xFFFBBF24; // Amber / Unavailable
        } else {
            int ping = -1;
            try {
                if (mc.getConnection() != null && mc.player != null) {
                    PlayerInfo info = mc.getConnection().getPlayerInfo(mc.player.getUUID());
                    if (info != null) {
                        ping = info.getLatency();
                    }
                }
            } catch (Throwable ignored) {}

            if (ping < 0) {
                text = isEditor ? "Ping: 32 ms" : "Ping: ?";
                color = 0xFF34D399;
            } else {
                text = "Ping: " + ping + " ms";
                if (ping <= 80) color = 0xFF34D399;
                else if (ping <= 150) color = 0xFFFBBF24;
                else color = 0xFFF87171;
            }
        }

        Font font = getFont();
        this.width = font.width(text) + 8;
        this.height = font.lineHeight + 6;

        extractor.text(font, text, x + 4, y + 3, color, isShadow());
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.hideInSingleplayer = cfg.hideInSingleplayer;
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.hideInSingleplayer = this.hideInSingleplayer;
    }
}

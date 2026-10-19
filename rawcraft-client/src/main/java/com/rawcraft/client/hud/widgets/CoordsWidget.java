package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.config.ConfigData;
import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import net.minecraft.client.DeltaTracker;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.Font;
import net.minecraft.client.gui.GuiGraphicsExtractor;
import net.minecraft.core.Direction;
import net.minecraft.world.entity.player.Player;

import java.util.Locale;

public class CoordsWidget extends HudWidget {
    private int decimals = 1;
    private boolean showFacing = true;
    private boolean netherConversion = false;

    public CoordsWidget() {
        super("coords", "XYZ Coordinates", HudAnchor.TOP_LEFT, 8, 40);
        this.width = 140;
        this.height = 14;
    }

    @Override
    protected void drawContent(GuiGraphicsExtractor extractor, DeltaTracker deltaTracker, int x, int y, int w, int h, boolean isEditor) {
        Minecraft mc = Minecraft.getInstance();
        Player player = mc.player;

        double px = 120.5, py = 64.0, pz = -33.2;
        String facingStr = "East (+X)";
        boolean isNether = false;

        if (player != null) {
            px = player.getX();
            py = player.getY();
            pz = player.getZ();
            Direction dir = player.getDirection();
            String axis = switch (dir.getAxis()) {
                case X -> dir.getAxisDirection() == Direction.AxisDirection.POSITIVE ? "+X" : "-X";
                case Z -> dir.getAxisDirection() == Direction.AxisDirection.POSITIVE ? "+Z" : "-Z";
                case Y -> dir.getAxisDirection() == Direction.AxisDirection.POSITIVE ? "+Y" : "-Y";
            };
            facingStr = dir.getName().substring(0, 1).toUpperCase(Locale.ROOT) + dir.getName().substring(1) + " (" + axis + ")";
            if (mc.level != null && (mc.level.dimension() == net.minecraft.world.level.Level.NETHER || mc.level.dimension().identifier().getPath().contains("nether"))) {
                isNether = true;
            }
        }

        String fmt = "%." + decimals + "f";
        String mainText = String.format(Locale.ROOT, "XYZ: " + fmt + " / " + fmt + " / " + fmt, px, py, pz);
        if (showFacing) {
            mainText += " §8|§r " + facingStr;
        }

        Font font = getFont();
        int totalHeight = font.lineHeight + 6;
        int maxW = font.width(mainText);

        String netherText = null;
        if (netherConversion && player != null) {
            if (isNether) {
                netherText = String.format(Locale.ROOT, "OW: " + fmt + " / " + fmt + " / " + fmt, px * 8.0, py, pz * 8.0);
            } else {
                netherText = String.format(Locale.ROOT, "Nether: " + fmt + " / " + fmt + " / " + fmt, px / 8.0, py, pz / 8.0);
            }
            maxW = Math.max(maxW, font.width(netherText));
            totalHeight += font.lineHeight + 2;
        }

        this.width = maxW + 8;
        this.height = totalHeight;

        extractor.text(font, mainText, x + 4, y + 3, getTextColor(), isShadow());
        if (netherText != null) {
            extractor.text(font, netherText, x + 4, y + 3 + font.lineHeight + 2, 0xFFA79EC7, isShadow());
        }
    }

    @Override
    public void syncFromConfig(ConfigData.HudElementConfig cfg) {
        super.syncFromConfig(cfg);
        this.decimals = cfg.decimals;
        this.showFacing = cfg.showFacing;
        this.netherConversion = cfg.netherConversion;
    }

    @Override
    public void syncToConfig(ConfigData.HudElementConfig cfg) {
        super.syncToConfig(cfg);
        cfg.decimals = this.decimals;
        cfg.showFacing = this.showFacing;
        cfg.netherConversion = this.netherConversion;
    }
}

package com.rawcraft.client.hud.widgets;

import com.rawcraft.client.hud.HudAnchor;
import com.rawcraft.client.hud.HudWidget;
import com.rawcraft.client.ui.RawCraftTheme;

public class ArmorHudWidget extends HudWidget {

    public static class ArmorItemData {
        public final String name;
        public final int currentDamage;
        public final int maxDamage;
        public final boolean hasDurability;

        public ArmorItemData(String name, int currentDamage, int maxDamage, boolean hasDurability) {
            this.name = name;
            this.currentDamage = currentDamage;
            this.maxDamage = maxDamage;
            this.hasDurability = hasDurability;
        }

        public int getPercentage() {
            if (!hasDurability || maxDamage <= 0) return 100;
            return Math.max(0, Math.min(100, Math.round(((float) currentDamage / maxDamage) * 100f)));
        }

        public int getColor() {
            if (!hasDurability) return RawCraftTheme.TEXT_SECONDARY;
            int pct = getPercentage();
            if (pct <= 25) return RawCraftTheme.ERROR;
            if (pct <= 55) return RawCraftTheme.WARNING;
            return RawCraftTheme.SUCCESS;
        }

        public String getReadout(String format) {
            if (!hasDurability) return "NO DURABILITY";
            int pct = getPercentage();
            if ("RAW".equalsIgnoreCase(format)) {
                return currentDamage + "/" + maxDamage;
            } else if ("PERCENT".equalsIgnoreCase(format)) {
                return pct + "%";
            } else {
                return currentDamage + " (" + pct + "%)";
            }
        }
    }

    public ArmorHudWidget() {
        super("armor", "Armor Durability", HudAnchor.BOTTOM_RIGHT, 16, 24, 1.0, 0.9, true);
        this.width = 160;
        this.height = 110;
    }

    @Override
    public void render(Object drawContext, float tickDelta) {
        // Rendered via native DrawContext
    }
}

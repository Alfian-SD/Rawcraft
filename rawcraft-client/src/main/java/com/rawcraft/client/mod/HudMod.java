package com.rawcraft.client.mod;

import com.rawcraft.client.setting.BooleanSetting;
import com.rawcraft.client.setting.ColorSetting;
import com.rawcraft.client.setting.SliderSetting;
import net.minecraft.client.gui.GuiGraphicsExtractor;

/**
 * A mod that paints something on the HUD. Position, scale and styling are stored on the mod so the
 * HUD editor can move it without knowing which mod it is.
 */
public abstract class HudMod extends ClientMod {
    public final SliderSetting offsetX = new SliderSetting("offsetX", "Offset X", 4, 0, 400, 1, "px");
    public final SliderSetting offsetY = new SliderSetting("offsetY", "Offset Y", 4, 0, 400, 1, "px");
    public final SliderSetting scale = new SliderSetting("scale", "Scale", 1.0, 0.5, 2.0, 0.05, "x");
    public final BooleanSetting background = new BooleanSetting("background", "Background", true);
    public final ColorSetting color = new ColorSetting("color", "Text colour", 0xFFFFFFFF);
    public final ColorSetting accent = new ColorSetting("accent", "Accent colour", 0xFF4CAF50);

    private HudAnchor anchor = HudAnchor.TOP_LEFT;

    protected HudMod(String id, String displayName, String description, String iconKey, ModTag... tags) {
        super(id, displayName, description, iconKey, tags);
        addSetting(offsetX);
        addSetting(offsetY);
        addSetting(scale);
        addSetting(background);
        addSetting(color);
        addSetting(accent);
    }

    public HudAnchor anchor() {
        return anchor;
    }

    public void setAnchor(HudAnchor anchor) {
        this.anchor = anchor;
    }

    /** Unscaled width in GUI pixels. */
    public abstract int width();

    /** Unscaled height in GUI pixels. */
    public abstract int height();

    /** Draw the element with its top-left corner at {@code (x, y)}. Scaling is applied by the caller. */
    public abstract void render(GuiGraphicsExtractor graphics, int x, int y);

    /** Unscaled text colour, for subclasses drawing their own strings. */
    protected int textColor() {
        return color.argb();
    }

    public int scaledWidth() {
        return Math.max(1, Math.round(width() * scale.asFloat()));
    }

    public int scaledHeight() {
        return Math.max(1, Math.round(height() * scale.asFloat()));
    }

    public int resolveX(int screenWidth) {
        return anchor.resolveX(screenWidth, scaledWidth(), offsetX.asInt());
    }

    public int resolveY(int screenHeight) {
        return anchor.resolveY(screenHeight, scaledHeight(), offsetY.asInt());
    }
}

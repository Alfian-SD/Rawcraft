package com.rawcraft.client.setting;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

/** Colour setting stored as packed ARGB. Serialised as {@code "#AARRGGBB"}. */
public class ColorSetting extends Setting<Integer> {
    public ColorSetting(String id, String label, int defaultArgb) {
        super(id, label, defaultArgb);
    }

    public int argb() {
        return get();
    }

    public int rgb() {
        return get() & 0xFFFFFF;
    }

    public float alpha() {
        return ((get() >>> 24) & 0xFF) / 255f;
    }

    @Override
    public JsonElement toJson() {
        return new JsonPrimitive(String.format("#%08X", get()));
    }

    @Override
    public void fromJson(JsonElement json) {
        if (json == null || !json.isJsonPrimitive()) {
            return;
        }
        String raw = json.getAsString().replace("#", "");
        try {
            // Accept both RRGGBB and AARRGGBB.
            set(raw.length() <= 6 ? 0xFF000000 | Integer.parseInt(raw, 16) : (int) Long.parseLong(raw, 16));
        } catch (NumberFormatException ignored) {
            // Keep default on malformed input.
        }
    }
}

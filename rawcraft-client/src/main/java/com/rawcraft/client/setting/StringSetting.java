package com.rawcraft.client.setting;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

public class StringSetting extends Setting<String> {
    private final int maxLength;

    public StringSetting(String id, String label, String defaultValue) {
        this(id, label, defaultValue, 64);
    }

    public StringSetting(String id, String label, String defaultValue, int maxLength) {
        super(id, label, defaultValue == null ? "" : defaultValue);
        this.maxLength = maxLength;
    }

    public int maxLength() {
        return maxLength;
    }

    @Override
    public JsonElement toJson() {
        return new JsonPrimitive(get());
    }

    @Override
    public void fromJson(JsonElement json) {
        if (json != null && json.isJsonPrimitive()) {
            String raw = json.getAsString();
            set(raw.length() > maxLength ? raw.substring(0, maxLength) : raw);
        }
    }
}

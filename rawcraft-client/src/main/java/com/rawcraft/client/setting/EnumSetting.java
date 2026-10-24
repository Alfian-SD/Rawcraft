package com.rawcraft.client.setting;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

/** Cycle setting over a fixed enum. Serialised by constant name. */
public class EnumSetting<T extends Enum<T>> extends Setting<T> {
    private final T[] values;

    public EnumSetting(String id, String label, T defaultValue) {
        super(id, label, defaultValue);
        this.values = defaultValue.getDeclaringClass().getEnumConstants();
    }

    public T[] values() {
        return values.clone();
    }

    public void cycle(int direction) {
        int index = get().ordinal() + direction;
        int count = values.length;
        set(values[((index % count) + count) % count]);
    }

    @Override
    public JsonElement toJson() {
        return new JsonPrimitive(get().name());
    }

    @Override
    public void fromJson(JsonElement json) {
        if (json == null || !json.isJsonPrimitive()) {
            return;
        }
        String name = json.getAsString();
        for (T candidate : values) {
            if (candidate.name().equalsIgnoreCase(name)) {
                set(candidate);
                return;
            }
        }
    }
}

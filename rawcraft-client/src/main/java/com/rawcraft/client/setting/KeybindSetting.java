package com.rawcraft.client.setting;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import org.lwjgl.glfw.GLFW;

/** Rebindable GLFW key. Stores the raw key code so it survives restarts. */
public class KeybindSetting extends Setting<Integer> {
    public KeybindSetting(String id, String label, int defaultKey) {
        super(id, label, defaultKey);
    }

    public boolean matches(int key) {
        return key > 0 && key == get();
    }

    /** Human readable name for the settings row. */
    public String displayName() {
        int key = get();
        if (key <= 0) {
            return "Unbound";
        }
        String name = GLFW.glfwGetKeyName(key, 0);
        if (name != null && !name.isBlank()) {
            return name.toUpperCase(java.util.Locale.ROOT);
        }
        return switch (key) {
            case GLFW.GLFW_KEY_LEFT_SHIFT -> "L SHIFT";
            case GLFW.GLFW_KEY_RIGHT_SHIFT -> "R SHIFT";
            case GLFW.GLFW_KEY_LEFT_CONTROL -> "L CTRL";
            case GLFW.GLFW_KEY_RIGHT_CONTROL -> "R CTRL";
            case GLFW.GLFW_KEY_LEFT_ALT -> "L ALT";
            case GLFW.GLFW_KEY_RIGHT_ALT -> "R ALT";
            case GLFW.GLFW_KEY_SPACE -> "SPACE";
            case GLFW.GLFW_KEY_TAB -> "TAB";
            case GLFW.GLFW_KEY_ENTER -> "ENTER";
            case GLFW.GLFW_KEY_ESCAPE -> "ESC";
            default -> "KEY " + key;
        };
    }

    @Override
    public JsonElement toJson() {
        return new JsonPrimitive(get());
    }

    @Override
    public void fromJson(JsonElement json) {
        if (json != null && json.isJsonPrimitive()) {
            set(json.getAsInt());
        }
    }
}

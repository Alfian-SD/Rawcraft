package com.rawcraft.client.input;

import com.rawcraft.client.config.ConfigManager;
import org.lwjgl.glfw.GLFW;

import java.util.HashMap;
import java.util.Map;

public class KeybindManager {
    private static KeybindManager instance;
    private static final Map<Integer, String> KEY_NAMES = new HashMap<>();

    static {
        KEY_NAMES.put(GLFW.GLFW_KEY_RIGHT_SHIFT, "Right Shift");
        KEY_NAMES.put(GLFW.GLFW_KEY_LEFT_SHIFT, "Left Shift");
        KEY_NAMES.put(GLFW.GLFW_KEY_RIGHT_CONTROL, "Right Ctrl");
        KEY_NAMES.put(GLFW.GLFW_KEY_LEFT_CONTROL, "Left Ctrl");
        KEY_NAMES.put(GLFW.GLFW_KEY_RIGHT_ALT, "Right Alt");
        KEY_NAMES.put(GLFW.GLFW_KEY_LEFT_ALT, "Left Alt");
        KEY_NAMES.put(GLFW.GLFW_KEY_SPACE, "Space");
        KEY_NAMES.put(GLFW.GLFW_KEY_TAB, "Tab");
        KEY_NAMES.put(GLFW.GLFW_KEY_ENTER, "Enter");
        KEY_NAMES.put(GLFW.GLFW_KEY_BACKSPACE, "Backspace");
        KEY_NAMES.put(GLFW.GLFW_KEY_ESCAPE, "Esc");
        KEY_NAMES.put(GLFW.GLFW_KEY_CAPS_LOCK, "Caps Lock");
        KEY_NAMES.put(GLFW.GLFW_KEY_UP, "Up");
        KEY_NAMES.put(GLFW.GLFW_KEY_DOWN, "Down");
        KEY_NAMES.put(GLFW.GLFW_KEY_LEFT, "Left");
        KEY_NAMES.put(GLFW.GLFW_KEY_RIGHT, "Right");
        for (int i = GLFW.GLFW_KEY_A; i <= GLFW.GLFW_KEY_Z; i++) {
            KEY_NAMES.put(i, String.valueOf((char) ('A' + (i - GLFW.GLFW_KEY_A))));
        }
        for (int i = GLFW.GLFW_KEY_0; i <= GLFW.GLFW_KEY_9; i++) {
            KEY_NAMES.put(i, String.valueOf((char) ('0' + (i - GLFW.GLFW_KEY_0))));
        }
        for (int i = 1; i <= 12; i++) {
            KEY_NAMES.put(GLFW.GLFW_KEY_F1 + (i - 1), "F" + i);
        }
    }

    private int menuKey = GLFW.GLFW_KEY_RIGHT_SHIFT;
    private Integer sprintKey = null;
    private Integer autoRunKey = null;
    private Integer fullbrightKey = null;
    private Integer hudEditorKey = null;

    private KeybindManager() {
        reloadFromConfig();
    }

    public static synchronized KeybindManager getInstance() {
        if (instance == null) {
            instance = new KeybindManager();
        }
        return instance;
    }

    public void reloadFromConfig() {
        var cfg = ConfigManager.getInstance().getConfig();
        this.menuKey = cfg.ui.openKeyCode != 0 ? cfg.ui.openKeyCode : GLFW.GLFW_KEY_RIGHT_SHIFT;
        this.sprintKey = cfg.modules.toggleSprint.sprintKeybind;
        this.autoRunKey = cfg.modules.toggleSprint.autoRunKeybind;
        this.fullbrightKey = cfg.modules.fullbright.keybind;
    }

    public int getMenuKey() {
        return menuKey;
    }

    public String getCurrentKeyName() {
        return getKeyName(menuKey);
    }

    public void setKey(int keyCode, String keyName) {
        setMenuKey(keyCode);
    }

    public void setMenuKey(int key) {
        this.menuKey = key;
        ConfigManager.getInstance().update(cfg -> {
            cfg.ui.openKeyCode = key;
            cfg.ui.openKeyName = getKeyName(key);
        });
    }

    public Integer getSprintKey() {
        return sprintKey;
    }

    public void setSprintKey(Integer key) {
        this.sprintKey = key;
        ConfigManager.getInstance().update(cfg -> cfg.modules.toggleSprint.sprintKeybind = key);
    }

    public Integer getAutoRunKey() {
        return autoRunKey;
    }

    public void setAutoRunKey(Integer key) {
        this.autoRunKey = key;
        ConfigManager.getInstance().update(cfg -> cfg.modules.toggleSprint.autoRunKeybind = key);
    }

    public Integer getFullbrightKey() {
        return fullbrightKey;
    }

    public void setFullbrightKey(Integer key) {
        this.fullbrightKey = key;
        ConfigManager.getInstance().update(cfg -> cfg.modules.fullbright.keybind = key);
    }

    public Integer getHudEditorKey() {
        return hudEditorKey;
    }

    public void setHudEditorKey(Integer key) {
        this.hudEditorKey = key;
    }

    public boolean matchesMenuKey(int key) {
        return key != 0 && key == this.menuKey;
    }

    public static String getKeyName(Integer key) {
        if (key == null || key <= 0) return "None";
        String known = KEY_NAMES.get(key);
        if (known != null) return known;
        String glfwName = GLFW.glfwGetKeyName(key, 0);
        if (glfwName != null && !glfwName.trim().isEmpty()) {
            return glfwName.toUpperCase();
        }
        return "Key " + key;
    }
}

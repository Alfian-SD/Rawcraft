package com.rawcraft.client.module;

import com.rawcraft.client.util.RawCraftLogger;
import net.minecraft.client.Minecraft;

import java.util.*;

public class ModuleManager {
    private static ModuleManager instance;
    private final Map<String, Module> modules = new LinkedHashMap<>();

    private ModuleManager() {
        register(new com.rawcraft.client.module.impl.FullbrightModule());
        register(new com.rawcraft.client.module.impl.ToggleSprintModule());
    }

    public static synchronized ModuleManager getInstance() {
        if (instance == null) {
            instance = new ModuleManager();
        }
        return instance;
    }

    public synchronized void register(Module module) {
        if (module == null) return;
        modules.put(module.getId().toLowerCase(), module);
        RawCraftLogger.info("Registered module: " + module.getName() + " [" + module.getId() + "]");
    }

    public synchronized Module getModule(String id) {
        if (id == null) return null;
        return modules.get(id.toLowerCase());
    }

    @SuppressWarnings("unchecked")
    public synchronized <T extends Module> T getModule(Class<T> clazz) {
        for (Module m : modules.values()) {
            if (clazz.isInstance(m)) {
                return (T) m;
            }
        }
        return null;
    }

    public synchronized Collection<Module> getModules() {
        return Collections.unmodifiableCollection(modules.values());
    }

    public synchronized List<Module> getModulesByCategory(ModuleCategory category) {
        List<Module> list = new ArrayList<>();
        for (Module m : modules.values()) {
            if (m.getCategory() == category) {
                list.add(m);
            }
        }
        return list;
    }

    public synchronized void setModuleEnabled(String id, boolean enabled) {
        Module m = getModule(id);
        if (m != null) {
            setModuleEnabled(m, enabled);
        }
    }

    public synchronized void setModuleEnabled(Module m, boolean enabled) {
        if (m == null) return;
        boolean wasEnabled = m.isEnabled();
        m.setEnabled(enabled);

        if (enabled && !wasEnabled) {
            try {
                m.onEnable();
                m.setStatus(ModuleStatus.ACTIVE);
                RawCraftLogger.info("Enabled module: " + m.getName());
            } catch (Throwable t) {
                m.setStatus(ModuleStatus.ERROR, t.getMessage());
                RawCraftLogger.error("Error enabling module " + m.getName(), t);
            }
        } else if (!enabled && wasEnabled) {
            try {
                m.onDisable();
                m.setStatus(ModuleStatus.DISABLED);
                RawCraftLogger.info("Disabled module: " + m.getName());
            } catch (Throwable t) {
                m.setStatus(ModuleStatus.ERROR, t.getMessage());
                RawCraftLogger.error("Error disabling module " + m.getName(), t);
            }
        }
    }

    public synchronized void toggleModule(String id) {
        Module m = getModule(id);
        if (m != null) {
            setModuleEnabled(m, !m.isEnabled());
        }
    }

    public synchronized void onTick(Minecraft mc) {
        for (Module m : modules.values()) {
            if (m.isEnabled() && m.getStatus() == ModuleStatus.ACTIVE) {
                try {
                    m.onTick(mc);
                } catch (Throwable t) {
                    m.setStatus(ModuleStatus.ERROR, "Tick error: " + t.getMessage());
                    RawCraftLogger.error("Exception during onTick in module " + m.getName(), t);
                }
            }
        }
    }

    public synchronized int getActiveCount() {
        int count = 0;
        for (Module m : modules.values()) {
            if (m.isEnabled() && m.getStatus() == ModuleStatus.ACTIVE) {
                count++;
            }
        }
        return count;
    }

    public synchronized int getTotalCount() {
        return modules.size();
    }
}

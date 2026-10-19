package com.rawcraft.client.modules;

import com.rawcraft.client.modules.impl.ArmorStatusModule;
import com.rawcraft.client.modules.impl.CustomCrosshairModule;
import com.rawcraft.client.modules.impl.FullbrightModule;
import com.rawcraft.client.modules.impl.ToggleSprintModule;

import java.util.*;

public class ModuleManager {
    private static ModuleManager instance;
    private final Map<String, Module> modules = new LinkedHashMap<>();

    private ModuleManager() {
        register(new FullbrightModule());
        register(new ToggleSprintModule());
        register(new ArmorStatusModule());
        register(new CustomCrosshairModule());
    }

    public static synchronized ModuleManager getInstance() {
        if (instance == null) {
            instance = new ModuleManager();
        }
        return instance;
    }

    public void register(Module module) {
        modules.put(module.getId(), module);
    }

    public Collection<Module> getModules() {
        return Collections.unmodifiableCollection(modules.values());
    }

    @SuppressWarnings("unchecked")
    public <T extends Module> T getModule(Class<T> clazz) {
        for (Module m : modules.values()) {
            if (clazz.isInstance(m)) {
                return (T) m;
            }
        }
        return null;
    }

    public Module getModule(String id) {
        return modules.get(id);
    }

    public List<Module> filter(String query, ModuleCategory category) {
        List<Module> filtered = new ArrayList<>();
        String q = (query == null) ? "" : query.trim().toLowerCase();

        for (Module m : modules.values()) {
            if (category != null && m.getCategory() != category) {
                continue;
            }
            if (!q.isEmpty()) {
                boolean matchesName = m.getName().toLowerCase().contains(q);
                boolean matchesDesc = m.getDescription().toLowerCase().contains(q);
                if (!matchesName && !matchesDesc) {
                    continue;
                }
            }
            filtered.add(m);
        }
        return filtered;
    }

    public void resetAll() {
        for (Module m : modules.values()) {
            m.reset();
        }
    }

    public void onTick() {
        for (Module m : modules.values()) {
            if (m.isEnabled()) {
                m.onTick();
            }
        }
    }
}

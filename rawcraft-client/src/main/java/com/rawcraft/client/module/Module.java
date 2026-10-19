package com.rawcraft.client.module;

import net.minecraft.client.Minecraft;

public abstract class Module {
    private final String id;
    private final String name;
    private final String description;
    private final ModuleCategory category;
    private boolean enabled;
    private ModuleStatus status = ModuleStatus.DISABLED;
    private String statusDetail = "";

    public Module(String id, String name, String description, ModuleCategory category, boolean defaultEnabled) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.category = category;
        this.enabled = defaultEnabled;
        this.status = defaultEnabled ? ModuleStatus.ACTIVE : ModuleStatus.DISABLED;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public ModuleCategory getCategory() {
        return category;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.status = ModuleStatus.DISABLED;
            this.statusDetail = "";
        } else if (this.status == ModuleStatus.DISABLED) {
            this.status = ModuleStatus.ACTIVE;
        }
    }

    public ModuleStatus getStatus() {
        return status;
    }

    public void setStatus(ModuleStatus status, String detail) {
        this.status = status;
        this.statusDetail = detail != null ? detail : "";
    }

    public void setStatus(ModuleStatus status) {
        setStatus(status, "");
    }

    public String getStatusDetail() {
        return statusDetail;
    }

    public void onEnable() throws Exception {}

    public void onDisable() throws Exception {}

    public void onTick(Minecraft mc) throws Exception {}
}

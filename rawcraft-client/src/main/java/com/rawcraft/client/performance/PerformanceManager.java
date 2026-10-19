package com.rawcraft.client.performance;

import com.rawcraft.client.config.ConfigManager;
import net.minecraft.client.CloudStatus;
import net.minecraft.client.Minecraft;
import net.minecraft.server.level.ParticleStatus;

public class PerformanceManager {
    private static PerformanceManager instance;

    private PerformanceProfile currentProfile = PerformanceProfile.BALANCED;
    private VanillaOptionsSnapshot userSnapshot = null;

    // Granular graphics states
    private String particles = "DECREASED";
    private String clouds = "FAST";
    private boolean entityShadows = false;
    private boolean weatherPrecipitation = true;
    private int viewDistance = 10;
    private int simulationDistance = 8;

    private PerformanceManager() {}

    public static synchronized PerformanceManager getInstance() {
        if (instance == null) {
            instance = new PerformanceManager();
        }
        return instance;
    }

    public PerformanceProfile getCurrentProfile() {
        return currentProfile;
    }

    public void captureInitialSnapshotIfNeeded() {
        if (userSnapshot != null) return;
        Minecraft mc = Minecraft.getInstance();
        if (mc != null && mc.options != null) {
            try {
                String p = mc.options.particles().get().name();
                String c = mc.options.cloudStatus().get().name();
                boolean s = mc.options.entityShadows().get();
                int vd = mc.options.renderDistance().get();
                int sd = mc.options.simulationDistance().get();
                userSnapshot = new VanillaOptionsSnapshot(p, c, s, 5, vd, sd, true);
            } catch (Throwable t) {
                userSnapshot = new VanillaOptionsSnapshot();
            }
        }
    }

    public void applyProfile(PerformanceProfile profile) {
        if (profile == null) return;
        captureInitialSnapshotIfNeeded();
        this.currentProfile = profile;

        switch (profile) {
            case LOW:
                this.particles = "MINIMAL";
                this.clouds = "OFF";
                this.entityShadows = false;
                this.weatherPrecipitation = false;
                this.viewDistance = 6;
                this.simulationDistance = 5;
                break;
            case BALANCED:
                this.particles = "DECREASED";
                this.clouds = "FAST";
                this.entityShadows = false;
                this.weatherPrecipitation = true;
                this.viewDistance = 10;
                this.simulationDistance = 8;
                break;
            case QUALITY:
                this.particles = "ALL";
                this.clouds = "FANCY";
                this.entityShadows = true;
                this.weatherPrecipitation = true;
                this.viewDistance = 16;
                this.simulationDistance = 12;
                break;
        }

        applyToGameOptions();

        try {
            ConfigManager.getInstance().update(cfg -> {
                cfg.performance.activeProfile = profile.name().toLowerCase();
                cfg.performanceProfile = profile.name();
                cfg.performance.renderDistance = this.viewDistance;
                cfg.performance.simulationDistance = this.simulationDistance;
                cfg.performance.clouds = this.clouds.toLowerCase();
                cfg.performance.particles = this.particles.toLowerCase();
                cfg.performance.entityShadows = this.entityShadows;
                cfg.modules.weather.precipitation = this.weatherPrecipitation;
            });
        } catch (Throwable ignored) {}
    }

    public void applyToGameOptions() {
        Minecraft mc = Minecraft.getInstance();
        if (mc == null || mc.options == null) return;

        try {
            if (this.viewDistance >= 2) {
                mc.options.renderDistance().set(this.viewDistance);
            }
            if (this.simulationDistance >= 2) {
                mc.options.simulationDistance().set(this.simulationDistance);
            }

            if ("OFF".equalsIgnoreCase(this.clouds)) {
                mc.options.cloudStatus().set(CloudStatus.OFF);
            } else if ("FAST".equalsIgnoreCase(this.clouds)) {
                mc.options.cloudStatus().set(CloudStatus.FAST);
            } else {
                mc.options.cloudStatus().set(CloudStatus.FANCY);
            }

            if ("MINIMAL".equalsIgnoreCase(this.particles)) {
                mc.options.particles().set(ParticleStatus.MINIMAL);
            } else if ("DECREASED".equalsIgnoreCase(this.particles)) {
                mc.options.particles().set(ParticleStatus.DECREASED);
            } else {
                mc.options.particles().set(ParticleStatus.ALL);
            }

            mc.options.entityShadows().set(this.entityShadows);
            mc.options.save();
        } catch (Throwable t) {
            // Log silently or fail-safe
        }
    }

    public void restoreVanillaSnapshot() {
        if (userSnapshot != null) {
            this.particles = userSnapshot.particles;
            this.clouds = userSnapshot.clouds;
            this.entityShadows = userSnapshot.entityShadows;
            this.weatherPrecipitation = userSnapshot.weatherPrecipitation;
            this.viewDistance = userSnapshot.viewDistance;
            this.simulationDistance = userSnapshot.simulationDistance;
            applyToGameOptions();

            try {
                ConfigManager.getInstance().update(cfg -> {
                    cfg.performance.activeProfile = "custom";
                    cfg.performanceProfile = "Custom";
                });
            } catch (Throwable ignored) {}
        }
    }

    public VanillaOptionsSnapshot getUserSnapshot() {
        return userSnapshot;
    }

    public void setUserSnapshot(VanillaOptionsSnapshot userSnapshot) {
        if (userSnapshot != null) {
            this.userSnapshot = userSnapshot;
        }
    }

    public String getParticles() {
        return particles;
    }

    public void setParticles(String particles) {
        this.particles = particles;
    }

    public String getClouds() {
        return clouds;
    }

    public void setClouds(String clouds) {
        this.clouds = clouds;
    }

    public boolean isEntityShadows() {
        return entityShadows;
    }

    public void setEntityShadows(boolean entityShadows) {
        this.entityShadows = entityShadows;
    }

    public boolean isWeatherPrecipitation() {
        return weatherPrecipitation;
    }

    public void setWeatherPrecipitation(boolean weatherPrecipitation) {
        this.weatherPrecipitation = weatherPrecipitation;
    }

    public int getViewDistance() {
        return viewDistance;
    }

    public void setViewDistance(int viewDistance) {
        this.viewDistance = Math.max(2, Math.min(32, viewDistance));
    }

    public int getSimulationDistance() {
        return simulationDistance;
    }

    public void setSimulationDistance(int simulationDistance) {
        this.simulationDistance = Math.max(2, Math.min(32, simulationDistance));
    }
}

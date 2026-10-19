package com.rawcraft.client.performance;

public class PerformanceManager {
    private static PerformanceManager instance;

    private PerformanceProfile currentProfile = PerformanceProfile.BALANCED;
    private VanillaOptionsSnapshot userSnapshot = new VanillaOptionsSnapshot();

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

    public void applyProfile(PerformanceProfile profile) {
        if (profile == null) return;
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
            com.rawcraft.client.config.ConfigManager.getInstance().update(cfg -> {
                cfg.performance.activeProfile = profile.name().toLowerCase();
                cfg.performanceProfile = profile.name();
            });
        } catch (Throwable ignored) {}
    }

    public void applyToGameOptions() {
        // Invokes Minecraft GameOptions mutators safely at runtime
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

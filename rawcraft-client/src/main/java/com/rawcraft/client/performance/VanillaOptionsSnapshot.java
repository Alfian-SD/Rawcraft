package com.rawcraft.client.performance;

public class VanillaOptionsSnapshot {
    public String particles = "ALL";
    public String clouds = "FANCY";
    public boolean entityShadows = true;
    public int biomeBlendRadius = 5;
    public int viewDistance = 12;
    public int simulationDistance = 12;
    public boolean weatherPrecipitation = true;

    public VanillaOptionsSnapshot() {}

    public VanillaOptionsSnapshot(String particles, String clouds, boolean entityShadows,
                                  int biomeBlendRadius, int viewDistance, int simulationDistance,
                                  boolean weatherPrecipitation) {
        this.particles = particles;
        this.clouds = clouds;
        this.entityShadows = entityShadows;
        this.biomeBlendRadius = biomeBlendRadius;
        this.viewDistance = viewDistance;
        this.simulationDistance = simulationDistance;
        this.weatherPrecipitation = weatherPrecipitation;
    }
}

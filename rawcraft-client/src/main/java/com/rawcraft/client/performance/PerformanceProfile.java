package com.rawcraft.client.performance;

public enum PerformanceProfile {
    LOW("Low", "Maximum FPS on lower-end machines; disables clouds and reduces distances."),
    BALANCED("Balanced", "Recommended balance of smooth framerate and visual clarity."),
    QUALITY("Quality", "Full visual fidelity with fancy clouds, entity shadows, and high draw distances.");

    private final String label;
    private final String description;

    PerformanceProfile(String label, String description) {
        this.label = label;
        this.description = description;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public static PerformanceProfile fromString(String val) {
        if (val == null) return BALANCED;
        for (PerformanceProfile p : values()) {
            if (p.name().equalsIgnoreCase(val) || p.label.equalsIgnoreCase(val)) {
                return p;
            }
        }
        return BALANCED;
    }
}

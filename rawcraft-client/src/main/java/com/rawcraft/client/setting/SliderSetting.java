package com.rawcraft.client.setting;

import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;

/** Numeric setting with a display range. Value is clamped on both set and load. */
public class SliderSetting extends Setting<Double> {
    private final double min;
    private final double max;
    private final double step;
    private final String suffix;

    public SliderSetting(String id, String label, double defaultValue, double min, double max, double step) {
        this(id, label, defaultValue, min, max, step, "");
    }

    public SliderSetting(String id, String label, double defaultValue, double min, double max, double step,
                         String suffix) {
        super(id, label, clamp(defaultValue, min, max));
        this.min = min;
        this.max = max;
        this.step = step <= 0 ? 0.01 : step;
        this.suffix = suffix;
    }

    public double min() {
        return min;
    }

    public double max() {
        return max;
    }

    public double step() {
        return step;
    }

    public String suffix() {
        return suffix;
    }

    public int asInt() {
        return (int) Math.round(get());
    }

    public float asFloat() {
        return get().floatValue();
    }

    /** Fraction of the way across the track, for the settings screen. */
    public double fraction() {
        return max - min == 0 ? 0 : (get() - min) / (max - min);
    }

    public void setFraction(double f) {
        double raw = min + (max - min) * Math.max(0, Math.min(1, f));
        set(Math.round(raw / step) * step);
    }

    @Override
    public void set(Double newValue) {
        super.set(clamp(newValue, min, max));
    }

    private static double clamp(double v, double lo, double hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    @Override
    public JsonElement toJson() {
        return new JsonPrimitive(get());
    }

    @Override
    public void fromJson(JsonElement json) {
        if (json != null && json.isJsonPrimitive()) {
            set(json.getAsDouble());
        }
    }
}

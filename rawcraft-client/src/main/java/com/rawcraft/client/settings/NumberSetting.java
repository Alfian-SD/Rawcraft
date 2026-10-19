package com.rawcraft.client.settings;

public class NumberSetting extends Setting<Double> {
    private final double min;
    private final double max;
    private final double step;

    public NumberSetting(String id, String label, String description, double defaultValue, double min, double max, double step) {
        super(id, label, description, defaultValue);
        this.min = min;
        this.max = max;
        this.step = step;
        setValue(clamp(defaultValue));
    }

    public double getMin() {
        return min;
    }

    public double getMax() {
        return max;
    }

    public double getStep() {
        return step;
    }

    public int getIntValue() {
        return (int) Math.round(getValue());
    }

    private double clamp(double val) {
        if (val < min) return min;
        if (val > max) return max;
        return val;
    }

    @Override
    public void setValue(Double value) {
        if (value == null) return;
        super.setValue(clamp(value));
    }
}

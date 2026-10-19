package com.rawcraft.client.settings;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public abstract class Setting<T> {
    private final String id;
    private final String label;
    private final String description;
    private final T defaultValue;
    private T value;
    private final List<Consumer<T>> changeListeners = new ArrayList<>();

    public Setting(String id, String label, String description, T defaultValue) {
        this.id = id;
        this.label = label;
        this.description = description;
        this.defaultValue = defaultValue;
        this.value = defaultValue;
    }

    public String getId() {
        return id;
    }

    public String getLabel() {
        return label;
    }

    public String getDescription() {
        return description;
    }

    public T getDefaultValue() {
        return defaultValue;
    }

    public T getValue() {
        return value;
    }

    public void setValue(T value) {
        if (validate(value)) {
            this.value = value;
            for (Consumer<T> listener : changeListeners) {
                listener.accept(value);
            }
        }
    }

    public void reset() {
        setValue(defaultValue);
    }

    public void addListener(Consumer<T> listener) {
        this.changeListeners.add(listener);
    }

    protected boolean validate(T newValue) {
        return newValue != null;
    }
}

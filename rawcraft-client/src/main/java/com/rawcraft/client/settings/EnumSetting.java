package com.rawcraft.client.settings;

import java.util.Arrays;
import java.util.List;

public class EnumSetting extends Setting<String> {
    private final List<String> choices;

    public EnumSetting(String id, String label, String description, String defaultValue, List<String> choices) {
        super(id, label, description, defaultValue);
        this.choices = choices;
    }

    public EnumSetting(String id, String label, String description, String defaultValue, String... choices) {
        this(id, label, description, defaultValue, Arrays.asList(choices));
    }

    public List<String> getChoices() {
        return choices;
    }

    public void cycle() {
        int idx = choices.indexOf(getValue());
        if (idx == -1) {
            setValue(choices.isEmpty() ? getDefaultValue() : choices.get(0));
            return;
        }
        int next = (idx + 1) % choices.size();
        setValue(choices.get(next));
    }

    @Override
    protected boolean validate(String newValue) {
        return newValue != null && choices.contains(newValue);
    }
}

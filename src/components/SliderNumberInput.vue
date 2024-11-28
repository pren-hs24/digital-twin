<script setup lang="ts">
    defineProps({
        modelValue: {
            type: Number,
            required: true,
        },
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        },
        step: {
            type: Number,
            required: true,
        },
        label: {
            type: String,
            required: true,
        },
    });

    const emit = defineEmits(["update:modelValue"]);
    const onChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = parseFloat(target.value);
        emit("update:modelValue", value);
    };
</script>
<template>
    <div class="slider-number-input">
        <label>{{ label }}</label>
        <div>
            <input
                type="range"
                :value="modelValue"
                :min="min"
                :max="max"
                :step="step"
                @input="onChange"
            />
            <input
                type="number"
                :value="modelValue"
                :min="min"
                :max="max"
                @input="onChange"
            />
        </div>
    </div>
</template>

<style scoped>
    .slider-number-input {
        display: flex;
        flex-direction: column;
        gap: 0.5em;

        & div {
            display: grid;
            grid-template-columns: 1fr min-content;
            gap: 1em;
        }
    }

    input[type="range"] {
        width: 100%;
        padding: 1em 0;
    }
</style>

<script setup lang="ts">
import type { EdgeDefinition } from "@/logic/konva/graph";
import { useNavigatorStore } from "@/stores/navigator";
import { ref, watch, type PropType } from "vue";

const navigator = useNavigatorStore();
const weight = ref(0);
const obstructed = ref(false);
const disabled = ref(false);

const props = defineProps({
    edges: {
        type: Array as PropType<EdgeDefinition[]>,
        required: true,
    },
});

const emit = defineEmits(["update"]);

// if edges changes from empty to not empty, set the default values
watch(
    () => props.edges,
    (edges) => {
        if (!edges.length) {
            return;
        }

        const def = navigator.network.getEdge(
            edges[0].nodeA,
            edges[0].nodeB,
        );

        weight.value = def.weight;
        obstructed.value = def.obstructed;
        disabled.value = def.disabled;
    },
);

function applyChanges() {
    props.edges.forEach((edge) => {
        navigator.network.updateEdge(
            edge.nodeA,
            edge.nodeB,
            weight.value,
            obstructed.value,
            disabled.value,
        );
    });

    emit("update", {
        edges: props.edges,
        options: {
            weight: weight.value,
            obstructed: obstructed.value,
            disabled: disabled.value,
        },
    });
}
</script>

<template>
    <div class="heading">
        <span class="material-symbols-rounded">edit</span>
        <h4>Path Editor</h4>
    </div>
    <div class="path-editor" v-if="edges.length">
        <div class="group">
            <label>
                <input type="checkbox" v-model="disabled" />
                Disabled
            </label>
        </div>
        <div class="group">
            <label>
                <input type="checkbox" v-model="obstructed" />
                Obstructed
            </label>
        </div>
        <div class="group">
            <label for="weight">Weight:</label>
            <input type="number" v-model="weight" />
        </div>
        <button :disabled="edges.length === 0" class="primary" id="apply-to-edge" @click="applyChanges">
            Apply Changes
        </button>
    </div>
    <p class="muted" v-else>
        Click on an edge to edit it
    </p>
</template>

<style scoped>
.path-editor {
    width: 100%;
    margin-top: 1em;

    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 100%;

    .group {
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: center;
        gap: 1em;
    }
}

.fact {
    display: flex;
    gap: 1ch;
}

.additional {
    border-top: 1px solid var(--border);
    margin-top: 1em;
    padding-top: 1em;
}
</style>

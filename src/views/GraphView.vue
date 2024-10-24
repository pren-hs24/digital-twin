<script setup lang="ts">
import { onMounted, ref, watch } from "vue"
import { getStage } from "../logic/konva";
import { Graph } from "../logic/konva/graph";
import { createGraph } from "../logic/pren/graph";
import Konva from "konva";
import { useNavigatorStore } from "@/stores/navigator";

const konvaContainer = ref<HTMLDivElement>();
const stage = ref<Konva.Stage>();
const graph = ref<Graph>();
const navigator = useNavigatorStore();

onMounted(() => {
    stage.value = getStage(konvaContainer.value!);
    graph.value = createGraph(stage.value);

    graph.value.onToggleNode = (node) => {
        navigator.network.toggleNode(node.name);
    };
})

watch(() => navigator.path, () => {
    graph.value!.markRoute(navigator.path);
})
</script>

<template>
    <div class=card>
        <div ref="konvaContainer" id="konva-container"></div>
        <div class="route">
            <p>
                <span class="accent">{{ navigator.estimatedDuration.seconds }}</span>s
            </p>
            <p>
                <span class="accent">{{ navigator.obstaclesInPath }}</span> obstacles
            </p>
        </div>
    </div>
</template>

<style scoped>
.card {
    width: calc(100% - 2em);
    height: 100%;
    padding: 1em;
}

#konva-container {
    height: 20vw;
    aspect-ratio: 1 / 1;
}
</style>

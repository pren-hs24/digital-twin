<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { getStage } from "../logic/konva";
import { Graph, type EdgeDefinition } from "../logic/konva/graph";
import { createGraph } from "../logic/pren/graph";
import Konva from "konva";
import { useNavigatorStore } from "@/stores/navigator";
import PathInfo from "@/components/PathInfo.vue";
import PathEditor from "@/components/PathEditor.vue";
import { type IDriveListener, type IDriveSensor } from "@/logic/engine";
import { prepareDrive } from "@/logic/konva/car";
import LogView from "@/components/LogView.vue";
import SequenceView from "@/components/SequenceView.vue";

const konvaContainer = ref<HTMLDivElement>();
const stage = ref<Konva.Stage>();
const graph = ref<Graph>();
const navigator = useNavigatorStore();
const selectedEdges = ref<EdgeDefinition[]>([]);

let sensor: IDriveSensor | null = null;
let listener: IDriveListener | null = null;

onMounted(() => {
    stage.value = getStage(konvaContainer.value!);
    graph.value = createGraph(stage.value);

    graph.value.onToggleNode = (node) => {
        navigator.network.toggleNode(node.name);
    };

    graph.value.onSelectEdge = (edge, selected) => {
        if (selected) {
            selectedEdges.value = [...selectedEdges.value, edge];
        } else {
            selectedEdges.value = selectedEdges.value.filter((other) =>
                [edge.nodeA, edge.nodeB].some(
                    (n) => ![other.nodeA, other.nodeB].includes(n),
                ),
            );
            graph.value!.markRoute(navigator.path);
        }
    };

    graph.value!.markRoute(navigator.path);

    const { sensor: carSensor, listener: carDriver } = prepareDrive(
        graph.value,
    );
    sensor = carSensor;
    listener = carDriver;

    navigator.sensors.addSensor(sensor);
    navigator.actors.addListener(listener);
});

onUnmounted(() => {
    if (sensor) {
        navigator.sensors.removeSensor(sensor);
    }
    if (listener) {
        navigator.actors.removeListener(listener);
    }
});

const updateGraphEdges = (event: { edges: EdgeDefinition[] }) => {
    event.edges.forEach((edge) => {
        graph.value!.updateEdge(edge);
    });
    selectedEdges.value = [];
};

watch(
    () => navigator.path,
    () => {
        graph.value!.markRoute(navigator.path);
    },
);
</script>

<template>
    <div class="main">
        <div class="card graph">
            <div ref="konvaContainer" id="konva-container"></div>
            <aside>
                <div class="card">
                    <PathInfo />
                </div>
                <div class="card">
                    <PathEditor :edges="selectedEdges" @update="updateGraphEdges" />
                </div>
            </aside>
        </div>
        <div class="card">
            <LogView />
        </div>
        <div class="card">
            <SequenceView />
        </div>
    </div>
</template>

<style scoped>
.main {
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.card {
    width: calc(100% - 2em);
    height: 100%;
    padding: 1em;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;

    &.graph {
        gap: 2em;
    }
}

#konva-container {
    height: 30vw;

    max-width: 50vw;
    max-height: 50vw;

    aspect-ratio: 1 / 1;
}

aside {
    flex: 1;
}
</style>

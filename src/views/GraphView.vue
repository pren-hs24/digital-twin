<script setup lang="ts">
    import { onMounted, ref, watch } from "vue";
    import { getStage } from "../logic/konva";
    import { Graph, type EdgeDefinition } from "../logic/konva/graph";
    import { createGraph } from "../logic/pren/graph";
    import Konva from "konva";
    import { useNavigatorStore } from "@/stores/navigator";
    import PathInfo from "@/components/PathInfo.vue";
    import PathEditor from "@/components/PathEditor.vue";

    const konvaContainer = ref<HTMLDivElement>();
    const stage = ref<Konva.Stage>();
    const graph = ref<Graph>();
    const navigator = useNavigatorStore();
    const selectedEdges = ref<EdgeDefinition[]>([]);

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
                selectedEdges.value = selectedEdges.value.filter(
                    (e) => e.nodeA !== edge.nodeA || e.nodeB !== edge.nodeB,
                );
                graph.value!.markRoute(navigator.path);
            }
        };

        graph.value!.markRoute(navigator.path);
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
    <div class="card">
        <div
            ref="konvaContainer"
            id="konva-container"
        ></div>
        <aside>
            <div class="card">
                <PathInfo />
            </div>
            <div class="card">
                <PathEditor
                    :edges="selectedEdges"
                    @update="updateGraphEdges"
                />
            </div>
        </aside>
    </div>
</template>

<style scoped>
    .card {
        width: calc(100% - 2em);
        height: 100%;
        padding: 1em;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 2em;
    }

    #konva-container {
        height: 20vw;
        aspect-ratio: 1 / 1;
    }

    aside {
        flex: 1;
    }
</style>

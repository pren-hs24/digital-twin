import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { weightedGraph } from "@/logic/pren/graph";
import { dijkstraWithWeightedNodes } from "@/logic/pathfinding";
import { SPEED_M_PER_S } from "@/logic/pren/constants";

export const useNavigatorStore = defineStore("navigator", () => {
    const path = ref<string[]>([]);
    const network = computed(() => weightedGraph);

    const navigatePath = (route: string[]) => {
        path.value = route;
    };

    const goTo = (target: string) => {
        if (target === "START") {
            navigatePath([]);
            return;
        }

        const path = dijkstraWithWeightedNodes({
            graph: weightedGraph,
            from: "START",
            to: target,
        });

        navigatePath(path);
    };

    const obstaclesInPath = computed(() => {
        return weightedGraph.obstaclesInPath(path.value);
    });

    const estimatedDuration = computed(() => {
        const distance = weightedGraph.pathDistance(path.value);
        const time = Math.round((100 * distance) / SPEED_M_PER_S) / 100;
        return {
            seconds: time,
        };
    });

    const estimatedDistance = computed(() => {
        return weightedGraph.pathPhysicalDistance(path.value);
    });

    return {
        path,
        network,
        goTo,
        obstaclesInPath,
        estimatedDuration,
        estimatedDistance,
    };
});

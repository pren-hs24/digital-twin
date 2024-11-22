import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { weightedGraph } from "@/logic/pren/graph";
import { dijkstraWithWeightedNodes } from "@/logic/pathfinding";
import { SPEED_M_PER_S } from "@/logic/pren/constants";
import { ListenerManager, SensorManager, drive } from "@/logic/engine";

export const useNavigatorStore = defineStore("navigator", () => {
    const locked = ref(false);
    const path = ref<string[]>([]);
    const network = computed(() => weightedGraph);
    const actors = new ListenerManager([]);
    const sensors = new SensorManager([]);

    actors.addListener({
        navigateToPoint: () => {},
        takeExit: () => {},
        arriveAtDestination: () => {
            locked.value = false;
        },
    });

    const navigatePath = (route: string[]) => {
        path.value = route;
        locked.value = true;

        drive({
            path: path.value,
            sensors: sensors,
            actors: actors,
        });
    };

    const goTo = (target: string) => {
        if (locked.value) {
            throw new Error("Car is already moving!");
        }

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

    const randomiseGraph = () => {
        weightedGraph.randomise();
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
        randomiseGraph,
        obstaclesInPath,
        estimatedDuration,
        estimatedDistance,
        sensors: computed(() => sensors),
        actors: computed(() => actors),
        locked,
    };
});

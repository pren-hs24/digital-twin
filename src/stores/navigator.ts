import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { weightedGraph } from "@/logic/pren/graph";
import { SPEED_M_PER_S } from "@/logic/pren/constants";
import { ListenerManager, SensorManager, drive } from "@/logic/engine";
import { Pathfinder } from "@/logic/pathfinding";

export const useNavigatorStore = defineStore("navigator", () => {
    const locked = ref(false);
    const mode = ref<"oversight" | "roadsense">("oversight");
    const path = ref<string[]>([]);
    const network = computed(() => weightedGraph);
    const pathfinder = new Pathfinder();
    const actors = new ListenerManager([]);
    const sensors = new SensorManager([]);

    actors.addListener({
        navigateToPoint: () => {},
        takeExit: () => {},
        arriveAtDestination: () => {
            locked.value = false;
        },
    });
    actors.addListener(pathfinder);
    sensors.addSensor(pathfinder.sensor);

    const navigatePath = (target: string) => {
        locked.value = true;

        if (mode.value === "oversight") {
            drive.oversight({
                target,
                sensors,
                actors,
            });
        } else {
            drive.roadsense({
                target,
                sensors,
                actors,
            });
        }
    };

    const goTo = (target: string) => {
        if (locked.value) {
            throw new Error("Car is already moving!");
        }

        if (target === "START") {
            navigatePath(target);
            return;
        }
        navigatePath(target);
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
        mode,
    };
});

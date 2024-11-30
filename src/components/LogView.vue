<script setup lang="ts">
import type { IDriveListener } from "@/logic/engine";
import { useNavigatorStore } from "@/stores/navigator";
import { computed, onMounted, onUnmounted, ref } from "vue";

type LogLevel = "debug" | "info" | "error" | "warning";

interface ILog {
    message: string;
    timestamp: Date;
    level: LogLevel;
}

class DriveLogger implements IDriveListener {
    private _logs = ref<ILog[]>([]);
    public logs = computed(() => this._logs.value);

    private log(message: string, level: LogLevel = "debug") {
        this._logs.value.push({
            message,
            level,
            timestamp: new Date(),
        });
    }
    clear() {
        this._logs.value = [];
    }
    async navigateToPoint(point: string) {
        this.log(`Navigating to ${point}`, "info");
    }
    async navigatedToPoint() {
        this.log(`Navigated to point`);
    }
    async takeExit(from: string | null, on: string, to: string) {
        if (from === null) {
            this.log(`Taking exit on ${on} to ${to}`, "info");
        } else {
            this.log(`Taking exit from ${from} on ${on} to ${to}`, "info");
        }
    }
    async exitTaken() {
        this.log(`Exit taken`);
    }
    async selectTarget(target: string) {
        this.log(`Selecting target ${target}`, "info");
    }
    async start() {
        this.clear();
        this.log(`Starting`);
    }
    async emergencyStop() {
        this.log(`Emergency stop`, "warning");
    }
    async scanGraph() {
        this.log(`Scanning graph`);
    }
    async findPath() {
        this.log(`Finding path`);
    }
    async foundPath(path: string[]) {
        this.log(`Found path ${path.join(" -> ")}`);
    }
    async arriveAtDestination() {
        this.log(`Arrived at destination`, "info");
    }
    async closeToObstacle() {
        this.log("Close to obstacle", "warning");
    }
    async obstacleCleared() {
        this.log("Obstacle cleared", "debug");
    }
    async nextNodeBlocked(node: string) {
        this.log(`Next node (${node}) blocked`, "warning");
    }
    async nextEdgeBlocked(from: string, to: string) {
        this.log(`Next edge (${from} -> ${to}) blocked`, "warning");
    }
}

const logger = new DriveLogger();
const navigator = useNavigatorStore();

onMounted(() => {
    navigator.actors.addListener(logger);
});

onUnmounted(() => {
    navigator.actors.removeListener(logger);
});
</script>

<template>
    <div class="heading">
        <span class="material-symbols-rounded">article</span>
        <h4>Logs</h4>
    </div>
    <div class="logs">
        <div v-for="log in logger.logs.value" :key="log.timestamp.getTime()" class="log">
            <span class="timestamp">
                {{ log.timestamp.toISOString() }}
            </span>
            <span class="level" :class="log.level">
                {{ log.level.toUpperCase() }}
            </span>
            <strong class="message">{{ log.message }}</strong>
        </div>
    </div>
</template>

<style scoped>
.card {
    padding: 1em;
    gap: 1em;
}

.level {
    &.info {
        color: var(--accent);
    }

    &.warning {
        color: var(--yellow);
        font-weight: 900;
    }

    &.error {
        color: var(--red);
        font-weight: 900;
    }
}

.log {
    font-family: "Courier New", Courier, monospace;
    display: grid;
    grid-template-columns: 24ch 7ch 1fr;
    gap: 2ch;
}
</style>

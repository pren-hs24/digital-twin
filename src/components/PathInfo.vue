<script setup lang="ts">
import { useNavigatorStore } from "@/stores/navigator";
import { ref } from "vue";

const navigator = useNavigatorStore();

const routeInfoExpanded = ref(false);
</script>

<template>
    <div class="heading">
        <span class="material-symbols-rounded">insights</span>
        <h4>Insights</h4>
    </div>
    <div class="path-info" v-if="navigator.path.length">
        <div class="route-infos">
            <div>
                <span class="standout">{{
                    navigator.estimatedDuration.seconds
                    }}</span>
                <span class="muted">sec</span>
            </div>
            <div>
                <span class="standout">{{ navigator.estimatedDistance }}</span>
                <span class="muted">m</span>
            </div>
            <div>
                <span class="standout">{{ navigator.obstaclesInPath }}</span>
                <span class="muted">obstacles</span>
            </div>
            <span @click="routeInfoExpanded = !routeInfoExpanded" class="material-symbols-rounded clickable muted">
                {{ routeInfoExpanded ? "expand_less" : "expand_more" }}
            </span>
        </div>
        <div v-if="routeInfoExpanded" class="additional">
            <div class="fact">
                <span class="muted">Start:</span>
                <span>{{ navigator.fullPath[0] }}</span>
            </div>
            <div class="fact">
                <span class="muted">End:</span>
                <span>{{ navigator.fullPath[navigator.path.length - 1] }}</span>
            </div>
            <div class="fact">
                <span class="muted">Path:</span>
                <span>{{ navigator.fullPath.join(" -> ") }}</span>
            </div>
        </div>
    </div>
    <p class="muted" v-else>
        No path selected
    </p>
</template>

<style scoped>
.path-info {
    width: 100%;
}

.route-infos {
    display: flex;
    align-items: center;
    gap: 2em;
    width: 100%;

    >div {
        display: flex;
        flex-direction: column;
    }

    .clickable {
        margin-left: auto;
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

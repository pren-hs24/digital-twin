<script setup lang="ts">
import { SequenceDiagram } from "@/logic/pren/sequenceDiagram";
import { useNavigatorStore } from "@/stores/navigator";
import mermaid from "mermaid";
import { onMounted, onUnmounted, ref } from "vue";

const mermaidElement = ref<HTMLDivElement>();
const logger = new SequenceDiagram();
const navigator = useNavigatorStore();

logger.onSync = (source) => {
    mermaidElement.value!.innerHTML = "";
    mermaidElement.value!.innerHTML = source;
    mermaidElement.value!.removeAttribute("data-processed");
    mermaid.run().catch(() => { });
};

onMounted(() => {
    const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "default";

    navigator.actors.addListener(logger);
    mermaid.initialize({ startOnLoad: false, theme });
});

onUnmounted(() => {
    navigator.actors.removeListener(logger);
});
</script>

<template>
    <div class="heading">
        <span class="material-symbols-rounded">compare_arrows</span>
        <h4>Sequence Diagram</h4>
    </div>
    <div class="logs">
        <div class="mermaid" ref="mermaidElement"></div>
    </div>
</template>

<style scoped>
.card {
    padding: 1em;
    gap: 1em;
    width: 100%;
}

.mermaid {
    min-width: 50vw;
}
</style>

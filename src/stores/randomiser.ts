import { ref } from "vue";
import { defineStore } from "pinia";

export const useRandomiserStore = defineStore("randomiser", () => {
    const pNodeDisabled = ref(0.2);
    const pEdgeDisabled = ref(0.2);
    const pObstacle = ref(0.2);

    return {
        pNodeDisabled,
        pEdgeDisabled,
        pObstacle,
    };
});

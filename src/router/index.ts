import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "graph",
            component: () => import("../views/GraphView.vue"),
        },
        {
            path: "/sequence",
            name: "sequence",
            component: () => import("../views/SequenceView.vue"),
        },
    ],
});

export default router;

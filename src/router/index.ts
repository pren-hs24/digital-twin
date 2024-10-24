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
            path: "/log",
            name: "log",
            component: () => import("../views/LogView.vue"),
        },
        {
            path: "/sequence",
            name: "sequence",
            component: () => import("../views/SequenceView.vue"),
        },
    ],
});

export default router;

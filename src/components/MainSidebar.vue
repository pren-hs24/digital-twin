<script setup lang="ts">
import { useNavigatorStore } from "@/stores/navigator";
import Logo from "@/assets/logo.svg"

const navigator = useNavigatorStore();
</script>
<template>
    <div class="navigator">
        <input v-if=false type="text" placeholder="Search..." class="search" />

        <div class="title">
            <img :src="Logo">
            <h2>Digital Twin</h2>
        </div>


        <div class="item">
            <span class="heading"> Choose destination</span>
            <div class="favs">
                <div v-for="target in ['A', 'B', 'C']" :key="target"
                    @click="navigator.locked ? null : navigator.goTo(target)" class="fav" :disabled="navigator.locked">
                    <span class="icon material-symbols-rounded">location_on</span>
                    <span>{{ target }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
div.navigator {
    position: sticky;
    top: 0;

    /* no idea why it needs to be 4.1, instead of 4 */
    height: calc(100svh - 4.1em);

    padding: 1em;
    background: var(--bg);
    border: 1px solid var(--border);
    width: 220px;
    border-radius: 0.5em;
    overflow: clip;
    display: flex;
    flex-direction: column;
    gap: 1em;
}

.item {
    display: flex;
    flex-direction: column;
    gap: 1em;

    .heading {
        font-size: 1rem;
        font-weight: 900;
        color: var(--text-muted);
    }
}

.title {
    display: grid;
    align-items: center;
    grid-template-columns: 50px 1fr;
    gap: 1em;
    margin-bottom: 1em;
    padding-bottom: 1em;
    border-bottom: 1px solid var(--border);

    & h2 {
        margin: 0;
    }
}

input.search {
    width: calc(100% - 2.4em);
}

div.favs {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-around;

    .fav {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .icon {
            background: var(--accent);
            color: var(--white);
            border: 1px solid var(--border);
            border-radius: 1000vmax;
            padding: 0.25em;
            width: 1.5em;
            height: 1.5em;
            font-size: 1.5rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;

            &:hover {
                background: var(--accent-dk);
                cursor: pointer;
            }
        }

        &[disabled="true"] {
            cursor: not-allowed;

            .icon {
                background: var(--border);
                cursor: not-allowed;
            }
        }
    }
}

@media screen and (max-width: 750px) {
    div.navigator {
        position: relative;
        height: calc(100% - 2em);
        width: calc(100svw - 4em);
    }
}
</style>

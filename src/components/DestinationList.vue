<script setup lang="ts">
import { useNavigatorStore } from '@/stores/navigator';

const navigator = useNavigatorStore();
</script>
<template>
    <div class="navigator">
        <input type="text" placeholder="Search..." class="search">
        </input>

        <div class=favs>
            <div v-for="target in ['A', 'B', 'C']" @click="navigator.goTo(target)" class="fav">
                {{ target }}
            </div>
        </div>
    </div>
</template>
<style scoped>
div.navigator {
    position: sticky;
    top: 0;
    padding: 1em;
    background: var(--bg);
    border: 1px solid var(--border);
    height: 100%;
    width: 220px;
    border-radius: 0.5em;
    overflow: clip;
    display: flex;
    flex-direction: column;
    gap: 1em;
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
        background: var(--accent);
        color: var(--white);
        border: 1px solid var(--border);
        border-radius: 1000vmax;
        padding: 0.5em;
        width: 2em;
        height: 2em;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1.2rem;

        &:hover {
            background: var(--accent-dk);
            cursor: pointer;
        }
    }
}
</style>

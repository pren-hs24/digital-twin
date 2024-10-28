<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from "./components/MainSidebar.vue";
</script>

<template>
  <div class="body">
    <Sidebar />
    <div class=content>
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.body {
  position: relative;
  padding: 0;

  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: start;
  gap: 1em;

  max-height: 100vh;
  max-width: 100vw;
  max-height: 100svh;
  max-width: 100svw;
  overflow: hidden;
}

.content {
  overflow-x: clip;
  overflow-y: auto;
  padding: 1em 1em 1em 0;
  width: calc(100% - 1em);
  height: calc(100% - 2em);
}

@media screen and (max-width: 750px) {
  .body {
    grid-template-columns: 1fr;
  }
}
</style>

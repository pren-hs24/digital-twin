<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from "./components/MainSidebar.vue";
</script>

<template>
  <div class="body">
    <Sidebar />
    <RouterView />
  </div>
</template>

<style scoped>
.body {
  position: relative;
  padding: 1em;

  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: start;
  gap: 1em;
  max-height: calc(100svh - 2em);
  overflow: auto;
}

@media screen and (max-width: 750px) {
  .body {
    grid-template-columns: 1fr;
  }
}
</style>

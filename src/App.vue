<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
import DestinationList from "./components/DestinationList.vue";
</script>

<template>
  <header>
    <AppNavigation />
  </header>
  <div class="body">
    <DestinationList />
    <RouterView />
  </div>
</template>

<style scoped>
.body {
  position: relative;
  margin: 1em;
  margin-top: 0;

  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 1em;
}
</style>

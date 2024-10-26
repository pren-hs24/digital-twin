<template>
    <nav>
        <RouterLink to="/">Graph View</RouterLink>
    </nav>
</template>
<style scoped>
nav {
    line-height: 1.5;
    position: sticky;
    top: 0;
    left: 0;
    margin: 1em;
    margin-bottom: 0;
    padding: 1em;
    background: var(--bg);
    border: 1px solid var(--border);
    width: calc(100% - 4em);
    border-radius: 0.5em;

    display: flex;
    gap: 2em;
    justify-content: center;
}
</style>

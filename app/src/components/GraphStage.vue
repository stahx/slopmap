<template>
  <div class="graph-stage" aria-hidden="true"></div>
</template>

<style scoped>
.graph-stage {
  position: fixed;
  top: var(--header-h);
  right: var(--inspector-w);
  bottom: 0;
  left: var(--rail-w);
  z-index: 1;
}
</style>

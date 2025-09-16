<template>
  <div class="repository-detail-view">
    <h1>Repository Detail</h1>
    <p>Repository details for {{ $route.params.owner }}/{{ $route.params.name }}</p>
  </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.repository-detail-view {
  padding: 20px;
}
</style>
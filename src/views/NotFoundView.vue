<template>
  <div class="not-found">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <a-button type="primary" @click="$router.push('/')">
      Back to Home
    </a-button>
  </div>
</template>

<script lang="ts" setup>
// Ant Design Vue组件已全局注册，无需手动导入
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #666;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #999;
}
</style>
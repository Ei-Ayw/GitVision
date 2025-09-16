<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 品牌展示区域 -->
      <div class="brand-section">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="8" fill="#4F46E5"/>
            <path d="M24 12L32 20L24 28L16 20L24 12Z" fill="white"/>
            <path d="M24 28L32 36L16 36L24 28Z" fill="white"/>
          </svg>
          <h1>RepoInsight</h1>
        </div>
        <p class="subtitle">GitHub 仓库智能分析平台</p>
      </div>

      <!-- 操作区域 -->
      <div class="action-section">
        <a-button
          class="github-login-btn"
          type="primary"
          size="large"
          :loading="isLoading"
          @click="handleGitHubLogin"
          block
        >
          <template #icon>
            <github-outlined />
          </template>
          通过 GitHub 账号授权登录
        </a-button>
        
        <p class="permission-hint">
          仅获取 repo:read / user:email 权限，保障账号安全
        </p>
      </div>

      <!-- 错误提示 -->
      <a-alert
        v-if="errorMessage"
        type="error"
        :message="errorMessage"
        closable
        @close="errorMessage = ''"
        class="error-alert"
      />
    </div>

    <!-- 加载状态 -->
    <a-modal
      :visible="isLoading"
      :footer="null"
      :closable="false"
      centered
    >
      <div class="loading-content">
        <a-spin size="large" />
        <p>正在跳转至 GitHub 授权...</p>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { GithubOutlined } from '@ant-design/icons-vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const errorMessage = ref('')

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || `${window.location.origin}/login`

const handleGitHubLogin = () => {
  isLoading.value = true
  
  // GitHub OAuth 授权URL
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=repo:read,user:email`
  
  // 跳转到GitHub授权页面
  window.location.href = authUrl
}

// 处理GitHub回调
const handleGitHubCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  const refreshToken = urlParams.get('refresh')
  const userParam = urlParams.get('user')
  const error = urlParams.get('error')
  
  if (error) {
    errorMessage.value = `授权失败: ${decodeURIComponent(error)}`
    isLoading.value = false
    return
  }
  
  if (token && refreshToken && userParam) {
    try {
      isLoading.value = true
      
      // 解析用户信息
      const user = JSON.parse(decodeURIComponent(userParam))
      
      // 保存token和用户信息到localStorage
      localStorage.setItem('access_token', token)
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token_expiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString())
      
      // 更新auth store状态
      authStore.isAuthenticated = true
      authStore.user = user
      
      // 跳转到仪表盘
      await router.push('/dashboard')
      
    } catch (err) {
      console.error('Login callback error:', err)
      errorMessage.value = '登录过程中发生错误，请稍后重试'
    } finally {
      isLoading.value = false
      // 清除URL中的参数
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }
}

onMounted(() => {
  // 检查是否已经登录
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
    return
  }
  
  // 检查URL中是否有GitHub回调的参数
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('code') || urlParams.has('token') || urlParams.has('error')) {
    handleGitHubCallback()
  }
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.brand-section {
  text-align: center;
  margin-bottom: 32px;
  
  .logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 16px;
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: $text-primary;
      margin: 0;
    }
  }
  
  .subtitle {
    font-size: 16px;
    color: $text-secondary;
    margin: 0;
    line-height: 1.5;
  }
}

.action-section {
  .github-login-btn {
    height: 44px;
    font-size: 16px;
    font-weight: 500;
    border-radius: $border-radius;
    
    :deep(.ant-btn-loading-icon) {
      display: flex;
      align-items: center;
    }
  }
  
  .permission-hint {
    font-size: 12px;
    color: $text-secondary;
    text-align: center;
    margin: 12px 0 0;
    line-height: 1.4;
  }
}

.error-alert {
  margin-top: 16px;
  border-radius: $border-radius;
}

.loading-content {
  text-align: center;
  padding: 20px;
  
  p {
    margin-top: 16px;
    color: $text-secondary;
    font-size: 14px;
  }
}

// 响应式适配
@media (max-width: $screen-sm) {
  .login-card {
    padding: 32px 24px;
    margin: 0 16px;
  }
  
  .brand-section .logo h1 {
    font-size: 20px;
  }
  
  .subtitle {
    font-size: 14px;
  }
}
</style>
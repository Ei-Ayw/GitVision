import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginWithGitHub, logout as apiLogout, refreshToken } from '@/utils/api'

interface User {
  id: number
  username: string
  email: string
  avatarUrl: string
}

interface GitHubAccount {
  id: number
  username: string
  avatarUrl: string
  accessToken: string
  refreshToken: string
  createdAt: string
  lastUsedAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<User | null>(null)
  const currentAccount = ref<GitHubAccount | null>(null)
  const accounts = ref<GitHubAccount[]>([])
  const isLoading = ref(false)

  const initAuth = async () => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      isAuthenticated.value = true
      user.value = JSON.parse(userData)
      
      // 检查token是否即将过期
      const tokenExpiry = localStorage.getItem('token_expiry')
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry) - 300000) {
        await refreshAuthToken()
      }
    }
  }

  const login = async (code: string) => {
    isLoading.value = true
    try {
      const response = await loginWithGitHub(code)
      
      const { accessToken, refreshToken, user: userInfo, expiresIn } = response.data
      
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('user', JSON.stringify(userInfo))
      localStorage.setItem('token_expiry', (Date.now() + expiresIn * 1000).toString())
      
      isAuthenticated.value = true
      user.value = userInfo
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const refreshAuthToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) throw new Error('No refresh token')
      
      const response = await refreshToken(refreshToken)
      const { accessToken, expiresIn } = response.data
      
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('token_expiry', (Date.now() + expiresIn * 1000).toString())
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  const logout = async () => {
    try {
      if (currentAccount.value?.accessToken) {
        await apiLogout(currentAccount.value.accessToken)
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('token_expiry')
      
      isAuthenticated.value = false
      user.value = null
      currentAccount.value = null
      accounts.value = []
    }
  }

  const switchAccount = async (accountId: number) => {
    const account = accounts.value.find(acc => acc.id === accountId)
    if (account) {
      currentAccount.value = account
      // 这里可以触发仓库列表刷新等操作
    }
  }

  const addAccount = async (code: string) => {
    // 实现添加额外GitHub账号的逻辑
  }

  const removeAccount = async (accountId: number) => {
    // 实现移除GitHub账号的逻辑
  }

  return {
    isAuthenticated,
    user,
    currentAccount,
    accounts,
    isLoading,
    initAuth,
    login,
    logout,
    switchAccount,
    addAccount,
    removeAccount,
    refreshAuthToken
  }
})
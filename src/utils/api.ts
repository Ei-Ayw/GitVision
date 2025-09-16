import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })
          
          const { accessToken, expiresIn } = refreshResponse.data
          localStorage.setItem('access_token', accessToken)
          localStorage.setItem('token_expiry', (Date.now() + expiresIn * 1000).toString())
          
          // 重试原始请求
          error.config.headers.Authorization = `Bearer ${accessToken}`
          return axios(error.config)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          // 刷新失败，跳转到登录页
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

// GitHub OAuth认证
export const loginWithGitHub = (code: string) => {
  return api.post('/auth/github', { code })
}

export const refreshToken = (refreshToken: string) => {
  return api.post('/auth/refresh', { refreshToken })
}

export const logout = (accessToken: string) => {
  return api.post('/auth/logout', { accessToken })
}

// 仓库相关API
export const getRepositories = (params?: { page?: number; limit?: number; search?: string }) => {
  return api.get('/repositories', { params })
}

export const addRepository = (repoUrl: string) => {
  return api.post('/repositories', { url: repoUrl })
}

export const addRepositoriesBatch = (urls: string[]) => {
  return api.post('/repositories/batch', { urls })
}

export const getRepository = (owner: string, name: string) => {
  return api.get(`/repositories/${owner}/${name}`)
}

export const analyzeRepository = (owner: string, name: string) => {
  return api.post(`/repositories/${owner}/${name}/analyze`)
}

export const deleteRepository = (owner: string, name: string) => {
  return api.delete(`/repositories/${owner}/${name}`)
}

// 报告相关API
export const generateReport = (data: {
  repositoryId: number
  template: string
  modules: string[]
  title?: string
  dateRange?: string
  watermark?: boolean
}) => {
  return api.post('/reports/generate', data)
}

export const getReports = (params?: { page?: number; limit?: number; template?: string }) => {
  return api.get('/reports', { params })
}

export const getReport = (reportId: string) => {
  return api.get(`/reports/${reportId}`)
}

export const deleteReport = (reportId: string) => {
  return api.delete(`/reports/${reportId}`)
}

export const shareReport = (reportId: string, config: {
  password?: string
  expiresIn?: number
  type: 'link' | 'embed' | 'email'
}) => {
  return api.post(`/reports/${reportId}/share`, config)
}

export default api
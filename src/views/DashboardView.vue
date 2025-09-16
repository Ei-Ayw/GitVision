<template>
  <MainLayout>
    <div class="dashboard-container">
      <!-- 顶部操作区 -->
      <div class="dashboard-header">
        <h1>仪表盘</h1>
        <div class="header-actions">
          <a-button type="primary" @click="handleAddRepository">
            <template #icon>
              <plus-outlined />
            </template>
            添加仓库
          </a-button>
          <a-button @click="handleCreateReport">
            <template #icon>
              <file-text-outlined />
            </template>
            新建报告
          </a-button>
        </div>
      </div>

      <!-- 当前账号信息 -->
      <div class="current-account" v-if="currentAccount">
        <a-avatar :src="currentAccount.avatarUrl" size="small" />
        <span class="account-name">{{ currentAccount.username }}</span>
        <a-tag color="blue">当前账号</a-tag>
      </div>

      <!-- 数据概览卡片 -->
      <div class="stats-grid">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <github-outlined style="color: #0969DA;" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ repositoryStats.total || 0 }}</div>
              <div class="stat-label">总仓库数</div>
            </div>
          </div>
        </a-card>

        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <check-circle-outlined style="color: #1A7F37;" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ repositoryStats.analyzed || 0 }}</div>
              <div class="stat-label">已分析仓库</div>
            </div>
          </div>
        </a-card>

        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <file-text-outlined style="color: #9A6700;" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ reportStats.total || 0 }}</div>
              <div class="stat-label">生成报告</div>
            </div>
          </div>
        </a-card>

        <a-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <team-outlined style="color: #8250DF;" />
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ repositoryStats.contributors || 0 }}</div>
              <div class="stat-label">总贡献者</div>
            </div>
          </div>
        </a-card>
      </div>

      <!-- 主要内容区域 -->
      <div class="dashboard-content">
        <!-- 最近访问仓库 -->
        <a-card title="最近访问仓库" class="section-card">
          <template #extra>
            <a-button type="link" @click="gotoRepositories">查看全部</a-button>
          </template>
          
          <div class="repositories-list">
            <div v-for="repo in recentRepositories" :key="repo.id" class="repo-item">
              <div class="repo-info">
                <div class="repo-name">
                  <github-outlined />
                  <a :href="repo.htmlUrl" target="_blank" class="repo-link">
                    {{ repo.fullName }}
                  </a>
                </div>
                <div class="repo-meta">
                  <span class="stars">
                    <star-outlined />
                    {{ repo.stargazersCount }}
                  </span>
                  <span class="forks">
                    <fork-outlined />
                    {{ repo.forksCount }}
                  </span>
                  <a-tag :color="getLanguageColor(repo.language)" size="small">
                    {{ repo.language || 'Unknown' }}
                  </a-tag>
                </div>
              </div>
              
              <div class="repo-actions">
                <a-tag :color="getStatusColor(repo.analysisStatus)">
                  {{ getStatusText(repo.analysisStatus) }}
                </a-tag>
                <a-button size="small" @click="gotoRepository(repo)">查看</a-button>
              </div>
            </div>
          </div>
          
          <div v-if="recentRepositories.length === 0" class="empty-state">
            <div class="empty-content">
              <github-outlined style="font-size: 48px; color: #D1D5DB;" />
              <p>暂无仓库数据</p>
              <a-button type="primary" @click="handleAddRepository">
                添加第一个仓库
              </a-button>
            </div>
          </div>
        </a-card>

        <!-- 最近生成报告 -->
        <a-card title="最近生成报告" class="section-card">
          <template #extra>
            <a-button type="link" @click="gotoReports">查看全部</a-button>
          </template>
          
          <div class="reports-list">
            <div v-for="report in recentReports" :key="report.id" class="report-item">
              <div class="report-info">
                <div class="report-title">
                  <file-text-outlined />
                  {{ report.title }}
                </div>
                <div class="report-meta">
                  <span class="repo-name">{{ report.repository }}</span>
                  <a-tag :color="getTemplateColor(report.template)" size="small">
                    {{ getTemplateName(report.template) }}
                  </a-tag>
                  <span class="create-time">{{ formatTime(report.createdAt) }}</span>
                </div>
              </div>
              
              <div class="report-actions">
                <a-button size="small" @click="viewReport(report)">查看</a-button>
                <a-button size="small" @click="shareReport(report)">分享</a-button>
              </div>
            </div>
          </div>
          
          <div v-if="recentReports.length === 0" class="empty-state">
            <div class="empty-content">
              <file-text-outlined style="font-size: 48px; color: #D1D5DB;" />
              <p>暂无报告数据</p>
              <a-button type="primary" @click="handleCreateReport">
                生成第一个报告
              </a-button>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/Layout/MainLayout.vue'
import {
  PlusOutlined,
  FileTextOutlined,
  GithubOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  StarOutlined,
  ForkOutlined
} from '@ant-design/icons-vue'
import { getRepositories, getReports } from '@/utils/api'

interface Repository {
  id: number
  fullName: string
  htmlUrl: string
  stargazersCount: number
  forksCount: number
  language: string
  analysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed'
  lastAccessed: string
}

interface Report {
  id: string
  title: string
  repository: string
  template: string
  createdAt: string
}

const router = useRouter()
const authStore = useAuthStore()

const repositoryStats = ref({
  total: 0,
  analyzed: 0,
  contributors: 0
})

const reportStats = ref({
  total: 0
})

const recentRepositories = ref<Repository[]>([])
const recentReports = ref<Report[]>([])

const currentAccount = computed(() => authStore.currentAccount)

const loadDashboardData = async () => {
  try {
    // 加载仓库数据
    const reposResponse = await getRepositories({ limit: 4, page: 1 })
    const reposData = reposResponse.data
    recentRepositories.value = reposData.items || []
    repositoryStats.value = {
      total: reposData.total || 0,
      analyzed: reposData.analyzed || 0,
      contributors: reposData.contributors || 0
    }

    // 加载报告数据
    const reportsResponse = await getReports({ limit: 3, page: 1 })
    const reportsData = reportsResponse.data
    recentReports.value = reportsData.items || []
    reportStats.value = {
      total: reportsData.total || 0
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

const getLanguageColor = (language: string) => {
  const colors: Record<string, string> = {
    JavaScript: 'blue',
    TypeScript: 'geekblue',
    Python: 'green',
    Java: 'volcano',
    Go: 'cyan',
    Rust: 'orange',
    'C++': 'purple',
    'C#': 'magenta'
  }
  return colors[language] || 'default'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'green',
    analyzing: 'orange',
    pending: 'blue',
    failed: 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    completed: '分析完成',
    analyzing: '分析中',
    pending: '待分析',
    failed: '分析失败'
  }
  return texts[status] || status
}

const getTemplateColor = (template: string) => {
  const colors: Record<string, string> = {
    interview: 'blue',
    team: 'green',
    opensource: 'orange',
    audit: 'purple',
    summary: 'cyan'
  }
  return colors[template] || 'default'
}

const getTemplateName = (template: string) => {
  const names: Record<string, string> = {
    interview: '面试模板',
    team: '团队汇报',
    opensource: '开源展示',
    audit: '代码审计',
    summary: '极简摘要'
  }
  return names[template] || template
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString('zh-CN')
}

const handleAddRepository = () => {
  router.push('/repositories?action=add')
}

const handleCreateReport = () => {
  router.push('/reports?action=create')
}

const gotoRepositories = () => {
  router.push('/repositories')
}

const gotoReports = () => {
  router.push('/reports')
}

const gotoRepository = (repo: Repository) => {
  const [owner, name] = repo.fullName.split('/')
  router.push(`/repository/${owner}/${name}`)
}

const viewReport = (report: Report) => {
  router.push(`/report/${report.id}`)
}

const shareReport = (report: Report) => {
  // 实现分享功能
  console.log('Share report:', report.id)
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: $text-primary;
    margin: 0;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.current-account {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: $background-light;
  border: 1px solid $border-color-light;
  border-radius: $border-radius;
  margin-bottom: 24px;
  
  .account-name {
    font-weight: 500;
    color: $text-primary;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  border: 1px solid $border-color-light;
  border-radius: $border-radius-lg;
  background: $background-light;
  
  :deep(.ant-card-body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .stat-icon {
    font-size: 32px;
  }
  
  .stat-info {
    .stat-number {
      font-size: 24px;
      font-weight: 600;
      color: $text-primary;
      line-height: 1;
    }
    
    .stat-label {
      font-size: 14px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.section-card {
  border-radius: $border-radius-lg;
  
  :deep(.ant-card-head) {
    border-bottom: 1px solid $border-color;
  }
  
  :deep(.ant-card-body) {
    padding: 0;
  }
}

.repositories-list,
.reports-list {
  .repo-item,
  .report-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid $border-color;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background: $hover-background;
    }
  }
}

.repo-info {
  flex: 1;
  
  .repo-name {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    
    .repo-link {
      font-weight: 500;
      color: $text-primary;
      text-decoration: none;
      
      &:hover {
        color: $github-blue;
      }
    }
  }
  
  .repo-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: $text-secondary;
    
    .stars,
    .forks {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }
}

.repo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-info {
  flex: 1;
  
  .report-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 8px;
  }
  
  .report-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: $text-secondary;
    
    .repo-name {
      color: $text-primary;
    }
    
    .create-time {
      margin-left: auto;
    }
  }
}

.report-actions {
  display: flex;
  gap: 8px;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
  
  .empty-content {
    p {
      margin: 16px 0;
      color: $text-secondary;
    }
  }
}

// 响应式适配
@media (max-width: $screen-lg) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: $screen-md) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
    
    .header-actions {
      justify-content: center;
    }
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .repo-item,
  .report-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .repo-actions,
  .report-actions {
    justify-content: center;
  }
}
</style>
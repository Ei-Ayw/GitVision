<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <div class="logo" @click="toggleSidebarCollapsed">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#4F46E5"/>
            <path d="M12 6L16 10L12 14L8 10L12 6Z" fill="white"/>
            <path d="M12 14L16 18L8 18L12 14Z" fill="white"/>
          </svg>
          <span v-show="!sidebarCollapsed">RepoInsight</span>
        </div>
        
        <a-input-search
          v-model:value="searchQuery"
          placeholder="搜索仓库/报告..."
          class="search-input"
          @search="handleSearch"
        />
      </div>

      <div class="header-right">
        <!-- 账号切换 -->
        <a-dropdown v-if="currentAccount" :trigger="['click']">
          <div class="account-info">
            <a-avatar :src="currentAccount.avatarUrl" size="small" />
            <span class="account-username">{{ currentAccount.username }}</span>
            <down-outlined />
          </div>
          <template #overlay>
            <a-menu>
              <a-menu-item v-for="account in accounts" :key="account.id" @click="switchAccount(account.id)">
                <div class="account-menu-item">
                  <a-avatar :src="account.avatarUrl" size="small" />
                  <span>{{ account.username }}</span>
                  <check-outlined v-if="account.id === currentAccount.id" class="current-icon" />
                </div>
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item @click="handleAccountManagement">
                <user-outlined />
                账号管理
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>

        <!-- 用户菜单 -->
        <a-dropdown :trigger="['click']">
          <a-avatar :src="user?.avatarUrl" size="small" class="user-avatar" />
          <template #overlay>
            <a-menu>
              <a-menu-item @click="handlePlanCenter">
                <crown-outlined />
                {{ userPlan }} · {{ reportQuota }}
              </a-menu-item>
              <a-menu-item @click="handleSettings">
                <setting-outlined />
                设置
              </a-menu-item>
              <a-menu-item @click="handleHelp">
                <question-circle-outlined />
                帮助文档
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item @click="handleLogout" danger>
                <logout-outlined />
                退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </header>

    <div class="layout-content">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="inline"
          :inline-collapsed="sidebarCollapsed"
          @click="handleMenuClick"
        >
          <a-menu-item key="/dashboard">
            <dashboard-outlined />
            <span>仪表盘</span>
          </a-menu-item>
          
          <a-menu-item key="/repositories">
            <github-outlined />
            <span>仓库管理</span>
          </a-menu-item>
          
          <a-menu-item key="/reports">
            <file-text-outlined />
            <span>报告中心</span>
          </a-menu-item>
          
          <a-menu-item key="/team" disabled>
            <team-outlined />
            <span>团队协作</span>
            <a-tag color="blue" size="small">即将上线</a-tag>
          </a-menu-item>
          
          <a-menu-divider />
          
          <a-menu-item key="/settings">
            <setting-outlined />
            <span>设置</span>
          </a-menu-item>
        </a-menu>

        <!-- 底部用户套餐信息 -->
        <div class="sidebar-footer" v-if="!sidebarCollapsed">
          <div class="plan-info">
            <crown-outlined />
            <span>{{ userPlan }}</span>
          </div>
          <div class="quota-info">
            {{ reportQuota }}
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="main-content">
        <div class="content-wrapper">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  DashboardOutlined,
  GithubOutlined,
  FileTextOutlined,
  TeamOutlined,
  SettingOutlined,
  CrownOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  DownOutlined,
  CheckOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const selectedKeys = ref([route.path])

const user = computed(() => authStore.user)
const currentAccount = computed(() => authStore.currentAccount)
const accounts = computed(() => authStore.accounts)

const userPlan = computed(() => {
  // 这里可以根据用户套餐类型返回不同的文本
  return '免费版'
})

const reportQuota = computed(() => {
  // 这里可以根据用户套餐返回报告配额信息
  return '剩余 3 次报告/月'
})

const handleMenuClick = ({ key }: { key: string }) => {
  if (key.startsWith('/')) {
    router.push(key)
  }
}

const handleSearch = (value: string) => {
  if (value.trim()) {
    // 根据搜索内容跳转到对应的搜索页面
    router.push(`/search?q=${encodeURIComponent(value)}`)
  }
}

const switchAccount = (accountId: number) => {
  authStore.switchAccount(accountId)
}

const handleAccountManagement = () => {
  // 跳转到账号管理页面
  router.push('/account/management')
}

const handlePlanCenter = () => {
  // 跳转到套餐中心
  router.push('/billing/plans')
}

const handleSettings = () => {
  // 跳转到设置页面
  router.push('/settings')
}

const handleHelp = () => {
  // 打开帮助文档
  window.open('/help', '_blank')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleSidebarCollapsed = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 监听路由变化，更新菜单选中状态
watch(
  () => route.path,
  (newPath) => {
    selectedKeys.value = [newPath]
  }
)
</script>

<style scoped lang="scss">
@import '@/styles/variables.scss';

.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid $border-color;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: $shadow-sm;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 600;
    color: $repo-blue;
    font-size: 18px;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  .search-input {
    width: 300px;
    
    :deep(.ant-input) {
      border-radius: $border-radius;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .account-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: $border-radius;
    cursor: pointer;
    
    &:hover {
      background: $hover-background;
    }
    
    .account-username {
      font-weight: 500;
      color: $text-primary;
    }
  }
  
  .user-avatar {
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
  }
}

.account-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .current-icon {
    margin-left: auto;
    color: $success-color;
  }
}

.layout-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid $border-color;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  
  &.collapsed {
    width: 80px;
  }
  
  :deep(.ant-menu) {
    border-right: none;
    flex: 1;
    
    .ant-menu-item {
      margin: 4px 8px;
      border-radius: $border-radius;
      
      &.ant-menu-item-selected {
        background: $repo-blue;
        color: white;
        
        .anticon {
          color: white;
        }
      }
    }
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid $border-color;
  background: $hover-background;
  
  .plan-info {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    color: $text-primary;
    margin-bottom: 4px;
  }
  
  .quota-info {
    font-size: 12px;
    color: $text-secondary;
  }
}

.main-content {
  flex: 1;
  overflow: auto;
  background: $background-light;
}

.content-wrapper {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

// 响应式适配
@media (max-width: $screen-lg) {
  .header-left .search-input {
    width: 200px;
  }
  
  .sidebar {
    width: 200px;
    
    &.collapsed {
      width: 60px;
    }
  }
}

@media (max-width: $screen-md) {
  .header {
    padding: 0 16px;
  }
  
  .header-left {
    .logo span {
      display: none;
    }
    
    .search-input {
      width: 150px;
    }
  }
  
  .header-right .account-info .account-username {
    display: none;
  }
  
  .sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 99;
    transform: translateX(-100%);
    transition: transform 0.3s;
    
    &.collapsed {
      transform: translateX(-100%);
    }
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
  
  .content-wrapper {
    padding: 16px;
  }
}
</style>
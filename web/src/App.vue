<template>
  <div class="app-container">
    <!-- 自定义标题栏 -->
    <div class="titlebar">
      <span class="titlebar-title">QQ经典农场助手</span>
    </div>

    <!-- 主体区域 -->
    <div class="main-layout">
      <!-- 左侧导航 -->
      <div class="sidebar">
        <div class="nav-items">
          <div
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
            :class="{ active: isRouteActive(item.path) }"
            @click="router.push(item.path)"
            :title="item.label"
          >
            <div class="nav-icon-wrapper">
              <span class="nav-icon">{{ item.icon }}</span>
              <div v-if="item.badge > 0" class="nav-badge"></div>
            </div>
          </div>
        </div>
        <div class="sidebar-bottom">
          <div class="status-dot" :class="statusClass" :title="statusText"></div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBot } from '@/composables/useBot'

const route = useRoute()
const router = useRouter()
const { getNotifications } = useBot()

const connected = ref(false)
const unreadCount = ref(0)

const navItems = computed(() => [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/lands', icon: '🌱', label: '土地' },
  { path: '/friends', icon: '👥', label: '好友' },
  { path: '/tasks', icon: '✅', label: '任务' },
  { path: '/limits', icon: '⛔', label: '限制' },
  { path: '/notifications', icon: '🔔', label: '通知', badge: unreadCount.value },
  { path: '/settings', icon: '⚙️', label: '设置' },
  { path: '/logs', icon: '📜', label: '日志' },
])

const statusClass = computed(() => (connected.value ? 'online' : 'offline'))
const statusText = computed(() => (connected.value ? '在线' : '离线'))

function isRouteActive(path) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

// 监听状态更新
if (window.electronAPI) {
  window.electronAPI.on('bot:status-update', (data) => {
    if (data && typeof data.connected === 'boolean') {
      connected.value = data.connected
    }
  })
  
  window.electronAPI.on('bot:notifications-updated', async () => {
    try {
      const res = await getNotifications()
      if (res.success) {
        unreadCount.value = res.unreadCount
      }
    } catch (e) {
      console.error(e)
    }
  })
}

onMounted(async () => {
  try {
    const res = await getNotifications()
    if (res.success) {
      unreadCount.value = res.unreadCount
    }
  } catch (e) {
    // ignore
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 72px;
  background-color: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
  flex-shrink: 0;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.nav-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  margin: 0 auto;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-item.active {
  background: var(--color-accent);
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 20px;
}

.nav-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background-color: #f56c6c;
  border-radius: 50%;
  border: 1px solid var(--bg-sidebar);
}

.sidebar-bottom {
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: background 0.3s;
}

.status-dot.online {
  background: var(--color-success);
  box-shadow: 0 0 6px var(--color-success);
}

.status-dot.offline {
  background: var(--color-danger);
  box-shadow: 0 0 6px var(--color-danger);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.titlebar {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-sidebar);
  -webkit-app-region: drag;
}

.titlebar-title {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>

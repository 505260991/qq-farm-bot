<template>
  <div class="home-view">
    <!-- 状态卡片区 -->
    <div class="status-cards">
      <div class="card">
        <div class="card-label">昵称</div>
        <div class="card-value">{{ status.connected ? status.name || '--' : '--' }}</div>
      </div>
      <div class="card">
        <div class="card-label">等级</div>
        <div class="card-value">{{ status.connected ? `Lv${status.level}` : '--' }}</div>
      </div>
      <div class="card">
        <div class="card-label">金币</div>
        <div class="card-value gold">{{ status.connected ? status.gold : '--' }}</div>
      </div>
      <div class="card">
        <div class="card-label">经验</div>
        <div class="card-value">{{ expDisplay }}</div>
      </div>
    </div>

    <!-- 登录区 -->
    <div class="section login-section" v-if="!status.connected">
      <div class="login-tabs">
        <div class="login-tab" :class="{ active: loginMethod === 'code' }" @click="loginMethod = 'code'">Code 登录</div>
        <div class="login-tab" :class="{ active: loginMethod === 'qr' }" @click="loginMethod = 'qr'">扫码登录</div>
      </div>

      <div v-if="loginMethod === 'code'" class="login-content">
        <div class="login-row">
          <el-input v-model="code" placeholder="请输入 code" class="login-input"/>
          <el-button type="primary" :loading="connecting" @click="handleConnect">连接</el-button>
        </div>
        <div class="platform-row">
          <el-radio-group v-model="platform" size="small">
            <el-radio value="qq">QQ</el-radio>
            <el-radio value="wx">微信</el-radio>
          </el-radio-group>
        </div>
      </div>

      <div v-else class="login-content qr-content">
        <div v-if="qrUrl" class="qr-wrapper">
          <img :src="qrUrl" alt="QR Code" class="qr-img" />
          <div class="qr-status" :class="qrStatusClass">{{ qrStatusText }}</div>
          <div v-if="qrExpired" class="qr-refresh" @click="getQrCode">
            <el-icon><Refresh /></el-icon>
            <span>点击刷新</span>
          </div>
        </div>
        <div v-else class="qr-placeholder" v-loading="qrLoading">
          <el-button @click="getQrCode">获取二维码</el-button>
        </div>
        <div class="qr-tip">请使用手机 QQ 扫码登录</div>
      </div>
    </div>
    <div class="section connected-bar" v-else>
      <span class="connected-text">已连接</span>
      <el-button text size="small" @click="handleDisconnect">断开连接</el-button>
    </div>

    <!-- 功能开关区 -->
    <div class="section">
      <div class="section-title">功能开关</div>
      <div class="feature-grid">
        <div class="feature-group">
          <div class="group-title">自己农场</div>
          <div class="feature-item" v-for="f in farmFeatures" :key="f.key">
            <div class="feature-label">
              <span>{{ f.label }}</span>
              <el-tooltip v-if="f.desc" :content="f.desc" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled/>
                </el-icon>
              </el-tooltip>
            </div>
            <el-switch :model-value="status.features[f.key] !== false" size="small"
                       @change="(v) => toggleFeature(f.key, v)"/>
          </div>
        </div>
        <div class="feature-group">
          <div class="group-title">好友农场</div>
          <div class="feature-item" v-for="f in friendFeatures" :key="f.key" :class="{ 'indent': f.indent }">
            <div class="feature-label">
              <span :class="{ 'master-label': f.isMaster }">{{ f.label }}</span>
              <el-tooltip v-if="f.desc" :content="f.desc" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled/>
                </el-icon>
              </el-tooltip>
            </div>
            <el-switch :model-value="status.features[f.key] !== false" size="small"
                       @change="(v) => toggleFeature(f.key, v)"/>
          </div>
        </div>
        <div class="feature-group">
          <div class="group-title">系统</div>
          <div class="feature-item" v-for="f in systemFeatures" :key="f.key">
            <div class="feature-label">
              <span>{{ f.label }}</span>
              <el-tooltip v-if="f.desc" :content="f.desc" placement="top">
                <el-icon class="help-icon">
                  <QuestionFilled/>
                </el-icon>
              </el-tooltip>
            </div>
            <el-switch :model-value="status.features[f.key] !== false" size="small"
                       @change="(v) => toggleFeature(f.key, v)"/>
          </div>
        </div>
      </div>
    </div>

    <!-- 种植策略 -->
    <div class="section">
      <div class="section-title">种植策略</div>
      <div class="plant-plan" v-if="plantPlan">
        <div class="plan-info">
          <span>推荐作物: <strong>{{ plantPlan.recommended?.name || '无' }}</strong>
            <el-tag size="small" :type="strategyTagType" class="strategy-tag">{{ strategyLabel }}</el-tag>
          </span>
          <span>经验效率: {{ plantPlan.recommended?.expPerHour || 0 }} exp/h</span>
          <span>单次经验: {{ plantPlan.recommended?.expPerHarvest || 0 }} exp</span>
          <span>生长周期: {{ plantPlan.recommended?.growTimeWithFert || 0 }}秒(施肥后)</span>
        </div>
        <div class="plan-mode">
          <el-radio-group v-model="plantMode" size="small" @change="handlePlantModeChange">
            <el-radio value="fast">快速升级</el-radio>
            <el-radio value="advanced">高级作物</el-radio>
            <el-radio value="manual">手动选择</el-radio>
          </el-radio-group>
          <el-select v-if="plantMode === 'manual'" v-model="plantSeedId" size="small"
                     class="plant-select" @change="handlePlantSeedChange">
            <el-option v-for="opt in plantPlan.options" :key="opt.seedId"
                       :label="`${opt.name} (${opt.expPerHarvest}exp, ${opt.expPerHour}exp/h)`" :value="opt.seedId"/>
          </el-select>
        </div>
      </div>
      <div v-else class="plan-empty">登录后查看种植策略</div>
    </div>

    <!-- 最近操作 -->
    <div class="section">
      <div class="section-title">
        最近操作
        <el-button text size="small" @click="$router.push('/logs')">查看全部</el-button>
      </div>
      <div class="recent-logs">
        <div v-for="(log, i) in recent" :key="i" class="log-line" :class="log.level">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
        <div v-if="recent.length === 0" class="log-empty">暂无操作记录</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, onUnmounted} from 'vue'
import {ElMessage} from 'element-plus'
import {QuestionFilled, Refresh} from '@element-plus/icons-vue'
import {useBot} from '@/composables/useBot'
import {useLog} from '@/composables/useLog'

const {status, connecting, connect, disconnect, toggleFeature, getConfig, saveConfig, getPlantPlan, refreshStatus, getLoginQr, checkLoginQr} = useBot()
const {recentLogs, loadLogs} = useLog()

const code = ref('')
const platform = ref('qq')
const plantPlan = ref(null)
const plantMode = ref('fast')
const plantSeedId = ref(0)
const loginMethod = ref('code')

// QR Login State
const qrUrl = ref('')
const qrSig = ref('')
const qrLoading = ref(false)
const qrStatusText = ref('等待扫码...')
const qrStatusClass = ref('') // 'success' | 'error' | ''
const qrExpired = ref(false)
let qrTimer = null

const recent = recentLogs(5)

const strategyLabel = computed(() => {
  switch (plantMode.value) {
    case 'fast':
      return '经验效率最优'
    case 'advanced':
      return '高级作物优先'
    case 'manual':
      return '手动选择'
    default:
      return ''
  }
})

const strategyTagType = computed(() => {
  switch (plantMode.value) {
    case 'fast':
      return 'success'
    case 'advanced':
      return 'warning'
    case 'manual':
      return 'info'
    default:
      return 'info'
  }
})

const expDisplay = computed(() => {
  if (!status.connected) return '--'
  const p = status.expProgress
  if (p && p.needed > 0) return `${p.current}/${p.needed}`
  return String(status.exp)
})

const farmFeatures = [
  {key: 'autoHarvest', label: '自动收获', desc: '检测成熟作物并自动收获'},
  {key: 'autoPlant', label: '自动种植', desc: '收获/铲除后自动购买种子并种植'},
  {key: 'autoFertilize', label: '自动施肥', desc: '种植后自动施放普通肥料加速生长'},
  {key: 'autoWeed', label: '自动除草', desc: '检测并清除杂草'},
  {key: 'autoBug', label: '自动除虫', desc: '检测并消灭害虫'},
  {key: 'autoWater', label: '自动浇水', desc: '检测缺水作物并浇水'},
]
const friendFeatures = [
  {key: 'friendPatrol', label: '好友巡查', desc: '遍历好友列表进入农场（主开关）', isMaster: true},
  {key: 'autoSteal', label: '自动偷菜', desc: '偷取好友成熟作物（有经验）', indent: true},
  {key: 'friendHelp', label: '帮忙操作', desc: '帮好友除草/除虫/浇水（有经验上限）', indent: true},
]
const systemFeatures = [
  {key: 'autoTask', label: '自动任务', desc: '自动领取完成的任务奖励'},
  {key: 'enableNotifications', label: '消息通知', desc: '启用游戏内消息通知系统'},
]

async function handleConnect() {
  if (!code.value.trim()) {
    ElMessage.warning('请输入 code')
    return
  }
  const result = await connect(code.value.trim(), platform.value)
  if (result.success) {
    ElMessage.success('连接成功')
    loadPlantPlan()
    loadLogs()
  } else {
    ElMessage.error(result.error || '连接失败')
  }
}

async function handleDisconnect() {
  await disconnect()
  plantPlan.value = null
  stopQrCheck()
}

async function loadPlantPlan() {
  try {
    plantPlan.value = await getPlantPlan()
  } catch { /* ignore */
  }
}

async function handlePlantModeChange(mode) {
  await saveConfig({plantMode: mode, plantSeedId: 0})
  plantSeedId.value = 0
  await loadPlantPlan()
}

async function handlePlantSeedChange(seedId) {
  await saveConfig({plantMode: 'manual', plantSeedId: seedId})
}

// === QR Login Logic ===

async function getQrCode() {
  qrLoading.value = true
  qrExpired.value = false
  qrStatusText.value = '获取中...'
  qrStatusClass.value = ''
  
  try {
    const res = await getLoginQr()
    if (res.success) {
      qrUrl.value = res.qrcode
      qrSig.value = res.qrsig
      qrStatusText.value = '等待扫码...'
      startQrCheck()
    } else {
      qrStatusText.value = '获取失败'
      qrStatusClass.value = 'error'
      ElMessage.error(res.error || '获取二维码失败')
    }
  } catch (e) {
    qrStatusText.value = '获取失败'
    qrStatusClass.value = 'error'
    console.error(e)
  } finally {
    qrLoading.value = false
  }
}

function startQrCheck() {
  stopQrCheck()
  qrTimer = setInterval(async () => {
    try {
      const res = await checkLoginQr(qrSig.value)
      if (!res.success) {
        // error
        return
      }
      
      if (res.ret === '0') {
        // success
        stopQrCheck()
        qrStatusText.value = '登录成功'
        qrStatusClass.value = 'success'
        code.value = res.code
        ElMessage.success('扫码登录成功，正在连接...')
        await handleConnect()
      } else if (res.ret === '65') {
        // expired
        stopQrCheck()
        qrStatusText.value = '二维码已失效'
        qrStatusClass.value = 'error'
        qrExpired.value = true
      } else {
        // waiting (66)
        qrStatusText.value = res.msg || '等待扫码...'
      }
    } catch (e) {
      console.error(e)
    }
  }, 2000)
}

function stopQrCheck() {
  if (qrTimer) {
    clearInterval(qrTimer)
    qrTimer = null
  }
}

onMounted(async () => {
  const config = await getConfig()
  platform.value = config.platform || 'qq'
  plantMode.value = config.plantMode || 'fast'
  plantSeedId.value = config.plantSeedId || 0
  await refreshStatus();
  if (status.connected) {
    loadPlantPlan()
    loadLogs()
  }
})

onUnmounted(() => {
  stopQrCheck()
})

watch(() => status.connected, (val) => {
  if (val) {
    loadPlantPlan()
    loadLogs()
    stopQrCheck() // Stop checking if connected
  }
})

// Stop QR check when switching tabs
watch(loginMethod, (val) => {
  if (val !== 'qr') {
    stopQrCheck()
  } else if (!qrUrl.value) {
    // Auto start if empty
    getQrCode()
  }
})
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-cards {
  display: flex;
  gap: 12px;
}

.card {
  flex: 1;
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 16px;
}

.card-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.card-value {
  font-size: 18px;
  font-weight: bold;
}

.card-value.gold {
  color: var(--color-warning);
}

.section {
  background: var(--bg-card);
  border-radius: 8px;
  padding: 12px 16px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.login-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 8px;
}

.login-tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.login-tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.login-content {
  min-height: 100px;
}

.login-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.login-input {
  flex: 1;
}

.platform-row {
  display: flex;
  align-items: center;
}

.qr-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qr-placeholder {
  width: 150px;
  height: 150px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.qr-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
}

.qr-img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.qr-status {
  margin-top: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
}

.qr-status.success {
  color: var(--color-success);
}

.qr-status.error {
  color: var(--color-danger);
}

.qr-refresh {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  border-radius: 8px;
}

.qr-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.connected-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.connected-text {
  color: var(--color-success);
  font-size: 13px;
}

.feature-grid {
  display: flex;
  gap: 24px;
}

.feature-group {
  flex: 1;
}

.group-title {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.feature-item.indent {
  padding-left: 16px;
}

.feature-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.master-label {
  font-weight: 600;
}

.help-icon {
  font-size: 14px;
  color: var(--color-text-secondary);
  cursor: help;
}

.plant-plan .plan-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  margin-bottom: 10px;
}

.plan-mode {
  display: flex;
  align-items: center;
  gap: 12px;
}

.plant-select {
  width: 260px;
}

.strategy-tag {
  margin-left: 8px;
}

.plan-empty {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.recent-logs {
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.log-line {
  padding: 2px 0;
  display: flex;
  gap: 8px;
}

.log-line.warn {
  color: var(--color-warning);
}

.log-time {
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.log-empty {
  color: var(--color-text-secondary);
  font-size: 13px;
}
</style>

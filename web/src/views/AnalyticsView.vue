<template>
  <div class="analytics-view">
    <div class="header">
      <h2>作物效率分析</h2>
      <div class="controls">
        <el-input-number v-model="maxLevel" :min="1" :max="200" size="small" placeholder="最大等级" style="width: 100px; margin-right: 10px;" @change="fetchData" />
        <el-radio-group v-model="sortBy" size="small" @change="fetchData">
          <el-radio-button label="exp">经验效率</el-radio-button>
          <el-radio-button label="fert">化肥经验效率</el-radio-button>
          <el-radio-button label="gold">金币效率</el-radio-button>
          <el-radio-button label="profit">净利效率</el-radio-button>
          <el-radio-button label="fert_profit">化肥净利效率</el-radio-button>
          <el-radio-button label="level">等级要求</el-radio-button>
        </el-radio-group>
        <el-button type="primary" size="small" :icon="Refresh" @click="fetchData" circle />
      </div>
    </div>

    <el-table :data="rankings" style="width: 100%" v-loading="loading" height="calc(100vh - 140px)" stripe>
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column label="名称" min-width="120">
        <template #default="scope">
          <div class="plant-name">
            <span>{{ scope.row.name }}</span>
            <span class="seed-id">种子ID: {{ scope.row.seedId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="等级" width="80" sortable />
      <el-table-column prop="growTimeStr" label="成熟时间" width="100" />
      
      <el-table-column label="经验/小时" align="center">
        <el-table-column prop="expPerHour" label="普通" width="100" sortable />
        <el-table-column prop="normalFertilizerExpPerHour" label="化肥" width="100" sortable />
      </el-table-column>

      <el-table-column label="金币/小时" align="center">
        <el-table-column prop="goldPerHour" label="毛利" width="100" sortable />
        <el-table-column prop="profitPerHour" label="净利" width="100" sortable />
      </el-table-column>

      <el-table-column label="单次收益" align="center" width="180">
        <template #default="scope">
          <div class="profit-detail">
            <div>成本: {{ scope.row.seedPrice }}</div>
            <div>收入: {{ scope.row.income }}</div>
            <div :class="scope.row.netProfit > 0 ? 'text-success' : 'text-danger'">
              净赚: {{ scope.row.netProfit }}
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { useBot } from '@/composables/useBot'

const { getPlantRankings, status } = useBot()

const loading = ref(false)
const sortBy = ref('exp')
const maxLevel = ref(status.level || 100) // 默认使用当前等级，如果没有则100
const rankings = ref([])

async function fetchData() {
  loading.value = true
  try {
    const res = await getPlantRankings(sortBy.value, maxLevel.value)
    if (res.success) {
      rankings.value = res.rankings
    }
  } finally {
    loading.value = false
  }
}

// 监听状态更新，如果初始等级为0，更新后自动同步一次
import { watch } from 'vue'
watch(() => status.level, (newVal) => {
    if (newVal > 0 && maxLevel.value === 0) {
        maxLevel.value = newVal
        fetchData()
    }
}, { immediate: true })

onMounted(() => {
  if (status.level > 0) {
      maxLevel.value = status.level
  }
  fetchData()
})
</script>

<style scoped>
.analytics-view {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 10px;
}

.plant-name {
  display: flex;
  flex-direction: column;
}

.seed-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.profit-detail {
  font-size: 12px;
}

.text-success {
  color: var(--el-color-success);
}

.text-danger {
  color: var(--el-color-danger);
}
</style>

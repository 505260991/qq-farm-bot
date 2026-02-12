import {reactive, ref} from 'vue'

const status = reactive({
    connected: false,
    gid: 0,
    name: '',
    level: 0,
    gold: 0,
    exp: 0,
    expProgress: {current: 0, needed: 0},
    features: {},
    currentPlant: null,
    landSummary: {total: 0, growing: 0, harvestable: 0, empty: 0},
})

const connecting = ref(false)

// === 基础连接与状态 ===
async function connect(code, platform) {
    connecting.value = true
    try {
        const result = await window.electronAPI.invoke('bot:connect', {code, platform})
        if (result.success) {
            await refreshStatus()
        }
        return result
    } finally {
        connecting.value = false
    }
}

async function disconnect() {
    return await window.electronAPI.invoke('bot:disconnect')
}

async function refreshStatus() {
    const data = await window.electronAPI.invoke('bot:status')
    Object.assign(status, data)
}

// === 配置与功能开关 ===
async function toggleFeature(feature, enabled) {
    const result = await window.electronAPI.invoke('bot:feature-toggle', {feature, enabled})
    if (result.success) {
        status.features = result.features
    }
    return result
}

async function getConfig() {
    const result = await window.electronAPI.invoke('bot:get-config')
    status.features = result.features
    return result
}

async function saveConfig(partial) {
    return await window.electronAPI.invoke('bot:save-config', partial)
}

async function getPlantPlan() {
    return await window.electronAPI.invoke('bot:get-plant-plan')
}

// === 账号管理 ===
async function getAccounts() {
    return await window.electronAPI.invoke('accounts:get')
}

async function addAccount(account) {
    return await window.electronAPI.invoke('accounts:add', account)
}

async function removeAccount(code) {
    return await window.electronAPI.invoke('accounts:remove', code)
}

async function updateAccount(code, updates) {
    return await window.electronAPI.invoke('accounts:update', code, updates)
}

// === 农场与好友 ===
async function getLands() {
    return await window.electronAPI.invoke('lands:get')
}

async function getFriends() {
    return await window.electronAPI.invoke('friends:get')
}

async function enterFriendFarm(gid) {
    return await window.electronAPI.invoke('friend-farm:enter', { gid })
}

async function stealFromFriend(gid, landIds) {
    return await window.electronAPI.invoke('friend-farm:steal', { gid, landIds })
}

async function waterFriendLand(gid, landIds) {
    return await window.electronAPI.invoke('friend-farm:water', { gid, landIds })
}

async function weedFriendLand(gid, landIds) {
    return await window.electronAPI.invoke('friend-farm:weed', { gid, landIds })
}

async function insectFriendLand(gid, landIds) {
    return await window.electronAPI.invoke('friend-farm:insect', { gid, landIds })
}

// === 统计与限制 ===
async function getDailyStats() {
    return await window.electronAPI.invoke('stats:get-daily')
}

async function getOperationLimits() {
    return await window.electronAPI.invoke('operation-limits:get')
}

// === 任务 ===
async function getTaskInfo() {
    return await window.electronAPI.invoke('task:get-info')
}

async function claimTaskReward(taskId, useShare = false) {
    return await window.electronAPI.invoke('task:claim', { taskId, useShare })
}

async function batchClaimTaskReward(taskIds, useShare = false) {
    return await window.electronAPI.invoke('task:batch-claim', { taskIds, useShare })
}

// === 通知 ===
async function getNotifications() {
    return await window.electronAPI.invoke('notifications:get')
}

async function markNotificationAsRead(id) {
    return await window.electronAPI.invoke('notifications:mark-read', { id })
}

async function markAllNotificationsAsRead() {
    return await window.electronAPI.invoke('notifications:mark-all-read')
}

async function clearNotifications() {
    return await window.electronAPI.invoke('notifications:clear')
}

// === 登录 ===
async function getLoginQr() {
    return await window.electronAPI.invoke('login:get-qr')
}

async function checkLoginQr(qrsig) {
    return await window.electronAPI.invoke('login:check-qr', { qrsig })
}

// === 监听更新 ===
if (window.electronAPI) {
    window.electronAPI.on('bot:status-update', (data) => {
        Object.assign(status, data)
    })
    
    // 监听其他可能的全局更新（如果有）
}

export function useBot() {
    return {
        status,
        connecting,
        connect,
        disconnect,
        refreshStatus,
        toggleFeature,
        getConfig,
        saveConfig,
        getPlantPlan,
        // 新增导出
        getAccounts,
        addAccount,
        removeAccount,
        updateAccount,
        getLands,
        getFriends,
        enterFriendFarm,
        stealFromFriend,
        waterFriendLand,
        weedFriendLand,
        insectFriendLand,
        getDailyStats,
        getOperationLimits,
        getTaskInfo,
        claimTaskReward,
        batchClaimTaskReward,
        getNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        getLoginQr,
        checkLoginQr,
    }
}

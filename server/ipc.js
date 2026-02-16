/**
 * IPC 通道处理
 * 注册所有 Socket.IO 事件，调用 bot.js 并返回结果
 * 将 bot.js 事件推送到前端
 */
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const bot = require('./bot');
const login = require('./login');

let io = null;

function handle(socket, ev, cb) {
    if (!io) throw new Error('IPC 尚未初始化');
    socket.on(ev, async (data, ioCb) => {
        // 如果客户端发送消息时带有回调函数（acknowledgement）
        if (typeof ioCb === 'function') {
            try {
                const result = await cb(data);
                ioCb(result);
            } catch (e) {
                ioCb({ success: false, error: e.message });
            }
        } else {
            // 如果没有回调，仅执行
            try {
                await cb(data);
            } catch (e) {
                console.error(`Error handling ${ev}:`, e);
            }
        }
    });
}

/**
 * 注册所有 IPC 通道
 */
function registerIPC(server) {
    io = new Server(server, {
        cors: {
            origin: "*", // 允许跨域，方便开发
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('👤 用户连接:', socket.id);

        // === 基础控制 ===
        handle(socket, 'bot:connect', async ({ code, platform }) => {
            return await bot.botConnect(code, platform);
        });

        handle(socket, 'bot:disconnect', () => {
            return bot.botDisconnect();
        });

        handle(socket, 'bot:status', () => {
            return bot.getStatus();
        });

        handle(socket, 'bot:feature-toggle', ({ feature, enabled }) => {
            return bot.setFeatureEnabled(feature, enabled);
        });

        handle(socket, 'bot:get-config', () => {
            return bot.getConfig();
        });

        handle(socket, 'bot:save-config', (partial) => {
            return bot.saveConfig(partial);
        });

        handle(socket, 'bot:get-plant-plan', () => {
            return bot.getPlantPlan();
        });

        handle(socket, 'bot:get-logs', () => {
            return bot.getLogs();
        });

        handle(socket, 'bot:clear-logs', () => {
            bot.clearLogs();
            return { success: true };
        });

        // === 登录 ===
        handle(socket, 'login:get-qr', async () => {
            return await login.getLoginQr();
        });

        handle(socket, 'login:check-qr', async ({ qrsig }) => {
            return await login.checkLoginQr(qrsig);
        });

        // === 杂项 ===
        handle(socket, 'app:get-donation-images', () => {
            try {
                // 假设 docs 目录在项目根目录
                const basePath = process.cwd();
                const wechatPath = path.join(basePath, 'docs', 'images', '微信.png');
                const alipayPath = path.join(basePath, 'docs', 'images', '支付宝.png');

                const wechatBase64 = fs.existsSync(wechatPath)
                    ? `data:image/png;base64,${fs.readFileSync(wechatPath).toString('base64')}`
                    : null;
                const alipayBase64 = fs.existsSync(alipayPath)
                    ? `data:image/png;base64,${fs.readFileSync(alipayPath).toString('base64')}`
                    : null;

                return { wechat: wechatBase64, alipay: alipayBase64 };
            } catch (e) {
                return { wechat: null, alipay: null };
            }
        });

        // === 账号管理 ===
        handle(socket, 'accounts:get', () => {
            return bot.getAccounts();
        });

        handle(socket, 'accounts:add', (account) => {
            return bot.addAccount(account);
        });

        handle(socket, 'accounts:remove', (code) => {
            return bot.removeAccount(code);
        });

        handle(socket, 'accounts:update', ({ code, updates }) => {
            return bot.updateAccount(code, updates);
        });

        // === 农场互动 ===
        handle(socket, 'lands:get', () => {
            return bot.getLands();
        });

        handle(socket, 'friends:get', () => {
            return bot.getFriends();
        });

        handle(socket, 'friend-farm:enter', ({ gid }) => {
            return bot.enterFriendFarmDetail(gid);
        });

        handle(socket, 'friend-farm:steal', ({ gid, landIds }) => {
            return bot.stealFromFriend(gid, landIds);
        });

        handle(socket, 'friend-farm:water', ({ gid, landIds }) => {
            return bot.waterFriendLand(gid, landIds);
        });

        handle(socket, 'friend-farm:weed', ({ gid, landIds }) => {
            return bot.weedFriendLand(gid, landIds);
        });

        handle(socket, 'friend-farm:insect', ({ gid, landIds }) => {
            return bot.insectFriendLand(gid, landIds);
        });

        handle(socket, 'friend-farm:one-click-help', ({ gid, name }) => {
            return bot.oneClickHelpFriend(gid, name);
        });

        // === 数据统计 ===
        handle(socket, 'stats:get-daily', () => {
            return bot.getDailyStats();
        });

        handle(socket, 'operation-limits:get', () => {
            return bot.getOperationLimitsData();
        });

        // === 任务系统 ===
        handle(socket, 'task:get-info', () => {
            return bot.getTaskData();
        });

        handle(socket, 'task:claim', ({ taskId, useShare }) => {
            return bot.claimTaskRewardData(taskId, useShare);
        });

        handle(socket, 'task:batch-claim', ({ taskIds, useShare }) => {
            return bot.batchClaimTaskRewardData(taskIds, useShare);
        });

        // === 通知系统 ===
        handle(socket, 'notifications:get', () => {
            return bot.getNotificationsData();
        });

        handle(socket, 'notifications:mark-read', ({ id }) => {
            return bot.markNotificationAsRead(id);
        });

        handle(socket, 'notifications:mark-all-read', () => {
            return bot.markAllNotificationsAsRead();
        });

        handle(socket, 'notifications:clear', () => {
            return bot.clearAllNotifications();
        });

        // === 数据分析 ===
        handle(socket, 'analytics:get-plant-rankings', ({ sortBy, maxLevel }) => {
            return { success: true, rankings: bot.getPlantRankings(sortBy, maxLevel) };
        });
    });

    // === 主进程 → 渲染进程推送 ===
    // 移除旧的监听器以防止重复
    bot.botEvents.removeAllListeners();

    bot.botEvents.on('log', (entry) => {
        if (io) io.emit('bot:log', entry);
    });

    bot.botEvents.on('status-update', (status) => {
        if (io) io.emit('bot:status-update', status);
    });

    bot.botEvents.on('stats-update', (stats) => {
        if (io) io.emit('bot:stats-update', stats);
    });

    bot.botEvents.on('notifications-updated', () => {
        if (io) io.emit('bot:notifications-updated');
    });
}

async function deployIPC() {
    if (!io) return;
    await new Promise(resolve => io.close(resolve));
    io = null;
}

module.exports = { registerIPC, deployIPC };

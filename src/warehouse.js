/**
 * 仓库系统 - 自动出售果实
 */

const { types } = require('./proto');
const { sendMsgAsync } = require('./network');
const { toLong, toNum, log, logWarn, sleep } = require('./utils');
const { getFruitName } = require('./gameConfig');

// ============ 物品类型 ============
// 果实 ID 范围: 40001-49999 (根据 Plant.json 配置)
const FRUIT_ID_MIN = 40001;
const FRUIT_ID_MAX = 49999;

// ============ 内部状态 ============
let sellTimer = null;
let sellInterval = 60000;  // 默认1分钟

// ============ API ============

async function getBag() {
    const body = types.BagRequest.encode(types.BagRequest.create({})).finish();
    const { body: replyBody } = await sendMsgAsync('gamepb.itempb.ItemService', 'Bag', body);
    return types.BagReply.decode(replyBody);
}

async function sellItems(items) {
    const body = types.SellRequest.encode(types.SellRequest.create({
        items: items.map(item => ({
            id: toLong(item.id),
            count: toLong(item.count),
        })),
    })).finish();
    const { body: replyBody } = await sendMsgAsync('gamepb.itempb.ItemService', 'Sell', body);
    return types.SellReply.decode(replyBody);
}

// ============ 出售逻辑 ============

/**
 * 检查并出售所有果实
 */
async function sellAllFruits() {
    try {
        const bagReply = await getBag();
        const items = bagReply.items || [];

        // 筛选出果实
        const fruits = [];
        for (const item of items) {
            const id = toNum(item.id);
            const count = toNum(item.count);
            if (id >= FRUIT_ID_MIN && id <= FRUIT_ID_MAX && count > 0) {
                const name = getFruitName(id);
                fruits.push({ id, count, name });
            }
        }

        if (fruits.length === 0) {
            // 没有果实可出售
            return;
        }

        // 批量出售
        const sellReply = await sellItems(fruits);
        const gold = toNum(sellReply.gold);

        // 汇总日志 - 显示果实名称
        const fruitNames = fruits.map(f => `${f.name}x${f.count}`).join(', ');
        log('仓库', `出售 ${fruitNames}，获得 ${gold} 金币`);
    } catch (e) {
        logWarn('仓库', `出售失败: ${e.message}`);
    }
}

// 手动触发一次出售（用于调试）
async function debugSellFruits() {
    try {
        log('仓库', '正在检查背包...');
        const bagReply = await getBag();
        const items = bagReply.items || [];
        log('仓库', `背包共 ${items.length} 种物品`);

        // 显示所有物品
        for (const item of items) {
            const id = toNum(item.id);
            const count = toNum(item.count);
            const isFruit = id >= FRUIT_ID_MIN && id <= FRUIT_ID_MAX;
            if (isFruit) {
                const name = getFruitName(id);
                log('仓库', `  [果实] ${name}(${id}) x${count}`);
            }
        }

        // 筛选出果实
        const fruits = [];
        for (const item of items) {
            const id = toNum(item.id);
            const count = toNum(item.count);
            if (id >= FRUIT_ID_MIN && id <= FRUIT_ID_MAX && count > 0) {
                const name = getFruitName(id);
                fruits.push({ id, count, name });
            }
        }

        if (fruits.length === 0) {
            log('仓库', '没有果实可出售');
            return;
        }

        log('仓库', `准备出售 ${fruits.length} 种果实...`);
        const sellReply = await sellItems(fruits);
        const gold = toNum(sellReply.gold);
        log('仓库', `出售成功，获得 ${gold} 金币`);
    } catch (e) {
        logWarn('仓库', `调试出售失败: ${e.message}`);
        console.error(e);
    }
}

// ============ 定时任务 ============

function startSellLoop(interval = 60000) {
    if (sellTimer) return;
    sellInterval = interval;

    // 启动后延迟 10 秒执行第一次
    setTimeout(() => {
        sellAllFruits();
        sellTimer = setInterval(() => sellAllFruits(), sellInterval);
    }, 10000);
}

function stopSellLoop() {
    if (sellTimer) {
        clearInterval(sellTimer);
        sellTimer = null;
    }
}

module.exports = {
    getBag,
    sellItems,
    sellAllFruits,
    debugSellFruits,
    startSellLoop,
    stopSellLoop,
};

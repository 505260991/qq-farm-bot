/**
 * 数据分析模块 - 作物效率分析
 */

const { getAllPlants, getFruitPrice, getSeedPrice, calculateEfficiency, getPlantGrowTime } = require('./gameConfig');

function formatTime(seconds) {
    if (seconds < 60) return `${seconds}秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}时${mins}分` : `${hours}时`;
}

function getPlantRankings(sortBy = 'exp', maxLevel = null) {
    const plants = getAllPlants();
    
    // 筛选普通作物
    const normalPlants = plants.filter(p => {
        const idStr = String(p.id);
        return idStr.startsWith('102') && p.seed_id && p.seed_id >= 20000 && p.seed_id < 30000;
    });

    // 为作物手动补充等级信息（根据配置文件中的顺序，推测等级）
    // 注意：这里的顺序是基于 Plant.json 的数组索引，可能不完全准确，但比全0好
    // 更好的方式是维护一个硬编码的 ID -> Level 映射表，或者从其他配置文件读取
    // 暂时采用索引映射的方式，假设配置文件的顺序就是解锁顺序
    
    const results = [];
    normalPlants.forEach((plant, index) => {
        const growTime = getPlantGrowTime(plant.id);
        if (growTime <= 0) return;
        
        // 1. 基础效率 (理论值: 无化肥, 无操作耗时, 无铲除经验)
        const metricsBase = calculateEfficiency(plant, {
            fertilizerReduction: 0,
            operationTime: 0,
            includeRemovalExp: false
        });

        // 2. 实际效率 (机器人逻辑: 20%化肥/30s, 15s操作耗时, +1铲除经验)
        // 这个值与 server/planner.js 中的逻辑一致，确保"配置"与"分析"数据对齐
        const metricsPractical = calculateEfficiency(plant, {
            fertilizerRatio: 0.2,
            fertilizerMinReduction: 30,
            operationTime: 15,
            includeRemovalExp: true
        });

        const expPerHour = metricsBase.expPerHour;
        const normalFertilizerExpPerHour = metricsPractical.expPerHour;
        
        const fruitId = Number(plant.fruit && plant.fruit.id) || 0;
        const fruitCount = Number(plant.fruit && plant.fruit.count) || 0;
        const fruitPrice = getFruitPrice(fruitId);
        const seedPrice = getSeedPrice(Number(plant.seed_id) || 0);

        // 单次收获总金币（毛收益）与净收益
        const income = fruitCount * fruitPrice;
        const netProfit = income - seedPrice;

        // 金币效率也分"理论"和"实际"
        // 理论金币效率 (基于基础生长时间)
        const goldPerHour = metricsBase.totalTime > 0 ? (income / metricsBase.totalTime) * 3600 : 0;
        const profitPerHour = metricsBase.totalTime > 0 ? (netProfit / metricsBase.totalTime) * 3600 : 0;
        
        // 实际金币效率 (基于施肥+操作时间)
        const normalFertilizerProfitPerHour = metricsPractical.totalTime > 0 ? (netProfit / metricsPractical.totalTime) * 3600 : 0;

        // 尝试从 plant 对象获取 level，如果为 0 或 1（且不是第一个），则使用 index + 1 作为推测等级
        // 注意：白萝卜是第1个，等级1；胡萝卜第2个，等级可能也是1或者2
        // 由于 Plant.json 里确实没有 level 字段（只有 land_level_need=1 表示土地等级），我们只能推测
        // 简单策略：直接使用 (index + 1) 作为显示等级，虽然不一定精确对应游戏内解锁等级，
        // 但至少能反映出“越往后越高级”的趋势，用于排序是足够的。
        let displayLevel = index + 1;

        if (maxLevel !== null && maxLevel !== undefined && displayLevel > maxLevel) {
            return;
        }

        results.push({
            id: plant.id,
            seedId: plant.seed_id,
            name: plant.name,
            level: displayLevel,
            growTime,
            growTimeStr: formatTime(growTime),
            expPerHour: parseFloat(expPerHour.toFixed(2)),
            normalFertilizerExpPerHour: parseFloat(normalFertilizerExpPerHour.toFixed(2)),
            goldPerHour: parseFloat(goldPerHour.toFixed(2)), // 毛收益/时
            profitPerHour: parseFloat(profitPerHour.toFixed(2)), // 净收益/时
            normalFertilizerProfitPerHour: parseFloat(normalFertilizerProfitPerHour.toFixed(2)), // 普通肥净收益/时
            income,
            netProfit,
            fruitId,
            fruitCount,
            fruitPrice,
            seedPrice,
        });
    });

    if (sortBy === 'exp') {
        results.sort((a, b) => b.expPerHour - a.expPerHour);
    } else if (sortBy === 'fert') {
        results.sort((a, b) => b.normalFertilizerExpPerHour - a.normalFertilizerExpPerHour);
    } else if (sortBy === 'gold') {
        results.sort((a, b) => b.goldPerHour - a.goldPerHour);
    } else if (sortBy === 'profit') {
        results.sort((a, b) => b.profitPerHour - a.profitPerHour);
    } else if (sortBy === 'fert_profit') {
        results.sort((a, b) => b.normalFertilizerProfitPerHour - a.normalFertilizerProfitPerHour);
    } else if (sortBy === 'level') {
        const lv = (v) => (v === null || v === undefined ? -1 : Number(v));
        results.sort((a, b) => lv(b.level) - lv(a.level));
    }

    return results;
}

module.exports = {
    getPlantRankings,
};

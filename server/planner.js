/**
 * 种植策略计算模块
 * 根据用户等级和植物配置，计算最优种植方案
 */

const { calculateEfficiency, getAllPlants, getPlantGrowTime, getItemById } = require('../src/gameConfig');

/**
 * 计算所有可购买作物的种植效率
 * @param {number} userLevel - 用户当前等级
 * @param {Array} shopGoodsList - 商店种子列表（可选，来自实时商店API缓存）
 * @param {string} strategy - 策略: 'fast'(exp/hour) | 'advanced'(单次经验)
 * @returns {object} { currentLevel, recommended, options, strategy }
 */
function calculatePlantPlan(userLevel, shopGoodsList, strategy = 'fast') {
  const plants = getAllPlants();

  // 筛选正常植物（id 以 102 开头的是正常版本）
  const normalPlants = plants.filter(p => String(p.id).startsWith('102'));

  const options = [];

  for (const plant of normalPlants) {
    const growTime = getPlantGrowTime(plant.id);
    if (growTime <= 0) continue;

    // 如果有商店数据，检查是否可购买
    if (shopGoodsList && shopGoodsList.length > 0) {
      const inShop = shopGoodsList.find(g => g.seedId === plant.seed_id);
      if (!inShop) continue;
    } else {
      // 没有商店数据时，结合 ItemInfo 的等级和 Plant 的土地等级过滤
      // 1. 土地等级
      if (plant.land_level_need > userLevel) continue;
      
      // 2. 种子购买等级 (从 ItemInfo 读取)
      const seedItem = getItemById(plant.seed_id);
      if (seedItem) {
          const itemLevel = Number(seedItem.level) || 0;
          if (itemLevel > userLevel) continue;

          // 3. 过滤非金币作物
          // ItemInfo 中 type=5 是种子，price是价格。
          // 暂时没有明确的货币类型字段，但通常 QB 作物的价格会在其他字段标识，或者我们假设普通等级的都是金币
          // 如果想更严谨，可以排除一些明显的 QB 作物（如果知道 ID 范围）
          // 这里先只做等级过滤
      }
    }

    // 计算效率
    // 使用统一的算法: 20%化肥(最少30s) + 15s操作时间 + 1铲除经验
    const metrics = calculateEfficiency(plant, {
      fertilizerRatio: 0.2,
      fertilizerMinReduction: 30,
      operationTime: 15,
      includeRemovalExp: true
    });

    options.push({
      seedId: plant.seed_id,
      name: plant.name,
      growTime: metrics.growTime,
      growTimeWithFert: metrics.growTimeWithFert,
      expPerHarvest: metrics.totalExp,
      expPerHour: metrics.expPerHour,
      rank: 0,
    });
  }

  // 根据策略排序
  if (strategy === 'advanced') {
    options.sort((a, b) => {
      if (a.expPerHarvest !== b.expPerHarvest) return b.expPerHarvest - a.expPerHarvest;
      return b.expPerHour - a.expPerHour;
    });
  } else {
    options.sort((a, b) => b.expPerHour - a.expPerHour);
  }

  // 设置排名
  options.forEach((opt, i) => { opt.rank = i + 1; });

  return {
    currentLevel: userLevel,
    recommended: options.length > 0 ? options[0] : null,
    options,
    strategy,
  };
}

module.exports = { calculatePlantPlan };

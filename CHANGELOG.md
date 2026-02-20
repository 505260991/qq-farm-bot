# Changelog

## [2.0.1] - 2026-02-20

### Bug Fixes

- **client.js**: 修复 `if (!code)` 缺少花括号的语法错误，原代码无论 `code` 是否存在都会执行 `process.exit(1)`
- **network.js**: 删除 `handleNotify` 中重复的 `ItemNotify` 处理块（第二段因前面已 `return` 永远不会执行，属于死代码）

### Security

- **server/main.js**: 修复静态文件服务器的路径穿越漏洞。原代码直接拼接 `req.url`，攻击者可通过 `/../` 读取 `dist` 目录外的任意文件（如含登录凭证的 `config.json`）。现在通过 `path.resolve` 归一化并校验路径必须在 `dist` 目录下
- **server/main.js**: 补充常见前端资源的 MIME 类型映射（json/png/jpg/svg/ico/woff/woff2），原来只支持 html/js/css

### Optimization

- **farm.js**: `findBestSeed` 内部有一套完整的商店查询+缓存逻辑（约40行），与同文件中的 `ensureShopCache` 完全重复。已改为直接复用 `ensureShopCache()`，消除冗余代码
- **store.js**: 为配置持久化增加 2 秒防抖机制。原来每次 `updateDailyStats`（经验变化/收获等）都同步写文件，高频操作时会产生大量不必要的磁盘 I/O。新增 `saveImmediate()` 确保进程退出前数据落盘
- **utils.js**: 移除未使用的 `require('./status')` 导入

## [2.0.0]

### Features

- 调整扫码登录与 Code 登录的布局顺序，默认展示扫码登录
- 自动记录上次成功登录的凭证，下次启动时尝试自动重连

### Bug Fixes

- 修复好友巡查功能的层级显示，增加虚线连接符，更直观展示其树型关系
- 修复扫码登录提示文字重合的问题
- 修复终端状态栏与日志输出重叠的问题

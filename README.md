<div align="center">

# QQ经典农场助手

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/vue-3.x-4FC08D.svg)](https://vuejs.org/)

**基于 NodeJS + Vue 3 的 QQ/微信经典农场小程序自动化脚本**

通过分析小程序 WebSocket 通信协议（Protocol Buffers），实现全自动农场管理

支持 **扫码登录** · 智能种植策略 · 好友互动 · 任务系统 · 实时日志

[功能特性](#功能特性) · [快速开始](#安装) · [使用文档](#使用方式) · [技术栈](#技术栈)

</div>

---

> **💡 项目说明**
> 本项目融合了多个优秀开源项目的功能，本项目基于[linguo2625469/qq-farm-bot](https://github.com/MoeGrid/qq-farm-bot) 进行重构和功能增强，集成了 [MoeGrid/qq-farm-bot](https://github.com/MoeGrid/qq-farm-bot) 的vue3前端界面设计、[12zyhh/qq-farm-bot](https://github.com/12zyhh/qq-farm-bot) 的页面功能加强以及 [lkeme/QRLib](https://github.com/lkeme/QRLib) 的扫码登录功能，提供更完整、便捷的自动化体验。

## 📸 应用截图

<table>
<tr>
<td width="50%">
<img src="docs/images/首页.png" alt="首页" />
<p align="center"><b>首页 - 扫码登录与状态监控</b></p>
<p align="center">支持扫码直接登录，实时显示农场状态、经验金币</p>
</td>
<td width="50%">
<img src="docs/images/参数配置.png" alt="参数配置" />
<p align="center"><b>设置页 - 参数配置</b></p>
<p align="center">自定义巡查间隔、平台选择，查看所有可种植作物效率排行</p>
</td>
</tr>

</table>

## 📝 更新日志

详见 [CHANGELOG.md](CHANGELOG.md)

## ✨ 功能特性

<table>
<tr>
<td width="50%">

### 🔑 登录与连接
- ✅ **扫码登录** — 支持手机QQ扫码直接登录（新增！）
- ✅ **Code登录** — 支持手动输入 Code 登录（兼容旧方式）
- ✅ **心跳保活** — 自动维持 WebSocket 连接
- ✅ **双平台支持** — QQ 和微信小程序均可使用

### 🌱 自己农场
- ✅ **自动收获** — 检测成熟作物并自动收获
- ✅ **自动铲除** — 自动铲除枯死/收获后的作物残留
- ✅ **智能种植** — 三种策略可选
  - 🚀 快速升级（经验效率最优）
  - 🌟 高级作物（单次经验最高）
  - 🎯 手动选择（自定义种植）
- ✅ **自动施肥** — 种植后自动施放普通肥料加速生长
- ✅ **自动除草** — 检测并清除杂草
- ✅ **自动除虫** — 检测并消灭害虫
- ✅ **自动浇水** — 检测缺水作物并浇水

</td>
<td width="50%">

### 👥 好友农场
- ✅ **好友巡查** — 自动巡查好友农场（主开关）
- ✅ **帮忙操作** — 帮好友浇水/除草/除虫（有经验上限）
- ✅ **自动偷菜** — 偷取好友成熟作物（有经验）

### ⚙️ 系统功能
- ✅ **自动任务** — 自动领取完成的任务奖励
- ✅ **自动同意好友** — 微信同玩好友申请自动同意
- ✅ **邀请码处理** — 启动时自动处理邀请链接
- ✅ **实时状态更新** — 经验/金币/等级实时显示
- ✅ **消息通知** — 游戏内消息通知系统

</td>
</tr>
</table>

### 🎨 桌面应用特性

- 🖥️ **现代化界面** — Vue 3 + Element Plus 暗色主题
- 🎛️ **功能开关** — 每个功能可独立开启/关闭，带详细说明
- 📊 **实时日志** — 查看所有操作记录，支持筛选
- ⚡ **配置持久化** — 自动保存配置，下次启动自动应用

## 📦 安装

### 环境要求

- Node.js >= 16.0.0
- npm 或 pnpm

### 克隆仓库

```bash
git clone https://github.com/Hygge9/qq-farm-bot.git
cd qq-farm-bot
```

## � 使用方式

### 1. 启动项目

```bash
# 1. 安装依赖 (如果尚未安装)
npm install

# 2. 打包web页面
npm run build

# 3. 启动后台服务
npm run serve
```

启动后访问：`http://localhost:3000`

### 2. 登录账号

#### 方式一：扫码登录 (推荐)
1. 在首页点击「扫码登录」标签
2. 使用手机 QQ 扫描屏幕上的二维码
3. 在手机上确认登录
4. 系统将自动获取凭证并连接

#### 方式二：手动 Code 登录
如果扫码登录遇到问题，可以使用传统的抓包方式：
<details>
<summary><b>点击查看抓包教程（Fiddler）</b></summary>

1. 手机安装 Fiddler 证书，配置代理指向电脑
2. 电脑打开 Fiddler，开启 HTTPS 解密
3. 手机打开 QQ/微信 → 进入「经典农场」小程序
4. 在 Fiddler 中筛选请求，找到 WebSocket 连接或登录请求中的 `code` 参数
5. 复制 code 值，粘贴到本工具「Code 登录」输入框中使用

> **💡 提示**：code 具有时效性，短时间内断开重连可复用同一 code，过期后需重新进入小程序获取。

</details>

## 📁 项目结构

<details>
<summary><b>点击展开查看详细结构</b></summary>

```
qq-farm-bot/
├── server/            # NodeJS 后端服务
│   ├── lib/           # 登录库 (QRLib 移植)
│   ├── login.js       # 登录逻辑
│   └── ...
├── web/               # Vue 3 前端界面
├── src/               # 核心业务模块
├── proto/             # Protobuf 协议定义
├── gameConfig/        # 游戏配置数据
└── docs/              # 项目文档
```

</details>

## ⚙️ 配置说明

配置通过界面操作，自动保存到当前目录（`config.json`）：

- **平台选择**：QQ / 微信
- **种植模式**：
  - 🚀 快速升级（经验效率最优，适合快速升级）
  - 🌟 高级作物（单次经验最高，适合高等级玩家）
  - 🎯 手动选择（自定义种植作物）
- **巡查间隔**：自己农场 / 好友农场分别设置
- **功能开关**：每个自动化功能可独立开启/关闭，带详细说明

## ⚠️ 注意事项

- ⏱️ code 具有时效性，扫码登录通常更方便，过期后只需重新扫码即可
- 🔐 同一账号同时只能在一个地方登录，启动本工具后小程序端会被踢下线
- 🌐 建议在稳定的网络环境下运行
- 📚 本项目仅供学习交流使用

## 🛠️ 技术栈

<table>
<tr>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="48" height="48" alt="Node.js" />
<br />Node.js
</td>
<td align="center" width="20%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg" width="48" height="48" alt="Vue 3" />
<br />Vue 3
</td>
<td align="center" width="20%">
<img src="https://element-plus.org/images/element-plus-logo.svg" width="48" height="48" alt="Element Plus" />
<br />Element Plus
</td>
</tr>
</table>

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

[MIT](LICENSE)

## 🙏 致谢

本项目融合了以下优秀开源项目的功能，特此感谢原作者的贡献：

1.  **[MoeGrid/qq-farm-bot](https://github.com/MoeGrid/qq-farm-bot)**
    *   提供了现代化的 Vue 3 前端界面设计、Web 版架构改造。
2.  **[12zyhh/qq-farm-bot](https://github.com/12zyhh/qq-farm-bot)**
    *   提供了功能增强。
3.  **[lkeme/QRLib](https://github.com/lkeme/QRLib)**
    *   提供了强大的 QQ 扫码登录协议实现，使得本项目能够支持便捷的扫码登录功能。

感谢所有为开源社区做出贡献的开发者！

---

<div align="center">

### 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Hygge9/qq-farm-bot&type=Date)](https://star-history.com/#Hygge9/qq-farm-bot&Date)

**如果觉得项目不错，请点个 ⭐️ Star 支持一下！**

</div>

# 极智翻译器 (multi-translator-app)

多平台聊天实时翻译工具（重构版）。目标平台：WhatsApp / Telegram / Messenger / Signal。

## 当前进度

已完成 **P0 骨架 + P1 翻译引擎 + P2 WebView 注入翻译**：

- [x] Electron + Vite + TypeScript 工程骨架（主进程 / preload / 渲染层三端分离）
- [x] 主窗口、系统托盘、单实例锁
- [x] 翻译引擎：Google Translate（主通道）+ OpenAI（兜底）+ 本地缓存
- [x] 手写 SOCKS5 代理客户端（IPv4 / IPv6 / 域名 + 用户名密码认证）
- [x] OpenAI Whisper 语音识别（语音消息转文字）
- [x] 本地 HTTP 翻译服务器 `127.0.0.1:17890`（`/translate`、`/generate-reply`、`/health`）
- [x] 账号管理（增删改查、置顶、隐藏、分类 Tab）
- [x] 手动翻译面板、设置页（OpenAI / Whisper / 代理 / 翻译样式）
- [x] WebView 多账号容器 + 注入翻译脚本
- [x] **自动翻译**：MutationObserver 扫描新消息 → 翻译徽章（淡入动画，样式可配置）
- [x] **发送翻译**：输入框内容一键翻译替换（IME/React 受控输入兼容）
- [x] **AI 智能回复**：基于最近会话生成回复并填入输入框
- [x] **语音消息翻译**：点击语音消息 → Whisper 识别 → 文字徽章
- [x] 设置实时同步到已加载页面（自动翻译开关 / 徽章字号颜色 / 目标语言）

已完成 **P3 多平台适配打磨**：

- [x] 平台登录态检测（`isLoggedIn()`）：未登录不翻译、登录后自动启动
- [x] 注入链路上下文桥接（`contextBridge.exposeInMainWorld('__mtBridge')`），主世界可控制注入脚本
- [x] 翻译失败自动重试一次 + 徽章去重（防 React 重渲染重复翻译）
- [x] 按钮注入延迟重试（进入会话出现输入框后自动注入）
- [x] 账号在线状态指示：侧栏头像状态点（绿=已登录 / 红=未登录 / 灰=未知），4s 轮询
- [x] 端到端冒烟测试通过：本地服务器模拟页面 → 注入脚本 → IPC 翻译 → 徽章注入（全链路验证）

已完成 **P4 Signal 原生集成**：

- [x] Signal Desktop 子进程管理：安装路径检测（常见路径）、自定义 `--user-data-dir` 多账号、优雅退出（WM_CLOSE → kill 兜底）
- [x] Win32 窗口嵌入：`koffi` FFI 调用 `user32`（`FindWindowA`/`SetParent`/`MoveWindow`/`ShowWindow`），将 Signal 原生窗口嵌入右侧面板，随窗口移动/缩放自动重定位
- [x] 崩溃恢复：进程退出/窗口失效检测，自动重启并重新嵌入（最多连续 3 次）
- [x] 状态管理：主进程推送 `SignalState`（启动中/运行中/嵌入中/已嵌入/已崩溃/错误），渲染层实时刷新
- [x] 账号未读徽章（手动设置）+ 状态点
- [x] 嵌入机制端到端冒烟通过：模拟 Signal 窗口 → `SetParent` → `GetAncestor` 验证父窗口已切换 → `MoveWindow` 定位

> 说明：Signal 的未读计数无开放接口（数据库 SQLCipher 加密），当前为手动设置；真实 Signal 窗口标题为 "Signal"，嵌入前请确保已安装 Signal Desktop。

## 快速开始

```bash
npm install
npm run dev        # 开发模式（热更新）
npm run build      # 生产构建
npm start          # 预览构建产物
npm run typecheck  # 类型检查
```

## 目录结构

```
src/
├── main/                    # 主进程
│   ├── index.ts             # 窗口 / 托盘 / 单实例 / 生命周期
│   ├── ipc/                 # IPC handlers（按域拆分）
│   │   ├── accounts.ts      # 账号管理
│   │   ├── translate.ts     # 翻译 / 语音 / 缓存统计
│   │   ├── settings.ts      # 设置 / 连通性测试
│   │   ├── server.ts        # 本地服务器状态
│   │   └── signal.ts        # Signal 子进程（P4 占位）
│   └── services/
│       ├── store.ts         # 轻量 JSON 持久化（userData/data.json）
│       ├── account-manager.ts
│       ├── socks5.ts        # SOCKS5 客户端入口
│       ├── socks5-impl.ts   # SOCKS5 协议实现（RFC 1928/1929）
│       ├── local-server.ts  # 本地 HTTP 翻译服务器 (:17890)
│       └── translator/
│           ├── index.ts     # 翻译主流程（缓存→Google→OpenAI）
│           ├── google.ts    # Google Translate 接口
│           ├── openai.ts    # OpenAI 翻译 / AI 回复 / Whisper 语音识别
│           └── cache.ts     # 翻译缓存（磁盘持久化）
├── preload/index.ts         # contextBridge 暴露 window.api
├── renderer/                # 渲染层（原生 TS + DOM）
│   ├── index.html
│   └── src/
│       ├── main.ts          # UI 主逻辑
│       ├── styles.css
│       └── global.d.ts      # window.api 类型
└── shared/types.ts          # 主/preload/渲染共用契约
```

## 翻译流程

```
WebView 检测消息 → IPC 'translate-text'
  → 缓存命中? 直接返回
  → Google Translate (4s 超时)
  → 失败则 OpenAI (走 SOCKS5 代理, 7s 超时)
  → 写缓存 → 注入翻译徽章
```

> 注意：Google 免费接口对共享 IP 有限流（429），OpenAI Key 是可靠的兜底通道。
> 在设置页配置 `OpenAI API Key` 后，翻译失败会自动降级到 OpenAI。

## 后续开发路线

| 阶段 | 内容 |
|---|---|
| **P3.5** | 真实账号实测：修正各平台 DOM 选择器、处理平台改版、验证语音/AI 回复 |
| **P4.5** | Signal 真实账号实测：多账号切换、崩溃恢复演练、未读计数自动获取方案评估 |
| **P5** | UI 完善：WebView 并发池 / 性能面板 / 图片扫描翻译 |
| **P6** | electron-builder 打包 + 自动更新（koffi 需 asarUnpack） |

## WebView 注入脚本说明

`src/preload/webview-preload.ts`（构建产物 `out/preload/webview-preload.js`）运行在平台页面上下文中：

- **平台适配器** `src/preload/webview/platforms.ts`：WhatsApp / Telegram Web K / Messenger 的消息定位（多候选选择器容错）
- **注入核心** `src/preload/webview/core.ts`：扫描 → 翻译 → 徽章，发送翻译、AI 回复、语音翻译
- **徽章样式** `src/preload/webview/badge.ts`：全局样式注入（字号/颜色可配置，淡入动画）
- 注入脚本保持**自包含**（不产生共享 chunk），兼容 webview sandbox 环境
- 页面调试入口：`window.__mt`（含 `translator`、`adapter`、`config`、`setAutoTranslate()`）

## 打包

### macOS（dmg 安装包）

> ⚠️ **dmg 只能在 macOS 机器上构建**：dmg 镜像依赖系统自带的 `hdiutil`，签名依赖
> `codesign` / `productsign`。Windows / Linux 上 `electron-builder --mac` 无法产出 dmg
> （electron-builder 会直接报 `Build for macOS is supported only on macOS`），
> 请改用下面两种途径之一。

#### 方式一：在 mac 本机构建（推荐，最快）

先把代码带到 mac 上。开发机是 Windows 时，用导出脚本生成**瘦身源码包**
（排除 Windows 专用资源与 node_modules，体积从 ~300MB 降到几十 MB）：

```bash
bash scripts/export-mac-src.sh       # → mac-src.tar.gz
```

拷到 mac（U 盘 / AirDrop / 网盘 / 局域网共享都行）后：

```bash
tar -xzf mac-src.tar.gz
cd multi-translator-app-mac

# 若 mac 上已装 Signal Desktop，先提取 macOS 版内置 Signal（约 100MB，可选）
bash scripts/extract-signal-mac.sh

# 打包
bash scripts/build-mac.sh            # 构建本机架构（最省事）
bash scripts/build-mac.sh arm64      # Apple Silicon（M1/M2/M3…）
bash scripts/build-mac.sh x64        # Intel
bash scripts/build-mac.sh x64 arm64  # 两个架构都出
```

> ⚠️ **不要直接拷 Windows 的 `node_modules`**：koffi 是原生模块，
> `node_modules/koffi/build` 里是当前平台（win32）的二进制，mac 上 require 必失败。
> 在 mac 上重新 `npm install` 即可（脚本会自动装）。

mac 上需要先装：[Node.js 20+](https://nodejs.org/) 与 Xcode 命令行工具（`xcode-select --install`）。

#### 方式二：GitHub Actions（无需 mac 机器）

项目还不是 git 仓库时先初始化并推送：

```bash
git init && git add . && git commit -m "feat: macOS dmg 打包支持"
git remote add origin git@github.com:<你的账号>/<仓库名>.git
git push -u origin main
```

然后：Actions → **Build macOS DMG** → Run workflow，选择 `arm64` / `x64` / `all`；
或推送 tag 自动触发：`git tag v1.1.2-mac && git push --tags`。

工作流跑在 Apple Silicon runner 上：arm64 原生构建，x64 借助 Rosetta 2 交叉构建。


产物在 `release/`：

```
财运亨通翻译器-1.1.2-mac-arm64.dmg   # 拖拽式安装包
财运亨通翻译器-1.1.2-mac-arm64.zip   # 自更新通道用的包（更新器走 zip）
```

安装：打开 dmg → 把 `财运亨通翻译器` 图标拖到窗口里的 `Applications` 快捷方式上，
然后从「启动台」或「应用程序」启动。

首次打开可能提示「无法验证开发者」（未申请 Apple 开发者证书时为 ad-hoc 签名）：

```bash
xattr -cr "/Applications/财运亨通翻译器.app"
```

或者：系统设置 → 隐私与安全性 → 仍要打开。

正式签名与公证（可选，配好后就不再有上述提示）：

1. 把 `package.json` 里 `build.mac.hardenedRuntime` 改回 `true`
   （公证要求 hardened runtime；而 ad-hoc 签名时 entitlements 不被信任，
   开着它反而会让 App 一启动就崩，所以本地自测默认关着）
2. 在仓库 Settings → Secrets 里配置：

| Secret | 说明 |
|---|---|
| `MAC_CERTS` | Developer ID Application 证书（p12）的 base64 |
| `MAC_CERTS_PASSWORD` | p12 密码 |
| `KEYCHAIN_PASSWORD` | 临时钥匙串密码（任意字符串） |
| `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` / `APPLE_TEAM_ID` | 公证用 Apple 账号与应用专用密码 |

配置齐全后 CI 会自动完成签名 + 公证，产出的 dmg 不再有 Gatekeeper 提示。

### Windows

```bash
npm run dist        # NSIS 安装包 + 便携版 → release/
```

## 平台差异

| 能力 | Windows | macOS | 说明 |
|---|---|---|---|
| WhatsApp / Telegram / Messenger / Line | ✅ | ✅ | Messenger 与各平台一样是宿主内的 `<webview>` 网页容器（`webview-preload` 注入翻译），与平台无关 |
| 本地翻译服务、翻译引擎、AI 回复 | ✅ | ✅ | |
| Signal 登录 / 收发 / 翻译注入 | ✅ | ✅ | 子进程 + profile 隔离 + renderer 注入，与平台无关 |
| Signal 窗口与宿主贴合的方式 | user32：设 owner + 去边框，**视觉无边框嵌入** | System Events：进程级显隐 + 位置尺寸同步，**受管浮窗** | 见下方说明 |
| 已安装的 Signal Desktop 外部拉起 | ✅ | ✅ | macOS 走 `/Applications/Signal.app` |

### macOS 上的 Signal

**为什么做不到 Windows 那样的"无边框嵌入"**

Windows 靠 user32 直接改写 Signal 窗口的样式位：设置 owner 关系、清掉 CAPTION/THICKFRAME
再 MoveWindow 到宿主内容区 —— Signal 就变成主窗口里的一块区域。

macOS 没有这套能力：AppKit 不允许把一个 app 的 NSWindow 变成另一个进程的子视图，
更不允许改别人的窗口样式（那属于对方进程私有状态），Carbon 时代的窗口嵌入在 64 位已被移除。
因此 macOS 上 Signal 始终是**独立进程 + 独立窗口**，宿主只能"托管"它。

`services/macos-window-control.ts` 做的事：

| 能力 | 手段 | 是否需要权限 |
|---|---|---|
| 显示 / 隐藏（跟随宿主最小化、切账号、浮层） | System Events 的 `visible of process` | 需要「自动化」 |
| 置前 | `set frontmost` | 需要「自动化」 |
| 位置 / 尺寸贴合宿主内容区 | `window position / size` | 需要「自动化」 |

坐标是现成的：`BrowserWindow.getContentBounds()` 与 System Events 同为**屏幕坐标、左上角原点、
points 单位**，不需要像 Windows 那样乘 `scaleFactor` 换算物理像素。宿主 resize 期间的高频
relocate 由 `queueMacBounds` 做 latest-wins 合并，避免每帧起一个 osascript。

**权限**：首次跑「自动化」相关操作会弹授权，路径是
系统设置 → 隐私与安全性 → 自动化 → 财运亨通翻译器 → System Events。
**不授权 Signal 也能用**（登录、收发、翻译注入都走 profile 与 renderer），只是窗口不会跟随宿主；
首次挂载时会往 `signal-embed.log` 写一条提示。

**内置 macOS 版 Signal**（可选，让用户无需自己安装）：

```bash
bash scripts/extract-signal-mac.sh                        # 从 /Applications/Signal.app
bash scripts/extract-signal-mac.sh ~/Downloads/Signal.dmg # 从官方 dmg
```

产物落在 `resources/mac/`，打包时由 `package.json` 的 `mac.extraResources` 带进
`<App>.app/Contents/Resources`，并由 `build/afterpack.js` 复制 unpacked 的原生模块、
修补 CSP 与自动更新（与 Windows 同一套流程）。

**已知差异**：mac 上 Signal 窗口保留自己的标题栏与窗口 controls，切换窗口/其它应用置前时
可能盖住宿主 UI —— 这是跨进程窗口托管的固有取舍，不是缺陷。

### macOS 上 Signal 的实时翻译

**能用，且与窗口嵌入完全无关。** 翻译走的是另一条链路：

```
宿主 local-server（127.0.0.1:17890/17891）          ← 跨平台，纯 Node http
        ↑ fetch
Signal renderer 里的 signal-renderer-inject.js      ← 由 signal-packaged-patch.ts
        ↑ wc.executeJavaScript（dom-ready）               在子进程主进程注入
Signal 子进程的每个 webContents
```

每一环都是跨平台 Electron / Web API：`app.on('web-contents-created')`、
`session.setPreloads`、`webRequest.onHeadersReceived` 删响应头 CSP、
`protocol.uninterceptProtocol` 解除 Signal 自己对 http 的拦断。窗口是否被"嵌入"
只影响画面里 Signal 在哪显示，不影响任何一个字能不能翻译。

有两点值得单独说明：

1. **不依赖 asar 里被改写的翻译函数。** Windows 那份 `signal-app.asar` 内部曾被改过
   `Jat()`（改走 Google 免登录）；而我们从官方 Signal 现场提取的 **mac 版是原版**。
   但我们自己的实时翻译（回车 CN→EN、收消息 EN→ZH 徽章、AI 智能回复）是注入脚本
   直连宿主 local-server 实现的，`grep` 结果里没有 `Jat` / `googleapis` 的引用，
   所以 asar 改没改过不影响它。受影响的只有 Signal 自带的那个"点击翻译"按钮。
2. **唯一的门槛是 CSP 放行 http:。** Signal 的 `background.html` 用 `<meta>` 声明 CSP，
   `connect-src` 默认只有 `'self' https: wss: …`，会把注入脚本的
   `fetch('http://127.0.0.1:17890/translate')` 拦成 `TypeError: Failed to fetch`
   （界面表现为"Signal 回车翻译失败：failed to fetch"）。
   这条 meta CSP 只能靠 `scripts/patch-signal-asar.js` 在打包时就地改写，
   运行时删不掉 —— 所以 **提取 / 打包时留意日志**：

   ```
   [patch-signal-asar] 已放行 http: @13133485（offset=… ，asar 结构未变）
   [patch-signal-asar] ⚠️  CSP connect-src 未命中：…
   ```

   出现 ⚠️ 就是没有命中，翻译会失效。为此该脚本已从"写死一整行字节串"改为
   锚定 `connect-src` 关键字、并有如下保证：

   - 对缩进、指令顺序、Signal 版本不敏感（两份不同年代的 Signal asar 上均验证命中）；
   - asar 里**不止一处** CSP（主窗口 + 辅助页面），会逐处放行；
   - 靠压缩前导空白保持**总字节数不变**，asar 的 offset/size 结构不动；
   - 幂等：重复执行不会重复写入。
| 自动更新 | NSIS 静默安装 | 解压 zip 替换 `/Applications/*.app` 后重启 | 需要有 `/Applications` 写权限 |

关于 Messenger 网页会话的三个平台适配点（已处理）：

- **userData 已是英文目录**（`app.ts` 固定为 `<appData>/cyht-translator-app`）——FB 依赖的
  Chromium File System / Service Worker 存储在中文路径下会 `LOCK: Access denied`，
  macOS 上落到 `~/Library/Application Support/cyht-translator-app`，同样是英文路径。
- **UA 必须与真实平台一致**——原来三处（全局 `userAgentFallback`、webview 下发配置、
  messenger session）都写死 `Windows NT`，在 mac 上会与 `navigator.platform` 自相矛盾，
  反而更容易被 FB 判为可疑环境（表现为能登录但消息一直加载中 / PIN 验证卡住）。
  现已统一按 `process.platform` 生成对应平台的纯净 Chrome UA，Windows 输出字符串一字未变。
- **WebGL**：Messenger 的 E2EE / PIN 依赖 WebGL，主进程 `--enable-unsafe-swiftshader`
  是跨平台开关，mac 上同样生效。

残留的 `services/messenger-window-manager.ts`（独立子进程 + user32 嵌入）是当前 Messenger
主路径的**废弃实现**，仅在删除账号时兜底清理遗留子进程；mac 上它不做窗口嵌入。

> 更新后台适配：客户端按平台上报 `platform=windows` / `macos` / `linux`，
> mac 平台请返回 **zip** 包（`release/` 里 mac 架构那一版，内含 `.app`，非 dmg），
> 本地缓存文件名形如 `cyht-mac-arm64-1.1.2.zip`。返回 exe 会被拒绝安装。

## 数据存储位置

- Windows：`%APPDATA%/cyht-translator-app/`
- macOS：`~/Library/Application Support/cyht-translator-app/`

（`data.json`、翻译缓存、Signal profile、各服务日志都在该目录下）

## 许可

内置 Signal 为 AGPL-3.0 开源软件（若随包分发 Signal 需遵守其开源协议）。本工程亦采用 AGPL-3.0。

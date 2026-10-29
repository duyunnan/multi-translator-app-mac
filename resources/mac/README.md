# macOS 内置 Signal 资源目录

这里放 **macOS 版** Signal Desktop 的 `signal-app.asar` 与 `signal-app.asar.unpacked`，
由 `scripts/extract-signal-mac.sh` 从官方 Signal 安装包提取生成。

Windows 版的同名文件在项目根 `resources/` 下，两者并存互不覆盖：

```
resources/signal-app.asar                ← Windows（prebuilds/win32-x64）
resources/mac/signal-app.asar            ← macOS（prebuilds/darwin-arm64 + darwin-x64）
```

打包时 `package.json` 的 `mac.extraResources` 只从这里取文件，且配了 `filter`，
**目录为空也能正常构建**（只是 mac 包不含内置 Signal，运行时会回退到用户已安装的
`/Applications/Signal.app`，见 `findSignalExe()`）。

生成：

```bash
bash scripts/extract-signal-mac.sh                       # 从已安装的 /Applications/Signal.app
bash scripts/extract-signal-mac.sh ~/Downloads/Signal.dmg # 从官方 dmg
```

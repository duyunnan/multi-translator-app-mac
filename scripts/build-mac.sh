#!/usr/bin/env bash
#
# macOS 打包脚本：产出 dmg 安装包 + zip 压缩包
#
# 用法（只能在 macOS 上执行，dmg 依赖 Apple 的 hdiutil / codesign）：
#   bash scripts/build-mac.sh            # 构建本机架构（推荐，最快）
#   bash scripts/build-mac.sh arm64      # Apple Silicon（M 系列）
#   bash scripts/build-mac.sh x64        # Intel
#   bash scripts/build-mac.sh x64 arm64  # 同时构建两个架构
#
# 产物目录：release/
#   财运亨通翻译器-<version>-mac-arm64.dmg
#   财运亨通翻译器-<version>-mac-arm64.zip
#
# 可选：配置 Apple 开发者证书后做正式签名 + 公证（否则为 ad-hoc 签名），
# 用法见 README「macOS 打包」一节。
set -euo pipefail

cd "$(dirname "$0")/.."

# ---- 前置校验 ----
if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "❌ macOS 的 dmg 只能在 macOS 上构建："
  echo "   - dmg 镜像需要系统自带的 hdiutil"
  echo "   - app bundle 签名需要 codesign / productsign"
  echo "   Windows / Linux 请改用 GitHub Actions：.github/workflows/build-mac.yml"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ 未检测到 node，请先安装 Node.js 20+"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if (( NODE_MAJOR < 20 )); then
  echo "❌ Node 版本过低（当前 $(node -v)），electron-builder 26 需要 Node 20+"
  exit 1
fi

ARCHS=("$@")
if [ ${#ARCHS[@]} -eq 0 ]; then
  ARCHS=("native")
fi

for arch in "${ARCHS[@]}"; do
  case "$arch" in
    native) FLAG=() ; LABEL="$(uname -m) (本机)" ;;
    x64)    FLAG=(--x64) ;    LABEL="Intel x64" ;;
    arm64)  FLAG=(--arm64) ;  LABEL="Apple Silicon arm64" ;;
    *) echo "❌ 未知架构：$arch（可选 native / x64 / arm64）"; exit 1 ;;
  esac

  echo ""
  echo "=================================================================="
  echo "  开始构建 ${LABEL}"
  echo "=================================================================="

  # 1) 安装依赖。koffi 是原生模块（含 install 脚本），首次在 macOS 上需要编译/取预编译包
  if [ ! -d node_modules ]; then
    echo "==> 安装依赖"
    npm install
  fi

  # 2) 生产构建（out/main、out/preload、out/renderer）
  echo "==> electron-vite build"
  npm run build

  # 3) 内置 Signal 资源检查：有就打进包里，没有则回退到用户已安装的 Signal.app
  if [ -f "resources/mac/signal-app.asar" ]; then
    echo "==> 检测到 macOS 版内置 Signal，将随包分发"
  else
    echo "==> resources/mac/signal-app.asar 不存在：本机打包不内置 Signal"
    echo "    （App 会回退使用用户已安装的 /Applications/Signal.app）"
    echo "    如需内置，先执行：bash scripts/extract-signal-mac.sh"
  fi

  # 4) 打包 dmg + zip
  echo "==> electron-builder --mac ${FLAG[*]:-}"
  npx electron-builder --mac ${FLAG[@]+"${FLAG[@]}"} dmg zip

  echo "==> ${LABEL} 构建完成"
done

echo ""
echo "=================================================================="
echo "  产物（release/）"
echo "=================================================================="
ls -lh release/*.dmg release/*.zip 2>/dev/null || true

SIGNED=no
if [[ -n "${CSC_LINK:-}${CSC_NAME:-}" ]]; then
  SIGNED=yes
fi
echo ""
if [[ "$SIGNED" == "yes" ]]; then
  echo "✅ 已使用证书签名。若要公证，请看 README「公证」步骤。"
else
  echo "⚠️  本次为 ad-hoc 签名（未配置开发者证书）。安装后首次打开若提示"
  echo "   「无法验证开发者」，请在终端执行（把 App 名换成实际名称）："
  echo "     xattr -cr \"/Applications/财运亨通翻译器.app\""
  echo "   或到 系统设置 → 隐私与安全性 → 仍要打开。"
fi

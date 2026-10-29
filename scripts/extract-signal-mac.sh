#!/usr/bin/env bash
#
# 提取 macOS 版内置 Signal Desktop 资源到 resources/mac/
#
# 用法（只能在 macOS 上跑）：
#   bash scripts/extract-signal-mac.sh                          # 从已安装的 /Applications/Signal.app
#   bash scripts/extract-signal-mac.sh ~/Downloads/Signal.dmg   # 从官方 dmg
#   bash scripts/extract-signal-mac.sh /Volumes/Signal/Signal.app
#
# 产物：
#   resources/mac/signal-app.asar              (约 90~100MB)
#   resources/mac/signal-app.asar.unpacked     (原生模块，darwin-x64 + darwin-arm64)
#
# 之后 mac 打包（scripts/build-mac.sh / GitHub Actions）会自动把它带进包里。
set -euo pipefail

cd "$(dirname "$0")/.."

SRC="${1:-/Applications/Signal.app}"
DEST="resources/mac"
MOUNT=""

cleanup() {
  if [ -n "$MOUNT" ]; then
    hdiutil detach "$MOUNT" -quiet || true
  fi
}
trap cleanup EXIT

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "❌ 该脚本只能从 macOS 版 Signal 提取，需在 macOS 上运行"
  exit 1
fi

# dmg → 挂载后取出里面的 Signal.app
if [[ "$SRC" == *.dmg ]]; then
  echo "==> 挂载 $SRC"
  MOUNT="$(hdiutil attach -nobrowse -readonly "$SRC" | awk '/\/Volumes\// {print $NF; exit}')"
  if [ -z "$MOUNT" ]; then
    echo "❌ 挂载失败"
    exit 1
  fi
  SRC="$MOUNT/Signal.app"
fi

if [ ! -d "$SRC" ]; then
  echo "❌ 找不到 Signal：$SRC"
  echo "   请先安装 Signal Desktop（https://signal.org/download/）后再试，或把 Signal.dmg 路径传进来。"
  exit 1
fi

RES="$SRC/Contents/Resources"
ASAR="$RES/app.asar"
UNPACKED="$RES/app.asar.unpacked"

if [ ! -f "$ASAR" ]; then
  echo "❌ $SRC 里没有 app.asar（不是标准的 Signal Desktop 包）"
  exit 1
fi

# 磁盘空间粗检：asar + unpacked 通常需要 400MB 以上余量
AVAIL_KB="$(df -k . | awk 'NR==2 {print $4}')"
if [ "${AVAIL_KB:-0}" -lt 500000 ]; then
  echo "⚠️  当前目录可用空间不足 500MB，提取可能失败"
fi

echo "==> 复制到 $DEST"
mkdir -p "$DEST"
cp -R "$ASAR" "$DEST/signal-app.asar"
if [ -d "$UNPACKED" ]; then
  rm -rf "$DEST/signal-app.asar.unpacked"
  cp -R "$UNPACKED" "$DEST/signal-app.asar.unpacked"
else
  echo "⚠️  没有 app.asar.unpacked，Signal 的原生模块可能打包在 asar 内部（较新版本会这样）"
fi

# 校验：必须有 macOS 的原生模块 prebuilds，否则 Signal 启动即崩
PREBUILD="$DEST/signal-app.asar.unpacked/node_modules/@signalapp/libsignal-client/prebuilds"
if [ -d "$PREBUILD" ]; then
  echo "==> 原生模块 prebuilds："
  ls -1 "$PREBUILD"
  if [ ! -d "$PREBUILD/darwin-arm64" ] && [ ! -d "$PREBUILD/darwin-x64" ]; then
    echo "⚠️  没有 darwin-arm64 / darwin-x64 的 prebuilds，可能是 Linux/Windows 版的 Signal"
  fi
fi

# 就地修补 CSP 与自动更新（幂等；afterpack 打包时也会再做一次）
echo "==> 修补 signal-app.asar（CSP 放行 http: + 关闭自动更新）"
node scripts/patch-signal-asar.js "$DEST/signal-app.asar" || {
  echo "⚠️  修补未完全命中（Signal 版本可能变了），可继续构建，但需实测 Signal 能起来"
}

echo ""
du -sh "$DEST/signal-app.asar" "$DEST/signal-app.asar.unpacked" 2>/dev/null || true
echo "✅ 完成。现在可以跑 bash scripts/build-mac.sh 打包。"
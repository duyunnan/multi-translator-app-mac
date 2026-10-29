#!/usr/bin/env bash
#
# 生成「带到 mac 上构建」的精简源码包。
#
# 用途：dmg 只能在 macOS 上产出，开发机是 Windows 时，用它打包一份瘦身源码，
#       拷到 mac 上解压后跑 scripts/build-mac.sh 即可。
#
# 用法：bash scripts/export-mac-src.sh          # 生成 mac-src.tar.gz
#       bash scripts/export-mac-src.sh /tmp/x   # 自定义输出路径
#
# 排除项说明：
#   - node_modules：koffi 是原生模块，Windows 的 .node 在 mac 上加载必然失败，
#     必须在 mac 上重新 npm install（build-mac.sh 会装）
#   - resources/signal-app.asar*：Windows 版内置 Signal（prebuilds/win32-x64），
#     mac 打包用不到，且体积上百 MB
#   - release/、.git/、日志等
set -euo pipefail

cd "$(dirname "$0")/.."

OUT="${1:-mac-src.tar.gz}"

echo "==> 打包精简源码包"
tar -czf "$OUT" \
  --exclude='./node_modules' \
  --exclude='./release' \
  --exclude='./.git' \
  --exclude='./mac-src.tar.gz' \
  --exclude='resources/signal-app.asar' \
  --exclude='resources/signal-app.asar.unpacked' \
  --exclude='resources/signal-app.asar.bak-*' \
  --exclude='resources/signal-app.asar.unpacked.bak-*' \
  --exclude='*.log' \
  .

SIZE="$(du -h "$OUT" 2>/dev/null | cut -f1)"
echo ""
echo "✅ 已生成 ${OUT}（${SIZE}）"
echo ""
echo "拷到 mac 上之后："
echo "   tar -xzf $(basename "$OUT")"
echo "   cd $(basename "$PWD")"
echo "   bash scripts/extract-signal-mac.sh   # 若 mac 上已装 Signal Desktop，先提取内置 Signal"
echo "   bash scripts/build-mac.sh arm64      # M 系列用 arm64；Intel 用 x64"
echo ""
echo "产物在 release/ 下：<产品名>-<版本>-mac-arm64.dmg"
echo "（不带 Signal 资源也能打出来，只是 Signal 功能会回退到用户已安装的 /Applications/Signal.app）"

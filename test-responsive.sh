#!/bin/bash

# BlockOS 响应式测试启动脚本

echo "🚀 BlockOS 响应式测试启动脚本"
echo "================================"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 检测到未安装依赖，正在安装..."
    bun install
    echo ""
fi

# 启动开发服务器
echo "🔧 启动开发服务器..."
echo ""
echo "访问地址："
echo "  本地: http://localhost:5173"
echo "  局域网: http://$(hostname -I | awk '{print $1}'):5173"
echo ""
echo "📚 测试文档："
echo "  测试文档中心: docs/tests/README.md"
echo "  快速开始: docs/tests/start-responsive-test.md"
echo "  测试矩阵: docs/tests/responsive-test-matrix.md"
echo ""
echo "💡 提示："
echo "  - 按 Ctrl+C 停止服务器"
echo "  - 在移动设备上访问局域网地址进行真机测试"
echo "  - 使用浏览器开发者工具进行模拟测试"
echo ""
echo "================================"
echo ""

# 启动开发服务器
bun run dev

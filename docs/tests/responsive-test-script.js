/**
 * BlockOS 响应式自动化测试脚本
 * 
 * 使用方法：
 * 1. 在浏览器中打开 BlockOS (http://localhost:5173)
 * 2. 打开开发者工具控制台 (F12)
 * 3. 复制粘贴此脚本并运行
 * 4. 查看测试结果
 */

(function() {
  console.log('🚀 BlockOS 响应式测试开始...\n');

  // 测试配置
  const testViewports = [
    { name: '桌面 (1920×1080)', width: 1920, height: 1080, type: 'desktop' },
    { name: '桌面 (1440×900)', width: 1440, height: 900, type: 'desktop' },
    { name: 'iPad Pro 横屏 (1366×1024)', width: 1366, height: 1024, type: 'tablet' },
    { name: 'iPad Pro 竖屏 (1024×1366)', width: 1024, height: 1366, type: 'tablet' },
    { name: 'iPad 横屏 (1024×768)', width: 1024, height: 768, type: 'tablet' },
    { name: 'iPad 竖屏 (768×1024)', width: 768, height: 1024, type: 'tablet' },
    { name: 'iPhone 15 Pro Max 竖屏 (430×932)', width: 430, height: 932, type: 'mobile' },
    { name: 'iPhone 15 Pro Max 横屏 (932×430)', width: 932, height: 430, type: 'mobile' },
    { name: 'iPhone SE 竖屏 (375×667)', width: 375, height: 667, type: 'mobile' },
  ];

  // 测试结果
  const results = [];

  // 辅助函数：获取元素计算样式
  function getComputedStyle(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;
    return window.getComputedStyle(element);
  }

  // 辅助函数：检查元素是否可见
  function isVisible(selector) {
    const element = document.querySelector(selector);
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  // 辅助函数：获取元素尺寸
  function getElementSize(selector) {
    const element = document.querySelector(selector);
    if (!element) return null;
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  // 测试函数：验证布局
  function testLayout(viewport) {
    const tests = [];

    // ActivityBar 测试
    const activityBarStyle = getComputedStyle('.activity-bar');
    if (activityBarStyle) {
      const activityBarWidth = parseFloat(activityBarStyle.width);
      const activityBarHeight = parseFloat(activityBarStyle.height);
      
      if (viewport.type === 'desktop') {
        tests.push({
          name: 'ActivityBar 宽度 (桌面)',
          expected: '48px',
          actual: `${activityBarWidth}px`,
          pass: activityBarWidth === 48
        });
      } else if (viewport.type === 'tablet') {
        tests.push({
          name: 'ActivityBar 宽度 (平板)',
          expected: '56px',
          actual: `${activityBarWidth}px`,
          pass: activityBarWidth === 56
        });
      } else if (viewport.type === 'mobile') {
        tests.push({
          name: 'ActivityBar 高度 (手机)',
          expected: '60px',
          actual: `${activityBarHeight}px`,
          pass: activityBarHeight === 60
        });
      }
    }

    // Sidebar 测试
    const sidebarVisible = isVisible('.sidebar-panel');
    const sidebarStyle = getComputedStyle('.sidebar-panel');
    if (sidebarStyle) {
      const sidebarPosition = sidebarStyle.position;
      
      if (viewport.type === 'desktop') {
        tests.push({
          name: 'Sidebar 定位 (桌面)',
          expected: 'relative',
          actual: sidebarPosition,
          pass: sidebarPosition === 'relative' || sidebarPosition === 'static'
        });
      } else {
        tests.push({
          name: 'Sidebar 定位 (平板/手机)',
          expected: 'fixed',
          actual: sidebarPosition,
          pass: sidebarPosition === 'fixed'
        });
      }
    }

    // ResizeHandle 测试
    const resizeHandleVisible = isVisible('.resize-handle');
    if (viewport.type === 'desktop') {
      tests.push({
        name: 'ResizeHandle 可见性 (桌面)',
        expected: 'visible',
        actual: resizeHandleVisible ? 'visible' : 'hidden',
        pass: resizeHandleVisible
      });
    } else {
      tests.push({
        name: 'ResizeHandle 可见性 (平板/手机)',
        expected: 'hidden',
        actual: resizeHandleVisible ? 'visible' : 'hidden',
        pass: !resizeHandleVisible
      });
    }

    // RightPanel 测试
    const rightPanelStyle = getComputedStyle('.right-panel');
    if (rightPanelStyle) {
      const rightPanelPosition = rightPanelStyle.position;
      
      if (viewport.type === 'desktop') {
        tests.push({
          name: 'RightPanel 定位 (桌面)',
          expected: 'relative',
          actual: rightPanelPosition,
          pass: rightPanelPosition === 'relative' || rightPanelPosition === 'static'
        });
      } else {
        tests.push({
          name: 'RightPanel 定位 (平板/手机)',
          expected: 'fixed',
          actual: rightPanelPosition,
          pass: rightPanelPosition === 'fixed'
        });
      }
    }

    // 触摸目标尺寸测试（平板/手机）
    if (viewport.type !== 'desktop') {
      const toolbarBtnSize = getElementSize('.toolbar-btn');
      if (toolbarBtnSize) {
        tests.push({
          name: 'Toolbar 按钮尺寸',
          expected: '≥ 40px',
          actual: `${toolbarBtnSize.width}×${toolbarBtnSize.height}px`,
          pass: toolbarBtnSize.width >= 40 && toolbarBtnSize.height >= 40
        });
      }

      const tabSize = getElementSize('.tab');
      if (tabSize) {
        tests.push({
          name: '标签页高度',
          expected: '≥ 44px',
          actual: `${tabSize.height}px`,
          pass: tabSize.height >= 44
        });
      }
    }

    return tests;
  }

  // 运行测试
  console.log('📋 测试视口列表：');
  testViewports.forEach((vp, i) => {
    console.log(`  ${i + 1}. ${vp.name} (${vp.width}×${vp.height})`);
  });
  console.log('');

  // 注意：浏览器无法通过 JavaScript 直接改变窗口大小
  // 此脚本仅测试当前视口
  const currentWidth = window.innerWidth;
  const currentHeight = window.innerHeight;
  
  console.log(`🔍 当前视口: ${currentWidth}×${currentHeight}`);
  
  // 判断当前视口类型
  let currentType = 'desktop';
  if (currentWidth < 768) {
    currentType = 'mobile';
  } else if (currentWidth < 1280) {
    currentType = 'tablet';
  }
  
  console.log(`📱 设备类型: ${currentType}`);
  console.log('');

  // 运行当前视口测试
  const currentViewport = {
    name: `当前视口 (${currentWidth}×${currentHeight})`,
    width: currentWidth,
    height: currentHeight,
    type: currentType
  };

  const tests = testLayout(currentViewport);
  
  console.log('✅ 测试结果：');
  console.log('━'.repeat(80));
  
  let passCount = 0;
  let failCount = 0;
  
  tests.forEach(test => {
    const icon = test.pass ? '✅' : '❌';
    const status = test.pass ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.name}`);
    console.log(`   期望: ${test.expected}`);
    console.log(`   实际: ${test.actual}`);
    console.log(`   状态: ${status}`);
    console.log('');
    
    if (test.pass) {
      passCount++;
    } else {
      failCount++;
    }
  });
  
  console.log('━'.repeat(80));
  console.log(`📊 测试统计: ${passCount} 通过, ${failCount} 失败, 总计 ${tests.length} 项`);
  console.log(`📈 通过率: ${((passCount / tests.length) * 100).toFixed(1)}%`);
  console.log('');

  // 提供手动测试建议
  console.log('💡 手动测试建议：');
  console.log('');
  console.log('1. 使用浏览器开发者工具的设备模拟器测试不同视口');
  console.log('2. 在真机上测试触摸交互（滑动手势、长按菜单）');
  console.log('3. 测试横竖屏切换流畅度');
  console.log('4. 测试主题切换（Default / Newsprint）');
  console.log('5. 测试核心功能路径（AI 对话 → 写入编辑器 → Block 捕获）');
  console.log('');

  // 提供快速测试命令
  console.log('🔧 快速测试命令：');
  console.log('');
  console.log('// 检查 useViewport Hook 状态');
  console.log('console.log(window.__VIEWPORT_STATE__);');
  console.log('');
  console.log('// 检查响应式样式是否加载');
  console.log('console.log([...document.styleSheets].some(s => s.href?.includes("responsive.css")));');
  console.log('');
  console.log('// 检查触摸增强样式是否加载');
  console.log('console.log([...document.styleSheets].some(s => s.href?.includes("touch-enhancements.css")));');
  console.log('');

  console.log('✨ 测试完成！');
})();

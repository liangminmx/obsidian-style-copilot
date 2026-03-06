# Style Copilot - Obsidian 插件

<div align="center">

🚀 **智能写作风格学习与应用插件** • 🎨 **一键改写笔记风格** • 💬 **微信格式导出**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Obsidian](https://img.shields.io/badge/Obsidian-Plugin-purple)](https://obsidian.md)

</div>

## ✨ 核心功能

### 🎯 **智能样式学习**
- **URL抓取分析**：从任何文章URL学习写作风格
- **智能解析**：自动提取文章内容，去除广告和干扰元素
- **样式分析**：分析句式结构、段落模式、常用词汇
- **模板保存**：将分析结果保存为可重复使用的样式模板

### 📝 **一键样式应用**
- **智慧改写**：保持原意，改变表达方式
- **风格继承**：将学到的风格应用到你的笔记
- **智能保留**：保持标题、代码块和链接不变
- **批量处理**：支持对整个笔记进行风格转换

### 💬 **微信格式导出**
- **格式转换**：Markdown → 微信友好格式
- **自动优化**：处理特殊字符、链接格式
- **剪贴板**：一键复制到剪贴板，直接粘贴到微信
- **保持可读性**：转换为微信平台最佳显示格式

### 📊 **样式管理**
- **模板库**：管理所有已保存的样式模板
- **预览删除**：查看样式详情，删除不再需要的模板
- **元数据**：显示样式来源、创建时间、使用次数

## 🚀 快速开始

### 方法一：手动安装（推荐）

1. **下载最新版本**：
   ```bash
   # 从Release页面下载
   https://github.com/liangminmx/obsidian-style-copilot/releases
   ```

2. **安装到Obsidian**：
   - 在Obsidian库中创建文件夹：`.obsidian/plugins/style-copilot/`
   - 复制以下文件到该文件夹：
     - `main.js` (插件主文件)
     - `manifest.json` (插件清单)
     - `styles.css` (样式文件)

3. **启用插件**：
   - 重启Obsidian
   - 进入 `设置 → 社区插件 → 已安装插件`
   - 启用 "Style Copilot"

### 方法二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/liangminmx/obsidian-style-copilot.git

# 进入项目目录
cd obsidian-style-copilot

# 安装依赖
npm install

# 构建插件
npm run build

# 构建产物位于项目根目录：
# - main.js
# - manifest.json
# - styles.css
```

## 📖 详细使用指南

### 1. 学习写作风格

**场景**：想模仿某篇文章的写作风格

**操作步骤**：
```markdown
1. 复制文章的URL
2. 打开Obsidian命令面板 (Ctrl/Cmd + P)
3. 输入"从URL学习写作风格"
4. 粘贴URL并确认
5. 等待分析完成
```

**示例**：
```
URL: https://example.com/article
分析内容：提取文章正文，分析写作特点
保存为模板：示例文章风格
```

### 2. 应用样式到笔记

**场景**：将笔记改写为某种特定风格

**操作步骤**：
```markdown
1. 打开要改写的笔记
2. 打开命令面板 (Ctrl/Cmd + P)
3. 输入"应用样式到当前笔记"
4. 从列表中选择一个样式模板
5. 确认应用，查看改写结果
```

**示例**：
```
原笔记：我的技术笔记...
应用后：一种优雅的技术随笔...
```

### 3. 导出为微信格式

**场景**：将笔记分享到微信公众号

**操作步骤**：
```markdown
1. 打开要分享的笔记
2. 打开命令面板 (Ctrl/Cmd + P)
3. 输入"导出为微信格式"
4. 自动复制到剪贴板
5. 粘贴到微信编辑器
```

**转换规则**：
- `# 标题` → 微信兼容标题
- `- 列表项` → 微信格式列表
- `\`\`\`代码块\`\`\` → 代码片段
- `[链接](url)` → 纯文本链接

### 4. 管理样式模板

**操作步骤**：
```markdown
1. 打开命令面板 (Ctrl/Cmd + P)
2. 输入"管理样式模板"
3. 查看所有已保存的样式
4. 删除不需要的样式
```

## ⚙️ 配置选项

在 `设置 → Style Copilot` 中可以配置：

### 基本设置
- **API端点**：用于高级样式分析的API地址
- **默认样式**：应用样式时的首选模板
- **自动保存**：学习新样式后自动保存

### 功能开关
- **微信导出**：启用/禁用微信格式导出功能
- **自动复制**：导出时是否自动复制到剪贴板
- **显示通知**：操作完成时显示提示

### 高级选项
- **请求超时**：URL抓取的超时时间（秒）
- **最大内容长度**：限制分析内容的长度
- **排除域名**：跳过某些域名的URL分析

## 🛠️ 开发者指南

### 项目结构
```
obsidian-style-copilot/
├── src/
│   └── main.ts          # 插件主文件（617行）
├── main.js              # 构建输出
├── manifest.json        # 插件清单
├── styles.css           # 样式文件
├── package.json         # 依赖配置
├── tsconfig.json        # TypeScript配置
├── .eslintrc.json      # ESLint配置
└── README.md           # 本文档
```

### 开发命令
```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run typecheck

# 代码规范检查
npm run lint

# 格式化代码
npm run format
```

### 架构说明
- **插件主类**：`StyleCopilotPlugin` - 插件入口
- **模态框**：
  - `UrlInputModal` - URL输入对话框
  - `StyleSelectionModal` - 样式选择界面
  - `StyleManagerModal` - 样式管理界面
- **设置页面**：`StyleCopilotSettingTab` - 配置界面
- **样式分析器**：`analyzeStyle` - 核心算法

### API接口
```typescript
// 核心方法
learnStyleFromUrl(url: string): Promise<void>
applyStyleToNote(styleName: string): Promise<void>
exportToWeChat(): void
manageStyles(): void
```

## 📊 版本历史

### v0.2.0 (2026-03-06)
- ✨ **核心功能完整实现**
- ✨ 智能样式学习引擎
- ✨ 样式应用算法优化
- ✨ 微信导出功能完善
- ✨ 样式管理界面
- ✨ 完整的TypeScript类型定义
- 🐛 修复ESLint所有警告和错误

### v0.1.0 (2026-03-06)
- 🎉 **初始版本发布**
- ✨ 基础插件框架
- ✨ 命令注册和设置界面
- ✨ 基本的样式学习功能

## ❓ 常见问题

### Q1: 支持哪些网站？
**A**：支持大多数新闻、博客、技术文章网站。如果遇到解析问题，请提交Issue。

### Q2: 样式分析准确吗？
**A**：插件分析句式结构和常用词汇，对于大多数文章风格识别准确。更精准的分析需要AI模型支持。

### Q3: 会影响原笔记内容吗？
**A**：不会，应用样式时会创建改写副本，原笔记保持不变。

### Q4: 微信导出后还能编辑吗？
**A**：导出的是文本格式，可以在微信编辑器中进行再编辑。

### Q5: 支持批量处理吗？
**A**：目前支持单个笔记处理，批量功能在开发计划中。

## 🤝 贡献指南

### 贡献流程
1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -m '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建Pull Request

### 开发规范
- 使用 TypeScript 编写代码
- 遵循 ESLint 规范
- 添加详细的代码注释
- 编写单元测试（计划中）

### 需要帮助？
- 🐛 **报告Bug**：[创建Issue](https://github.com/liangminmx/obsidian-style-copilot/issues)
- 💡 **功能请求**：[提交功能建议](https://github.com/liangminmx/obsidian-style-copilot/issues)
- ❓ **使用问题**：[查看Wiki](https://github.com/liangminmx/obsidian-style-copilot/wiki)（建设中）

## 📄 许可证

本项目采用 [MIT许可证](LICENSE)。

```
MIT License

Copyright (c) 2026 liangminmx

Permission is hereby granted...
```

## 👥 作者和维护者

**liangminmx**
- GitHub: [@liangminmx](https://github.com/liangminmx)
- 邮箱：liangminmx@example.com
- 主要维护者

### 特别感谢
- [Obsidian](https://obsidian.md) - 优秀的笔记软件
- 所有贡献者和用户

## 🌟 支持项目

如果你觉得这个插件有用，请考虑：

1. **给个⭐️Star** - 让更多用户看到
2. **分享给朋友** - 帮助推广
3. **提交反馈** - 帮助改进
4. **贡献代码** - 一起完善功能

---

<div align="center">

**Made with ❤️ for the Obsidian community**

[🚀 开始使用](#快速开始) • [📖 详细文档](#详细使用指南) • [💬 反馈交流](https://github.com/liangminmx/obsidian-style-copilot/issues)

</div>

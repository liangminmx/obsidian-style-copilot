# Style Copilot - Obsidian Plugin

🤖 一个智能的Obsidian插件，用于学习文章写作风格并应用到你的笔记中，支持微信格式导出。

## ✨ 功能特性

- **🎯 样式学习**：从URL学习文章的写作风格
- **📝 样式应用**：将学到的样式应用到当前笔记
- **💬 微信导出**：一键导出为微信格式
- **⚙️ 灵活配置**：支持自定义API端点和样式模板

## 📦 安装

### 手动安装

1. 下载 `main.js`, `manifest.json`, `styles.css` 文件
2. 在Obsidian库中创建文件夹：`.obsidian/plugins/style-copilot/`
3. 将下载的文件复制到该文件夹
4. 重启Obsidian
5. 在设置中启用 "Style Copilot" 插件

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/liangminmx/obsidian-style-copilot.git

# 安装依赖
cd obsidian-style-copilot
npm install

# 构建
npm run build
```

## 🚀 使用方法

### 1. 学习写作风格

- 打开命令面板（Ctrl/Cmd + P）
- 输入 "从URL学习写作风格"
- 输入文章URL
- 插件会自动分析并保存样式模板

### 2. 应用样式到笔记

- 打开需要应用样式的笔记
- 打开命令面板
- 输入 "应用样式到当前笔记"
- 选择要应用的样式模板

### 3. 导出为微信格式

- 打开笔记
- 打开命令面板
- 输入 "导出为微信格式"
- 内容会自动复制到剪贴板

## ⚙️ 配置

在设置中可以配置：

- **API端点**：用于样式分析的API地址
- **默认样式**：默认应用的写作样式
- **微信导出**：启用/禁用微信导出功能

## 🛠️ 开发

```bash
# 类型检查
npm run typecheck

# 代码规范检查
npm run lint

# 格式化代码
npm run format

# 开发模式（监听文件变化）
npm run dev
```

## 📝 版本历史

### v0.1.0 (2026-03-06)

- ✨ 初始版本发布
- ✨ 基础样式学习功能
- ✨ 样式应用功能
- ✨ 微信格式导出
- ✨ 完整的设置界面

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 👤 作者

**liangminmx**
- GitHub: [@liangminmx](https://github.com/liangminmx)

---

**如果这个插件对你有帮助，请给个⭐️Star支持一下！**

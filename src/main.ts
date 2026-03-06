import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, TFile } from 'obsidian';

// ==================== 类型定义 ====================

interface StyleTemplate {
    name: string;
    createdAt: number;
    source: string;
    patterns: StylePatterns;
}

interface StylePatterns {
    sentenceLength: number[];
    vocabulary: string[];
    paragraphStructure: string[];
    tone: string;
    keywords: string[];
    // 新增：主题和视觉样式
    themeStyle?: ThemeStyle;
    backgroundGrid?: BackgroundGrid;
}

interface ThemeStyle {
    // 配色方案
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    backgroundColor: string;
    accentColor: string;
    
    // 字体样式
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    
    // 排版样式
    textAlign: string;
    textIndent: string;
    paragraphSpacing: string;
    
    // 装饰元素
    borderRadius: string;
    boxShadow: string;
    borderStyle: string;
}

interface BackgroundGrid {
    // 网格类型
    type: 'none' | 'dots' | 'lines' | 'squares' | 'custom';
    
    // 网格颜色
    color: string;
    opacity: number;
    
    // 网格间距
    spacing: string;
    size: string;
    
    // 网格样式
    pattern: string;
    backgroundImage?: string;
}

interface StyleCopilotSettings {
    apiEndpoint: string;
    apiKey: string;
    defaultStyle: string;
    enableWeChatExport: boolean;
    savedStyles: StyleTemplate[];
}

const DEFAULT_SETTINGS: StyleCopilotSettings = {
    apiEndpoint: 'https://api.openai.com/v1',
    apiKey: '',
    defaultStyle: '',
    enableWeChatExport: true,
    savedStyles: []
}

// ==================== 主插件类 ====================

export default class StyleCopilotPlugin extends Plugin {
    settings: StyleCopilotSettings;

    async onload(): Promise<void> {
        await this.loadSettings();

        // 注册样式学习命令
        this.addCommand({
            id: 'learn-style',
            name: '从URL学习写作风格',
            callback: (): void => {
                new UrlInputModal(this.app, this).open();
            }
        });

        // 注册应用样式命令
        this.addCommand({
            id: 'apply-style',
            name: '应用样式到当前笔记',
            callback: (): void => {
                void this.applyStyleToNote();
            }
        });

        // 注册微信导出命令
        this.addCommand({
            id: 'export-wechat',
            name: '导出为微信格式',
            callback: (): void => {
                void this.exportToWeChat();
            }
        });

        // 注册样式管理命令
        this.addCommand({
            id: 'manage-styles',
            name: '管理样式模板',
            callback: (): void => {
                new StyleManagerModal(this.app, this).open();
            }
        });

        // 添加设置标签页
        this.addSettingTab(new StyleCopilotSettingTab(this.app, this));

        // console.log('Style Copilot 插件已加载');
    }

    onunload(): void {
        // console.log('Style Copilot 插件已卸载');
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()) as StyleCopilotSettings;
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    // ==================== 样式学习功能 ====================

    async learnStyleFromUrl(url: string): Promise<void> {
        const notice = new Notice('正在学习样式...', 0);

        try {
            // 1. 抓取文章HTML内容
            const html = await this.fetchArticleHtml(url);
            
            // 2. 提取纯文本内容
            const textContent = this.extractTextFromHtml(html);
            
            // 3. 分析写作风格
            const patterns = this.analyzeStyle(textContent);
            
            // 4. 分析主题和视觉样式
            patterns.themeStyle = this.extractThemeStyle(html);
            
            // 5. 提取背景网格样式
            patterns.backgroundGrid = this.extractBackgroundGrid(html);
            
            // 6. 创建样式模板
            const template: StyleTemplate = {
                name: this.extractTitle(html) || `样式-${Date.now()}`,
                createdAt: Date.now(),
                source: url,
                patterns: patterns
            };

            // 7. 保存样式模板
            this.settings.savedStyles.push(template);
            void this.saveSettings();

            notice.hide();
            
            // 显示学习结果摘要
            const themeInfo = patterns.themeStyle ? '✓ 主题样式' : '';
            const gridInfo = patterns.backgroundGrid?.type !== 'none' ? '✓ 背景网格' : '';
            const features = [themeInfo, gridInfo].filter(f => f).join('、');
            
            new Notice(`✅ 样式学习成功: ${template.name}\n${features ? '已提取: ' + features : ''}`);
        } catch (error) {
            notice.hide();
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`❌ 学习失败: ${errorMessage}`);
            console.error('样式学习错误:', error);
        }
    }

    private async fetchArticleHtml(url: string): Promise<string> {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; StyleCopilot/1.0)'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            return await response.text();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`抓取失败: ${errorMessage}`);
        }
    }

    private async fetchArticleContent(url: string): Promise<string> {
        const html = await this.fetchArticleHtml(url);
        return this.extractTextFromHtml(html);
    }

    private extractTextFromHtml(html: string): string {
        // 移除script和style标签
        let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // 提取body内容
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        text = bodyMatch ? bodyMatch[1] : text;
        
        // 移除HTML标签
        text = text.replace(/<[^>]+>/g, ' ');
        
        // 清理多余空白
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }

    private extractTitle(content: string): string | null {
        const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    private analyzeStyle(content: string): StylePatterns {
        // 分析句子长度
        const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 0);
        const sentenceLengths = sentences.map(s => s.trim().length);
        
        // 提取关键词（简单实现：高频词）
        const words = content.split(/\s+/).filter(w => w.length > 2);
        const wordFreq: Record<string, number> = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        const keywords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .map(([word]) => word);

        // 分析段落结构
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
        const paragraphStructures = paragraphs.map(p => {
            const length = p.trim().length;
            if (length < 100) return 'short';
            if (length < 300) return 'medium';
            return 'long';
        });

        return {
            sentenceLength: sentenceLengths.slice(0, 50),
            vocabulary: keywords.slice(0, 50),
            paragraphStructure: paragraphStructures,
            tone: 'neutral',
            keywords: keywords
        };
    }

    // ==================== 主题样式提取 ====================

    private extractThemeStyle(html: string): ThemeStyle {
        const defaultTheme: ThemeStyle = {
            primaryColor: '#000000',
            secondaryColor: '#666666',
            textColor: '#333333',
            backgroundColor: '#ffffff',
            accentColor: '#0066cc',
            fontFamily: 'system-ui',
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.6',
            textAlign: 'left',
            textIndent: '0',
            paragraphSpacing: '1em',
            borderRadius: '4px',
            boxShadow: 'none',
            borderStyle: 'none'
        };

        try {
            // 提取内联样式
            const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            const inlineStyles = styleMatch ? styleMatch.join('\n') : '';

            // 提取配色方案
            const colorPatterns = [
                /color:\s*([^;]+)/gi,
                /background-color:\s*([^;]+)/gi,
                /background:\s*([^;]+)/gi,
                /border-color:\s*([^;]+)/gi
            ];

            const colors: string[] = [];
            colorPatterns.forEach(pattern => {
                const matches = inlineStyles.match(pattern);
                if (matches) {
                    matches.forEach(match => {
                        const colorMatch = match.match(/#\w+|rgb\([^)]+\)|rgba\([^)]+\)|hsl\([^)]+\)/);
                        if (colorMatch) {
                            colors.push(colorMatch[0]);
                        }
                    });
                }
            });

            // 提取主要颜色
            if (colors.length > 0) {
                defaultTheme.primaryColor = colors[0];
                defaultTheme.textColor = colors.find(c => this.isTextColor(c)) || colors[0];
                defaultTheme.backgroundColor = colors.find(c => this.isBackgroundColor(c)) || '#ffffff';
            }

            // 提取字体样式
            const fontMatch = inlineStyles.match(/font-family:\s*([^;]+)/i);
            if (fontMatch) {
                defaultTheme.fontFamily = fontMatch[1].trim();
            }

            const fontSizeMatch = inlineStyles.match(/font-size:\s*([^;]+)/i);
            if (fontSizeMatch) {
                defaultTheme.fontSize = fontSizeMatch[1].trim();
            }

            const lineHeightMatch = inlineStyles.match(/line-height:\s*([^;]+)/i);
            if (lineHeightMatch) {
                defaultTheme.lineHeight = lineHeightMatch[1].trim();
            }

            // 提取排版样式
            const textAlignMatch = inlineStyles.match(/text-align:\s*([^;]+)/i);
            if (textAlignMatch) {
                defaultTheme.textAlign = textAlignMatch[1].trim();
            }

            // 提取装饰元素
            const borderRadiusMatch = inlineStyles.match(/border-radius:\s*([^;]+)/i);
            if (borderRadiusMatch) {
                defaultTheme.borderRadius = borderRadiusMatch[1].trim();
            }

            const boxShadowMatch = inlineStyles.match(/box-shadow:\s*([^;]+)/i);
            if (boxShadowMatch) {
                defaultTheme.boxShadow = boxShadowMatch[1].trim();
            }

            return defaultTheme;
        } catch (error) {
            console.error('主题样式提取错误:', error);
            return defaultTheme;
        }
    }

    private isTextColor(color: string): boolean {
        // 简单判断是否为文字颜色（深色）
        const darkColors = ['#000', '#333', '#222', '#111', '#444', '#555', '#666'];
        return darkColors.some(dc => color.toLowerCase().includes(dc));
    }

    private isBackgroundColor(color: string): boolean {
        // 简单判断是否为背景颜色（浅色）
        const lightColors = ['#fff', '#ffffff', '#f5', '#faf', '#f0f', '#ff'];
        return lightColors.some(lc => color.toLowerCase().includes(lc));
    }

    // ==================== 背景网格提取 ====================

    private extractBackgroundGrid(html: string): BackgroundGrid {
        const defaultGrid: BackgroundGrid = {
            type: 'none',
            color: '#e0e0e0',
            opacity: 0.5,
            spacing: '20px',
            size: '1px',
            pattern: ''
        };

        try {
            // 提取样式内容
            const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
            const styles = styleMatch ? styleMatch.join('\n') : '';

            // 检测网格类型
            if (styles.includes('grid') || styles.includes('网格')) {
                // 检测点状网格
                if (styles.includes('dot') || styles.includes('点')) {
                    defaultGrid.type = 'dots';
                    defaultGrid.pattern = 'radial-gradient(circle, {color} 1px, transparent 1px)';
                }
                // 检测线状网格
                else if (styles.includes('line') || styles.includes('线')) {
                    defaultGrid.type = 'lines';
                    defaultGrid.pattern = 'linear-gradient({color} 1px, transparent 1px)';
                }
                // 检测方格网格
                else {
                    defaultGrid.type = 'squares';
                    defaultGrid.pattern = 'linear-gradient({color} 1px, transparent 1px), linear-gradient(90deg, {color} 1px, transparent 1px)';
                }
            }

            // 提取网格颜色
            const gridColorMatch = styles.match(/grid-color:\s*([^;]+)/i);
            if (gridColorMatch) {
                defaultGrid.color = gridColorMatch[1].trim();
            }

            // 提取网格间距
            const gridGapMatch = styles.match(/grid-gap:\s*([^;]+)/i) || 
                                styles.match(/gap:\s*([^;]+)/i);
            if (gridGapMatch) {
                defaultGrid.spacing = gridGapMatch[1].trim();
            }

            // 提取背景图片（可能是网格图案）
            const bgImageMatch = styles.match(/background-image:\s*([^;]+)/i);
            if (bgImageMatch) {
                defaultGrid.backgroundImage = bgImageMatch[1].trim();
                defaultGrid.type = 'custom';
            }

            // 提取透明度
            const opacityMatch = styles.match(/opacity:\s*([^;]+)/i);
            if (opacityMatch) {
                const opacity = parseFloat(opacityMatch[1]);
                if (!isNaN(opacity)) {
                    defaultGrid.opacity = opacity;
                }
            }

            return defaultGrid;
        } catch (error) {
            console.error('背景网格提取错误:', error);
            return defaultGrid;
        }
    }

    // ==================== 样式应用功能 ====================

    applyStyleToNote(): void {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('❌ 请先打开一个笔记');
            return;
        }

        if (this.settings.savedStyles.length === 0) {
            new Notice('❌ 没有保存的样式模板，请先学习样式');
            return;
        }

        new StyleSelectionModal(this.app, this, activeFile).open();
    }

    async applyStyle(file: TFile, style: StyleTemplate): Promise<void> {
        const notice = new Notice('正在应用样式...', 0);

        try {
            const content = await this.app.vault.read(file);
            
            // 应用写作风格
            const styledContent = this.transformContent(content, style);
            
            // 应用主题和背景网格（生成CSS）
            const themeCSS = this.generateThemeCSS(style.patterns.themeStyle);
            const gridCSS = this.generateGridCSS(style.patterns.backgroundGrid);
            
            // 将CSS注入到笔记的前言（frontmatter）中
            const finalContent = this.injectStyles(styledContent, themeCSS + gridCSS);
            
            await this.app.vault.modify(file, finalContent);
            
            notice.hide();
            
            // 显示应用结果
            const appliedFeatures = [];
            if (style.patterns.themeStyle) appliedFeatures.push('主题样式');
            if (style.patterns.backgroundGrid?.type !== 'none') appliedFeatures.push('背景网格');
            appliedFeatures.push('写作风格');
            
            new Notice(`✅ 样式应用成功: ${style.name}\n已应用: ${appliedFeatures.join('、')}`);
        } catch (error) {
            notice.hide();
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`❌ 应用失败: ${errorMessage}`);
            console.error('样式应用错误:', error);
        }
    }

    private generateThemeCSS(theme?: ThemeStyle): string {
        if (!theme) return '';

        return `
/* 主题样式 */
.theme-style {
    --primary-color: ${theme.primaryColor};
    --secondary-color: ${theme.secondaryColor};
    --text-color: ${theme.textColor};
    --background-color: ${theme.backgroundColor};
    --accent-color: ${theme.accentColor};
    
    font-family: ${theme.fontFamily};
    font-size: ${theme.fontSize};
    font-weight: ${theme.fontWeight};
    line-height: ${theme.lineHeight};
    text-align: ${theme.textAlign};
    color: ${theme.textColor};
    background-color: ${theme.backgroundColor};
}

.theme-style p {
    text-indent: ${theme.textIndent};
    margin-bottom: ${theme.paragraphSpacing};
}

.theme-style .highlight {
    background-color: ${theme.accentColor};
    padding: 2px 4px;
    border-radius: ${theme.borderRadius};
}

.theme-style .card {
    border-radius: ${theme.borderRadius};
    box-shadow: ${theme.boxShadow};
    border: ${theme.borderStyle};
}
`;
    }

    private generateGridCSS(grid?: BackgroundGrid): string {
        if (!grid || grid.type === 'none') return '';

        let gridPattern = '';
        switch (grid.type) {
            case 'dots':
                gridPattern = `
    background-image: radial-gradient(circle, ${grid.color} 1px, transparent 1px);
    background-size: ${grid.spacing} ${grid.spacing};`;
                break;
            case 'lines':
                gridPattern = `
    background-image: linear-gradient(${grid.color} 1px, transparent 1px);
    background-size: 100% ${grid.spacing};`;
                break;
            case 'squares':
                gridPattern = `
    background-image: 
        linear-gradient(${grid.color} 1px, transparent 1px),
        linear-gradient(90deg, ${grid.color} 1px, transparent 1px);
    background-size: ${grid.spacing} ${grid.spacing};`;
                break;
            case 'custom':
                gridPattern = grid.backgroundImage ? `
    background-image: ${grid.backgroundImage};` : '';
                break;
        }

        return `
/* 背景网格 */
.background-grid {
    position: relative;
    opacity: ${grid.opacity};${gridPattern}
}

.background-grid::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: -1;
}
`;
    }

    private injectStyles(content: string, css: string): string {
        // 如果有CSS样式，添加到frontmatter或style标签中
        if (!css.trim()) return content;

        // 检查是否已有frontmatter
        if (content.startsWith('---')) {
            // 在现有frontmatter后添加style标签
            const frontmatterEnd = content.indexOf('---', 3);
            if (frontmatterEnd !== -1) {
                const frontmatter = content.substring(0, frontmatterEnd + 3);
                const body = content.substring(frontmatterEnd + 3);
                return `${frontmatter}\n\n<style>${css}</style>\n${body}`;
            }
        }

        // 没有frontmatter，直接添加style标签
        return `<style>${css}</style>\n\n${content}`;
    }

    private transformContent(content: string, style: StyleTemplate): string {
        // 简单实现：根据样式模式调整内容
        // 实际应用中可以调用AI API进行智能改写
        
        const lines = content.split('\n');
        const transformedLines = lines.map(line => {
            // 保持标题和代码块不变
            if (line.startsWith('#') || line.startsWith('```')) {
                return line;
            }
            
            // 根据样式调整句子
            return this.adjustSentence(line, style.patterns);
        });

        return transformedLines.join('\n');
    }

    private adjustSentence(sentence: string, style: StylePatterns): string {
        // 简单实现：根据平均句子长度调整
        if (style.sentenceLength.length === 0) {
            return sentence;
        }

        const avgLength = style.sentenceLength.reduce((a, b) => a + b, 0) / style.sentenceLength.length;
        const currentLength = sentence.length;

        // 如果句子过长，可以拆分（这里只是示例）
        if (currentLength > avgLength * 1.5) {
            // 可以添加拆分逻辑
        }

        return sentence;
    }

    // ==================== 微信导出功能 ====================

    async exportToWeChat(): Promise<void> {
        const activeFile = this.app.workspace.getActiveFile();
        if (!activeFile) {
            new Notice('❌ 请先打开一个笔记');
            return;
        }

        const notice = new Notice('正在导出...', 0);

        try {
            const content = await this.app.vault.read(activeFile);
            const wechatContent = this.convertToWeChatFormat(content);
            
            // 复制到剪贴板
            await navigator.clipboard.writeText(wechatContent);
            
            notice.hide();
            new Notice('✅ 已复制到剪贴板，可直接粘贴到微信');
        } catch (error) {
            notice.hide();
            const errorMessage = error instanceof Error ? error.message : String(error);
            new Notice(`❌ 导出失败: ${errorMessage}`);
            console.error('微信导出错误:', error);
        }
    }

    private convertToWeChatFormat(content: string): string {
        let result = content;

        // 转换标题
        result = result.replace(/^### (.*$)/gm, '**$1**\n');
        result = result.replace(/^## (.*$)/gm, '**$1**\n');
        result = result.replace(/^# (.*$)/gm, '**$1**\n');

        // 转换粗体
        result = result.replace(/\*\*(.*?)\*\*/g, '$1');

        // 转换斜体
        result = result.replace(/\*(.*?)\*/g, '$1');

        // 转换链接
        result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

        // 转换列表
        result = result.replace(/^- (.*$)/gm, '• $1');
        result = result.replace(/^\* (.*$)/gm, '• $1');

        // 转换代码块
        result = result.replace(/```[\s\S]*?```/g, (match) => {
            return match.replace(/```\w*\n?/g, '').split('\n').map((line: string) => `  ${line}`).join('\n');
        });

        // 转换行内代码
        result = result.replace(/`([^`]+)`/g, '$1');

        // 移除多余的空行
        result = result.replace(/\n{3,}/g, '\n\n');

        return result.trim();
    }
}

// ==================== URL输入模态框 ====================

class UrlInputModal extends Modal {
    plugin: StyleCopilotPlugin;

    constructor(app: App, plugin: StyleCopilotPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen(): void {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: '从URL学习写作风格' });

        const container = contentEl.createDiv({ cls: 'style-copilot-container' });

        // URL输入框
        const urlInput = container.createEl('input', {
            type: 'text',
            placeholder: '输入文章URL',
            cls: 'style-copilot-input'
        });
        urlInput.style.width = '100%';
        urlInput.style.marginBottom = '10px';

        // 按钮
        const buttonContainer = container.createDiv();
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';

        const learnButton = buttonContainer.createEl('button', {
            text: '开始学习',
            cls: 'style-copilot-button'
        });
        learnButton.style.flex = '1';

        const cancelButton = buttonContainer.createEl('button', {
            text: '取消',
            cls: 'style-copilot-button'
        });
        cancelButton.style.flex = '1';

        // 事件处理
        learnButton.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (!url) {
                new Notice('请输入URL');
                return;
            }

            this.close();
            void this.plugin.learnStyleFromUrl(url);
        });

        cancelButton.addEventListener('click', () => {
            this.close();
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// ==================== 样式选择模态框 ====================

class StyleSelectionModal extends Modal {
    plugin: StyleCopilotPlugin;
    file: TFile;

    constructor(app: App, plugin: StyleCopilotPlugin, file: TFile) {
        super(app);
        this.plugin = plugin;
        this.file = file;
    }

    onOpen(): void {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: '选择样式模板' });

        const container = contentEl.createDiv({ cls: 'style-copilot-container' });

        // 样式列表
        this.plugin.settings.savedStyles.forEach((style) => {
            const styleItem = container.createDiv({
                cls: 'style-copilot-result'
            });
            styleItem.style.marginBottom = '10px';
            styleItem.style.cursor = 'pointer';

            styleItem.createEl('div', {
                text: style.name,
                cls: 'style-copilot-header'
            });

            const meta = styleItem.createEl('div', {
                text: `来源: ${style.source}\n创建时间: ${new Date(style.createdAt).toLocaleString()}`
            });
            meta.style.fontSize = '0.9em';
            meta.style.color = 'var(--text-muted)';

            // 点击应用样式
            styleItem.addEventListener('click', () => {
                this.close();
                void this.plugin.applyStyle(this.file, style);
            });
        });

        // 取消按钮
        const cancelButton = container.createEl('button', {
            text: '取消',
            cls: 'style-copilot-button'
        });
        cancelButton.style.marginTop = '10px';

        cancelButton.addEventListener('click', () => {
            this.close();
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// ==================== 样式管理模态框 ====================

class StyleManagerModal extends Modal {
    plugin: StyleCopilotPlugin;

    constructor(app: App, plugin: StyleCopilotPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen(): void {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: '管理样式模板' });

        const container = contentEl.createDiv({ cls: 'style-copilot-container' });

        if (this.plugin.settings.savedStyles.length === 0) {
            container.createEl('div', {
                text: '暂无保存的样式模板',
                cls: 'style-copilot-result'
            });
        } else {
            this.plugin.settings.savedStyles.forEach((style, index) => {
                const styleItem = container.createDiv({
                    cls: 'style-copilot-result'
                });
                styleItem.style.marginBottom = '10px';

                const header = styleItem.createDiv();
                header.style.display = 'flex';
                header.style.justifyContent = 'space-between';
                header.style.alignItems = 'center';

                header.createEl('div', {
                    text: style.name,
                    cls: 'style-copilot-header'
                });

                const deleteButton = header.createEl('button', {
                    text: '删除',
                    cls: 'style-copilot-button'
                });
                deleteButton.style.padding = '4px 8px';
                deleteButton.style.fontSize = '0.9em';

                deleteButton.addEventListener('click', () => {
                    this.plugin.settings.savedStyles.splice(index, 1);
                    void this.plugin.saveSettings();
                    new Notice('样式已删除');
                    this.onOpen(); // 刷新列表
                });

                const meta = styleItem.createEl('div');
                meta.style.fontSize = '0.9em';
                meta.style.color = 'var(--text-muted)';
                
                // 显示样式特征
                const features: string[] = [];
                if (style.patterns.themeStyle) features.push('🎨 主题');
                if (style.patterns.backgroundGrid?.type !== 'none') features.push('📐 网格');
                features.push('📝 写作风格');
                
                meta.createEl('div', {
                    text: `来源: ${style.source}`
                });
                meta.createEl('div', {
                    text: `创建时间: ${new Date(style.createdAt).toLocaleString()}`
                });
                meta.createEl('div', {
                    text: `包含: ${features.join(' | ')}`
                });
            });
        }

        // 关闭按钮
        const closeButton = container.createEl('button', {
            text: '关闭',
            cls: 'style-copilot-button'
        });
        closeButton.style.marginTop = '10px';

        closeButton.addEventListener('click', () => {
            this.close();
        });
    }

    onClose(): void {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// ==================== 设置标签页 ====================

class StyleCopilotSettingTab extends PluginSettingTab {
    plugin: StyleCopilotPlugin;

    constructor(app: App, plugin: StyleCopilotPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Style Copilot 设置' });

        new Setting(containerEl)
            .setName('API端点')
            .setDesc('用于样式分析的API端点（可选）')
            .addText(text => text
                .setPlaceholder('https://api.openai.com/v1')
                .setValue(this.plugin.settings.apiEndpoint)
                .onChange(async (value: string) => {
                    this.plugin.settings.apiEndpoint = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('API密钥')
            .setDesc('用于AI增强功能的API密钥（可选）')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.plugin.settings.apiKey)
                .onChange(async (value: string) => {
                    this.plugin.settings.apiKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('默认样式')
            .setDesc('默认应用的写作样式')
            .addText(text => text
                .setPlaceholder('输入样式名称')
                .setValue(this.plugin.settings.defaultStyle)
                .onChange(async (value: string) => {
                    this.plugin.settings.defaultStyle = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('启用微信导出')
            .setDesc('启用导出为微信格式的功能')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableWeChatExport)
                .onChange(async (value: boolean) => {
                    this.plugin.settings.enableWeChatExport = value;
                    await this.plugin.saveSettings();
                }));

        // 显示已保存的样式数量
        containerEl.createEl('h3', { text: '已保存的样式' });
        const styleCount = containerEl.createEl('div', {
            text: `共 ${this.plugin.settings.savedStyles.length} 个样式模板`
        });
        styleCount.style.marginBottom = '10px';
        styleCount.style.color = 'var(--text-muted)';
    }
}
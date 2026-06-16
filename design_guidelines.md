# 全科错题辅导小程序 - 设计指南

## 品牌定位
一款面向中小学生的高效错题辅导工具，通过 AI 自动批改、薄弱点诊断和个性化训练，帮助学生快速提分。设计风格：温暖、有序、专注、成长导向。

## 配色方案

| 用途 | Tailwind 类名 | 色值 | 说明 |
|------|--------------|------|------|
| 主色 | `bg-blue-600` / `text-blue-600` | #2563eb | 深海蓝，代表理性与信任 |
| 辅色 | `bg-amber-500` / `text-amber-500` | #f59e0b | 暖橙，标注和提醒 |
| 错误色 | `bg-red-500` / `text-red-500` | #ef4444 | 错题标注，克制使用 |
| 正确色 | `bg-green-500` / `text-green-500` | #22c55e | 正确标注，克制使用 |
| 背景色 | `bg-slate-50` | #f8fafc | 暖白底，减少疲劳 |
| 卡片色 | `bg-white` | #ffffff | 纯白卡片 |
| 次要文字 | `text-gray-500` | #6b7280 | 说明文字 |
| 主要文字 | `text-gray-900` | #111827 | 正文主色 |

## 字体排版

| 层级 | Tailwind 类名 | 使用场景 |
|------|--------------|---------|
| H1 | `text-xl font-bold` | 页面大标题 |
| H2 | `text-lg font-semibold` | 板块标题 |
| H3 | `text-base font-semibold` | 子标题 |
| 正文 | `text-sm text-gray-900` | 主要阅读文字 |
| 辅助 | `text-xs text-gray-500` | 备注、标签文字 |

## 间距系统

- 页面边距：`p-4`
- 卡片内边距：`p-4` 或 `px-4 py-3`
- 卡片间距：`gap-4` / `space-y-4`
- 列表项间距：`gap-3`
- 板块间距：`mb-6`

## 组件选型原则

1. **按钮** → `@/components/ui/button`（优先使用预设 variant: default / outline / ghost）
2. **输入框** → `@/components/ui/input`（需用 View 包裹做跨端适配）
3. **卡片容器** → `@/components/ui/card`（Card, CardHeader, CardContent, CardTitle）
4. **标签/徽章** → `@/components/ui/badge`
5. **弹窗提示** → `@/components/ui/alert` 或 `@/components/ui/dialog`
6. **加载占位** → `@/components/ui/skeleton`
7. **进度条** → `@/components/ui/progress`
8. **Toast 提示** → `@/components/ui/toast`（已全局注册 Toaster）
9. **分割线** → `@/components/ui/separator`
10. **图标** → `lucide-react-taro`（统一使用，禁止手写图标）

**禁止**：用 `View/Text` 手搓 Button / Input / Card / Badge / Tabs 等通用组件。

## 页面结构

### 底部 TabBar 导航（3 个 Tab）

1. **错题批改** — `pages/index/index`（首页：录入错题 → 批改结果）
2. **薄弱诊断** — `pages/diagnosis/index`（知识点薄弱分析 + 统计）
3. **专项训练** — `pages/training/index`（个性化分层练习题）

### 导航规则
- Tab 切换使用 `Taro.switchTab()`
- 非 Tab 页面使用 `Taro.navigateTo()`

## 状态展示

- **加载中**：使用 `@/components/ui/skeleton` 骨架屏
- **空状态**：居中显示灰色图标 + 提示文字
- **错误状态**：使用 `@/components/ui/alert` 带错误类型显示的提示

## 小程序约束
- 所有图片通过 TOS 对象存储管理（TabBar 图标除外）
- 避免包体积过大，不打包静态图片资源
- 录音等原生能力需做平台检测 + H5 降级
# 极简课程表

一个安卓优先、单页全览的极简课程表应用。

项目面向个人学习和长期迭代，目标是提供快速打开、快速查看、快速编辑的课程表体验。后续计划在保持核心结构稳定的基础上增加 iOS 支持。

## 项目状态

当前项目处于基础骨架阶段，已完成：

- Expo + React Native + TypeScript 项目初始化
- 安卓应用基础配置
- 单页课程表首页骨架
- 编辑菜单入口
- `Context/` 项目长期记忆文档

## 技术栈

- React Native
- Expo
- TypeScript
- 本地优先的数据存储方案
- IntelliJ IDEA 作为主要开发工具
- Android Studio 用于 Android SDK、模拟器和原生构建

## 核心方向

- 优先支持 Android
- 后期扩展 iOS
- 主界面一页全览，不依赖滚动查看课程
- 用户可以设置课程节数
- 支持设置时间分割线
- 支持连续课程合并
- 支持预设颜色
- 支持教室、老师等课程信息
- 支持长文本备忘，并在主界面显示简短摘要
- 本地离线优先，后续方便扩展提醒、导出和学期管理等功能

## 开发环境

- Windows 10/11
- Node.js LTS
- npm
- Android Studio
- Android SDK
- Android Emulator 或 Android 真机
- JDK 21，优先使用 Android Studio 自带的 Embedded JDK
- IntelliJ IDEA

## 开始运行

在项目根目录执行：

```bash
npm install
npm start
```

然后：

- 在 Expo 菜单中按 `a`，启动到 Android 模拟器
- 或使用 Android 真机中的 Expo Go 扫描二维码

也可以直接执行：

```bash
npm run android
```

## 常用命令

```bash
# 启动开发服务器
npm start

# 启动 Android
npm run android

# 类型检查
npm run typecheck
```

## 项目结构

```text
.
├── Context/                  # 项目长期记忆、决策和进展
├── src/
│   ├── features/             # 按功能组织的业务模块
│   ├── theme/                # 主题和设计令牌
│   └── types/                # TypeScript 类型
├── App.tsx                   # 应用入口组件
├── app.json                  # Expo 和 Android 配置
├── package.json              # 项目依赖和脚本
└── README.md
```

## 开发约定

- 先阅读 `Context/`，了解项目目标和已确认决策
- 优先保持主界面一页全览
- 新功能尽量按模块放入 `src/features/`
- 重要的产品决策和开发偏好同步记录到 `Context/`
- 提交前至少运行 `npm run typecheck`

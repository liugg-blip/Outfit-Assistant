# 搭了么 Windows 本地版

项目已取消原生 iOS 和 App Store 发布路线，后续只维护 Windows 桌面版本。

## 当前工程

- `app/dist/assets/app.js`：从已验证版本恢复的前端业务包，包含配色规则、人体模型和界面。
- `app/dist/desktop.js`：桌面增强层，保存性别与重点单品偏好。
- `app/dist/localization.js`：英文默认界面与中英文切换设置。
- `app/dist/wardrobe.js`：模型库、服装库、用户图片导入与本地叠穿工作室。
- `app/dist/assets/atelier.css`：造型工作台视觉主题。
- `design/silhouettes-v2.json`：男女人体模型与点击热区的可维护数据。
- `app/electron/main.cjs`：Electron 主进程，负责窗口、安全边界和外部链接。
- `scripts/check.cjs`：离线结构回归检查。
- `scripts/build.cjs`：生成可直接运行的 Windows 文件夹版。

原始 TypeScript 源码未保留，当前前端业务包来自 `app.asar`。后续对核心规则进行大改前，应逐步把业务包拆回可读模块。

## 构建

首次准备运行时：

```powershell
node scripts/seed-runtime.cjs
```

调整 `design/silhouettes-v2.json` 后，将模型同步到前端业务包：

```powershell
node scripts/apply-silhouettes.cjs
```

检查并构建（不依赖 npm）：

```powershell
node scripts/check.cjs
node scripts/build.cjs
```

产物位于 `release/搭了么/搭了么.exe`。必须保留整个文件夹，不能只移动 EXE。

## 使用说明

- 首次启动默认显示英文界面。
- 点击顶部齿轮按钮，可在 English 与简体中文之间切换。
- 灵感搜索提供小红书与 Pinterest，外部内容会在系统浏览器中打开。
- 点击顶部 `FIT LAB / 试衣间` 可进入模型与服装工作室。
- 内置体型覆盖 XXS–4XL；用户导入的模特和服装图片保存在本机 IndexedDB，不会上传。
- 试衣工作室提供视觉叠穿参考，不模拟真实尺码、面料垂坠或物理贴合。

## 公开仓库范围

GitHub 仓库只发布可维护源码与构建脚本。`runtime/` 和 `release/` 已被忽略，不包含 Electron 运行时或 EXE；在本机准备运行时后仍可按上述步骤构建完整桌面程序。

# dsh-menu-opacity

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（DSH）的浮层菜单加一个不透明度滑杆。

DSH 自带的菜单材质是半透明的（浅色 58% / 深色 45%）。深色主题、长对话、背景比较花的时候，加号菜单、模型选择、权限菜单会让背后的文字透上来，读起来很累。这个插件**只改菜单的填充不透明度**，保留玻璃边缘、圆角、阴影和背板模糊。

![设置界面](docs/settings.png)

## 功能

- **设置 → 菜单不透明度**：40%–100% 滑杆，拖动实时生效
- 覆盖所有 `[data-menu-material]` 浮层：加号菜单、模型选择、权限、会话行菜单
- 深浅色分别取色：浅色 `rgb(248 249 250 / α)`，深色 `rgb(39 50 76 / α)`
- 选择保存在本地（localStorage），重启后保留
- 纯客户端：无宿主代码、无网络请求、无外部依赖、不写产品文件

![修复后的加号菜单](docs/menu.png)

## 安装

### 桌面版（推荐）

1. 打开 **插件 → 添加插件 → 安装第三方插件**
2. 选择本目录（或填入绝对路径），安装并启用
3. 重启或刷新 DSH

> 桌面版的 `desktop` profile 由 Electron 应用独占管理，`dsh plugin` CLI 会直接拒绝；请走应用内的插件安装入口。

### dsh web

```bash
dsh plugin --profile <profile> add -w /absolute/path/to/dsh-menu-opacity
```

### 从 Git 安装

```bash
dsh plugin --profile <profile> add github:<owner>/dsh-menu-opacity
```

## 使用

打开 **设置 → 菜单不透明度**，拖动滑杆即可：

- 96%（默认）：接近不透明，菜单最清楚
- 70% 左右：还能看到一点背景，保留玻璃感
- 40%：接近产品原始的半透明程度

点 **恢复默认（96%）** 可以随时回到默认值。

## 原理

DSH 的菜单材质使用两个 CSS 变量：

```css
--dsw-menu-surface-fill
--dsw-menu-backdrop-filter
```

产品默认值是 `#f8f9fa94`（浅色，58%）和 `#43454a73`（深色，45%）。插件注入一条更高优先级的规则：

```css
html:root {
  --dsw-menu-surface-fill: rgb(248 249 250 / var(--dsh-menu-alpha, .96)) !important;
}
html body[data-ds-dark-theme],
html body[data-dshome-dark] {
  --dsw-menu-surface-fill: rgb(39 50 76 / var(--dsh-menu-alpha, .96)) !important;
}
```

滑杆只改 `--dsh-menu-alpha`。没有改 DOM、没有改产品样式表，也不覆盖主题的边框和模糊。

## 兼容性

- 测试于 **DSH 0.2.1-rc.2**（Windows 桌面版）
- Web 版同理；浅色 / 深色都覆盖
- 与主题插件共存：只改菜单填充，不动玻璃边框、阴影、模糊
- 如果主题自己重画了菜单材质，优先级仍然由本插件的 `html:root` / `html body[...]` 规则胜出

## 开发

```bash
git clone https://github.com/<owner>/dsh-menu-opacity.git
cd dsh-menu-opacity

# 链接到 profile（桌面版请在应用内安装）
dsh plugin --profile <profile> add -w "$PWD"
```

改 `lib/client.js` 后刷新客户端即可。设置分区通过 `slots.inject('settings.section')` 注册，样式通过一条 `<style data-dsh-menu-opacity>` 注入。

```
dsh-menu-opacity/
├─ package.json
├─ cordis.patch.yml
├─ dsh.plugin.json
├─ docs/
│  ├─ settings.png
│  └─ menu.png
└─ lib/
   ├─ index.js      # host 空实现
   └─ client.js     # 设置分区 + 滑杆 + CSS 变量
```

## License

MIT。见 [LICENSE](LICENSE)。

## English

A small DSH plugin that adds a 40–100% opacity slider for popup menus. DSH ships menu fill at 58% (light) / 45% (dark), which lets chat text bleed through the composer "+" menu; this plugin overrides only `--dsw-menu-surface-fill` and exposes the slider under **Settings → Menu opacity**. Client-only, persisted in localStorage. Tested with DSH 0.2.1-rc.2 on Windows desktop. Not affiliated with DeepSeek.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

北京中航华信机电设备安装有限公司官网：单页滚动静态站（HTML/CSS/原生 JS，零依赖、无构建），深蓝 `#0B2A4A` + 浅灰 `#F4F6F9` 主色、金色 `#C9A54C` 点缀，特斯拉式简约科技风，桌面与手机 H5（含横屏）双端适配。

- 公开网址：https://wishesyudy.github.io/zhonghanghuaxin/
- 自定义域名：**web.huaxin119.com**（用户 2026-09-19 在 GitHub 网页端绑定，GitHub 自动在远程 master 提交了 CNAME 文件；本地仓库根目录必须保留 CNAME，DNS 需将 web.huaxin119.com CNAME 指向 wishesyudy.github.io，HTTPS 证书 GitHub 自动签发；绑定后 github.io 地址会 301 跳转）
- 仓库：github.com/wishesyudy/zhonghanghuaxin（gh CLI 已登录；master 分支直推，GitHub Pages legacy 模式自动上线）
- 分支：`master` = 线上版（当前 v2.0，中英双语切换已上线）；`v2` = 已合并的历史开发分支（v1.0 = 纯中文版，随时可回滚）
- 设计规格：`docs/superpowers/specs/2026-09-19-zhonghanghuaxin-website-design.md`；实现计划：`docs/superpowers/plans/2026-09-19-zhonghanghuaxin-website.md`

## ⚠️ 版本管理规则（用户明确要求，最高优先级）

**任何修改都必须先保存现有版本，再另行开发新版本，禁止直接在线上版本上改。**

具体流程：
1. 动手前给当前线上版本打 tag（如 `v1.0`、`v1.1`）并推送，保证历史版本随时可回滚
2. 新建分支（如 `v2`）在新分支上开发
3. 本地浏览器 + 局域网手机预览验证通过后，合并回 master 并 push（Pages 自动上线）

## 素材红线（不可违反）

- 宣传片只允许放**剪切后的压缩片段**进网站/仓库；原片 `北京中航华信智慧消防宣传片（版本2.0）.mp4`（460MB）与公司 PPT 属内部资料，已被 .gitignore 排除，**任何情况下不得提交、不得推送**
- 片段生成：`python tools/make_promo.py <秒数>`（从原片前 N 秒生成 720p 片段到 assets/video/，自动清理旧片段）；生成后需同步更新 index.html 的 `<source>`、js/main.js 注释、规格文档中的时长描述

## 常用命令

```bash
# 本地预览：直接双击 index.html，或起服务器（手机同 WiFi 可访问 http://<电脑IP>:8080）
python -m http.server 8080 --bind 0.0.0.0

# 检查
node --check js/main.js                      # JS 语法

# 部署（网络不稳时失败重试即可）
git add -A && git commit -m "..." && git push
```

## 结构速览

- `index.html` — 全部 11 个板块的语义结构与真实文案（文案逐字来自公司 PPT，改动前先与用户确认）
- `css/base.css` — 设计令牌（色板/字体/间距）、reset、按钮、`.sec-head` 章节标题组件、`.reveal/.in-view` 入场动画
- `css/sections.css` — 各板块布局样式
- `css/responsive.css` — 断点 1024/768，含手机横屏 `(orientation: landscape) and (max-height: 500px)`
- `js/main.js` — IIFE 模块：initNav / initReveal / initCounters / initTabs / initSwipe / initLightbox / initMarquee / initHeroVideo
- `assets/` — img（PPT 提取图片）、video（宣传片片段）；`tools/` — 图片与视频处理脚本

## 已知约定

- Hero 视频标签必须保留 `playsinline webkit-playsinline x5-playsinline x5-video-player-type="h5" x5-video-player-fullscreen="false"`，否则安卓浏览器（UC/华为/小米等）会把自动播放的视频强制全屏（2026-09-19 已修复过此问题）
- 页脚 ICP 备案号「京ICP备XXXXXXXX号」为占位符，拿到真实备案号后替换
- 联系方式（用户确认）：电话 13366130540 / 邮箱 13366130540@163.com / 地址北京市顺义区首都机场 / 微信公众号「北京中航华信机电设备安装有限公司」

# 中航华信官网 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为北京中航华信机电设备安装有限公司从零构建一个单页滚动官网（深蓝+浅灰+金色点缀、特斯拉式简约科技风、桌面与手机 H5 双端适配、丰富动效）。

**Architecture:** 纯静态站点：`index.html`（11 板块语义结构）+ 三个 CSS 文件（base 令牌与组件 / sections 板块布局 / responsive 媒体查询）+ 一个 `main.js`（全部交互），零框架零外部依赖，双击 index.html 即可浏览。

**Tech Stack:** HTML5 + CSS3（Grid/Flex/自定义属性）+ 原生 JS（IntersectionObserver、requestAnimationFrame、Canvas、Touch events）。图片用 Pillow 处理。

**Spec:** `docs/superpowers/specs/2026-09-19-zhonghanghuaxin-website-design.md`

## Global Constraints

- 色板：`--navy:#0B2A4A` `--navy-deep:#061E36` `--blue-bright:#1E5AA8` `--gray-bg:#F4F6F9` `--gold:#C9A54C` `--text-dark:#16212B` `--text-light:#E8EEF5`；金色只做点缀，单屏 ≤3 处
- 断点：≥1024px 桌面 / 768-1024 平板 / <768 手机；手机横屏 `(orientation: landscape) and (max-height: 500px)` 单独处理
- 无 CDN、无外部字体、无框架；字体用系统栈（PingFang SC / Microsoft YaHei / Helvetica Neue）
- 全站文案逐字采用 PPT 原文（本计划各任务内已给出）；不得自行改写数字与工程名称
- `prefers-reduced-motion: reduce` 时禁用粒子与大幅动效
- 页脚 ICP 备案号为占位符「京ICP备XXXXXXXX号」，版权年份 2026
- 联系方式（已确认）：电话 13366130540 / 邮箱 13366130540@163.com / 地址北京市顺义区首都机场 / 公众号「北京中航华信机电设备安装有限公司」
- 图片素材：`_assets_raw/image1-16.jpeg`（PPT 提取）；宣传片 460MB 不使用
- 每个任务结束：node 语法检查 + 浏览器人工核验 + git commit

## 文件结构

```
guanwang/
  index.html            页面骨架，11 板块，全部真实文案
  css/base.css          令牌、reset、排版、按钮、章节标题组件、reveal 动画
  css/sections.css      各板块布局样式（nav/hero/stats/about/services/smart/quals/team/cases/contact/footer）
  css/responsive.css    全部媒体查询
  js/main.js            导航、观察器、数字滚动、tab、灯箱、粒子、marquee、时间线点亮
  assets/img/           hero.jpg ops.jpg platform.jpg about.jpg cert-01..12.jpg
```

命名约定：板块容器 `<section id="xxx" class="section">`；入场动画类 `.reveal`（JS 观察后加 `.in-view`）；章节标题组件 `.sec-head`（内部 `.sec-en` 英文小字 / `.sec-line` 金色短线 / `.sec-title` 中文大标题 / `.sec-sub` 副标题）。

---

### Task 1: 素材处理

**Files:**
- Create: `assets/img/hero.jpg` `assets/img/ops.jpg` `assets/img/platform.jpg` `assets/img/about.jpg` `assets/img/cert-01.jpg` … `cert-12.jpg`

**Interfaces:**
- Produces: 16 张 web 优化图，供后续任务引用；映射关系固定：hero=image1，ops=image2，platform=image15，about=image16，cert-01..12=image3..14

- [ ] **Step 1: 写处理脚本并执行**

```python
# tools/process_images.py（一次性脚本，执行后保留以便再生成）
from PIL import Image
import os
MAP = {
    'image1.jpeg': 'hero.jpg', 'image2.jpeg': 'ops.jpg',
    'image15.jpeg': 'platform.jpg', 'image16.jpeg': 'about.jpg',
}
os.makedirs('assets/img', exist_ok=True)
for i in range(3, 15):
    MAP[f'image{i}.jpeg'] = f'cert-{i-2:02d}.jpg'
for src, dst in MAP.items():
    img = Image.open(f'_assets_raw/{src}')
    if img.mode == 'CMYK': img = img.convert('RGB')
    img.save(f'assets/img/{dst}', 'JPEG', quality=82, progressive=True, optimize=True)
```

Run: `python tools/process_images.py`，预期 `assets/img/` 生成 16 个文件。

- [ ] **Step 2: 核验** — `ls assets/img/` 共 16 个 jpg；随机打开 2 张确认可显示（Pillow 能打开即视为格式有效）
- [ ] **Step 3: Commit** — `git add assets/img tools && git commit -m "feat: 处理站点图片素材"`

### Task 2: 页面骨架 + base.css + 导航/Hero

**Files:**
- Create: `index.html`、`css/base.css`
- Modify: `css/sections.css`（本次新增 nav/hero 部分）

**Interfaces:**
- Produces: 页面全部 `<section id>` 锚点（home/stats/about/services/smart/quals/team/cases/contact）；`.reveal/.in-view` 动画约定；`.sec-head` 组件；`.btn` `.btn-primary` `.btn-ghost` 按钮；导航结构 `.site-nav`/`.nav-links`/`.nav-toggle`；Hero 结构 `.hero`/`.hero-bg`/`.hero-overlay`/`.hero-content`

- [ ] **Step 1: 写 index.html 骨架**：`<head>` 含 meta viewport、title「北京中航华信机电设备安装有限公司｜机电全产业链·智慧消防·远程值守」、三个 CSS；`<body>` 内依次放：导航（logo SVG 徽标 + 8 个锚点链接 + 汉堡按钮）、`<section id="home" class="hero">`、其余板块先放空容器（Task 3-9 填充）、页脚。Hero 文案：

```html
<section id="home" class="hero">
  <div class="hero-bg"></div><div class="hero-overlay"></div>
  <canvas class="hero-particles" aria-hidden="true"></canvas>
  <div class="hero-content">
    <p class="hero-en">ZHONGHANG HUAXIN</p>
    <h1 class="hero-title">中航华信</h1>
    <div class="hero-gold-line"></div>
    <p class="hero-slogan">机电全产业链 · 智慧消防 · 消控室远程值守</p>
    <p class="hero-sub">机电设备安装 · 消防工程 · 维护维保 · 智慧消防一站式服务</p>
    <div class="hero-cta"><a class="btn btn-ghost" href="#services">了解业务</a><a class="btn btn-primary" href="#contact">联系我们</a></div>
  </div>
  <a class="hero-scroll" href="#stats" aria-label="向下滚动">↓</a>
</section>
```

- [ ] **Step 2: 写 css/base.css**：`:root` 色板（Global Constraints 值）+ 字体栈变量；reset（box-sizing、margin 清零、`html{scroll-behavior:smooth}`）；`body` 底色 `--gray-bg` 文字 `--text-dark`；h1-h3 字重 700；`.section{padding:110px 0}`；`.container{max-width:1200px;margin:0 auto;padding:0 32px}`；`.sec-head` 组件（`.sec-en` 12px 字距 4px 灰字、`.sec-line` 40×2px 金线、`.sec-title` clamp(30px,4vw,46px) navy、`.sec-sub` 16px 灰）；`.btn`（padding 14px 34px、主按钮 navy 底白字、ghost 透明底金边）、按钮扫光 `::after` 金色渐变条 hover 滑过；`.reveal{opacity:0;transform:translateY(28px);transition:.7s cubic-bezier(.22,.61,.36,1)}`、`.reveal.in-view{opacity:1;transform:none}`；`prefers-reduced-motion` 时 `.reveal{transition:none}`。

- [ ] **Step 3: 写导航 + Hero 样式（css/sections.css）**：`.site-nav` fixed 顶部、初始透明、`.scrolled` 白底毛玻璃（backdrop-filter:blur(12px)）+ 阴影、内部金线底边；logo SVG 徽标（几何菱形线条 + 文字「中航华信」）；导航链接 hover 金色下划线；`.hero` 100vh、`.hero-bg` 背景 `url(../assets/img/hero.jpg) center/cover` + Ken Burns 动画（`@keyframes kenburns{from{transform:scale(1)}to{transform:scale(1.08)}}` 12s alternate 循环）；`.hero-overlay` 渐变 `linear-gradient(105deg, rgba(6,30,54,.92) 30%, rgba(11,42,74,.55) 60%, rgba(11,42,74,.25))`；`.hero-content` 左下角定位、标题 clamp(44px,8vw,88px) 白字逐行上浮（`@keyframes riseUp` + 各元素 stagger delay 0/.15/.3/.45/.6s）；`.hero-scroll` 底部居中白色箭头 bounce。

- [ ] **Step 4: 核验** — `node --check`（无 JS 跳过）；浏览器打开 index.html：Hero 全屏大图+渐变、标题逐行浮现、Ken Burns 缩放、下滑箭头跳动、导航透明悬浮；控制台无报错
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: 页面骨架+基础样式+导航/Hero"`

### Task 3: 数据带 + 关于我们

**Files:**
- Modify: `index.html`、`css/sections.css`

**Interfaces:**
- Consumes: `.sec-head`、`.reveal`（Task 2）
- Produces: `.stats-band`（`.stat-num` 带 `data-target` 属性供 Task 10 数字滚动）、`.about-*`、`.culture-band`、`.milestones` 时间线结构

- [ ] **Step 1: 数据带 HTML**：`<section id="stats" class="stats-band">` 内 5 个 `.stat`：`<span class="stat-num" data-target="2013">0</span>` 后缀「年成立」；`data-target="2300"` 后缀「万注册资本」；`data-target="200"` 后缀「+ 管理与技术人员」；`data-target="6"` 后缀「项工程资质」；`data-target="100"` 后缀「+ 施工维保团队」。深蓝底、金色数字（数字用 `--gold`，单位白字）。

- [ ] **Step 2: 关于我们 HTML**：`<section id="about" class="about">`，`.sec-head`（en=ABOUT US，title=关于我们，sub=深耕机电与消防领域十余年的全产业链工程公司）。左文右图（`.about-grid` 两列，图 `assets/img/about.jpg` 加金色边框偏移装饰）。简介文案（逐字）：

> 北京中航华信机电设备安装有限公司是一家专业从事机电「全产业链」的工程公司，总部位于北京市顺义区首都机场；业务涵盖机电设备安装、消防专业工程、智能化专业工程、设备维修维保服务、智慧消防服务、消控室远程值守等。公司具有建筑工程施工总承包贰级、建筑机电安装工程专业承包贰级、建筑装修装饰工程专业承包贰级、消防设施工程专业承包贰级、电子与智能化工程专业承包贰级、施工劳务（不分等级）共6项资质；拥有多项发明专利证书和软件著作权证书，国家高新技术企业。公司秉承「诚信为本，服务至上」的运营理念，以消防工程、维保和智慧消防为主要业务板块，为客户提供从消防报审、图纸会审、项目施工、关系协调、消防验收到消防评估、检测、维修维保、培训、保险的全产业链服务。

- [ ] **Step 3: 三跟文化横条 + 愿景使命价值观**：`.culture-band` 深蓝底居中大字「三跟文化：跟我学，跟我上，跟我冲」（金色引号装饰）；下方 3 卡（.value-card）：企业愿景——成为业内一流机电工程综合服务公司；企业使命——为客户提供更好服务，为员工搭建广阔舞台；核心价值观——诚信、公正、稳健、创造。另加一行企业作风：干工程交朋友树口碑，争先锋做表率立诚信。
- [ ] **Step 4: 业务版图 chips**：7 个 `.chip`：机电 · 消防 · 智能化 · 消电检 · 安全评估 · 平台 · 远程值守。
- [ ] **Step 5: 里程碑时间线**：`.milestones` 左侧竖金线 + 5 节点（圆点+年份+事件）：
  1. 国内首家提出消防维保概念，并成功应用于中国服务大厦项目
  2. 在首都机场 T1 航站楼率先提出并实施弱电系统集成工程
  3. 2021 疫情期间，5000 个方舱房间弱电消防工程工期压缩到 2 周完成，并采用无线报警传输方式
  4. 2023 推出华信一站式消防管家服务平台
  5. 2025 推出消控室远程值守产品和服务
- [ ] **Step 6: 样式**：stats 深蓝底金数字 56px；about 浅灰底（`--gray-bg`）；culture-band 深蓝底金字 32px；value-card 白卡 hover 微升+金顶线；chips 圆角胶囊灰底 hover 金边；milestones 桌面两列/移动单列。
- [ ] **Step 7: 核验** — 浏览器滚动查看各元素 reveal 渐入、图片无拉伸、文案与 PPT 一致；控制台无报错
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: 数据带+关于我们板块"`

### Task 4: 业务服务（三驾马车 tab + 十项闭环）

**Files:**
- Modify: `index.html`、`css/sections.css`

**Interfaces:**
- Consumes: `.sec-head`（Task 2）
- Produces: `.service-tabs`（按钮组 `.tab-btn[data-tab]` + 面板 `.tab-panel[data-panel]`，激活类 `.active`，供 Task 10 JS 切换与滑动手势）、`.closed-loop` 流程节点（`.loop-node`，点亮类 `.lit`）

- [ ] **Step 1: 板块头 + tab 按钮**：`<section id="services" class="services">`，.sec-head（en=OUR SERVICES，title=业务服务，sub=工程施工 · 维护维保 · 智慧消防 三驾马车）。三个 `.tab-btn[data-tab="eng|maint|smart"]`：工程施工 / 维护维保 / 智慧消防。
- [ ] **Step 2: 面板 1 工程施工**：5 张 `.svc-card`（标题+资质+说明）：
  - 机电设备安装｜建筑机电安装工程专业承包贰级｜前期可研、立项、设计+施工的 EPC 服务，为业主实施新建、改造工程服务
  - 消防设施工程｜消防设施工程专业承包贰级｜消防弱电施工、消防电工程、火灾自动报警系统、气体灭火设备安装，一体化全过程专业服务
  - 电子与智能化工程｜电子与智能化工程专业承包贰级｜弱电系统集成、安防视频、综合布线、机房设备维护、末端节点设备安装维护
  - 建筑装修装饰｜建筑装修装饰工程专业承包贰级｜建筑装修装饰专业承包贰级资质范围内的工程服务
  - 施工劳务｜施工劳务（不分等级）｜具备大型会战实施能力，在重点项目及应急抢险救援项目中能打硬仗
  底部备注：从前期可研、立项到设计施工，公司具备覆盖机电安装、消防设施、电子智能化、装修装饰与施工劳务的完整施工能力；抢工期间可动员劳务人员千余人。
- [ ] **Step 3: 面板 2 维护维保**：左文案（为用户提供维保服务、消电检及消防安全评估的一站式消防管家服务，覆盖消防设施全生命周期的日常技术保障）+ 3 特性卡：维保服务 / 消电检 / 消防安全评估；横幅：7×24 小时响应 · 驻场 + 巡检 · 年度检测。
- [ ] **Step 4: 面板 3 智慧消防**：自研「华信智慧消防云平台」功能网格 7 项：AI 视频算法 / 数字孪生 / 智能维保 / 设备巡查 / 智慧用电 / 可燃气体探测 / 远程监控。
- [ ] **Step 5: 十项闭环**：`.closed-loop` 横向 10 节点（桌面一行，箭头连接；移动竖排）：消防报审 → 图纸会审 → 项目施工 → 关系协调 → 消防验收 → 消防评估 → 消防检测 → 消防维修与维保 → 消防培训 → 消防保险。副文案：业主只需对接一家，从报审到保险的十个环节全部覆盖。
- [ ] **Step 6: 样式**：`.tab-btn` 灰色下划线，`.active` 深蓝文字+金色下划线；`.tab-panel{display:none}` `.tab-panel.active{display:grid}`；svc-card 白卡金顶线 hover；loop-node 圆点灰，`.lit` 金色发光。
- [ ] **Step 7: 核验** — 浏览器确认三个面板手动加 `.active` 类可切换显示（JS 未接）；流程节点 10 个齐全
- [ ] **Step 8: Commit** — `git add -A && git commit -m "feat: 业务服务板块"`

### Task 5: 智慧消防·远程值守 + 资质荣誉

**Files:**
- Modify: `index.html`、`css/sections.css`

**Interfaces:**
- Consumes: `.sec-head`（Task 2）
- Produces: `.smart-grid`（图叠层）、`.smart-cases` 4 卡、`.cert-grid` 灯箱触发（`<img class="cert-img" data-full="assets/img/cert-XX.jpg">`）、`.cert-badges` 认证横条

- [ ] **Step 1: 智慧消防·远程值守 HTML**：`<section id="smart" class="smart">` 深蓝底。.sec-head（en=SMART FIRE PROTECTION，title=智慧消防 · 远程值守，sub=北京消防协会首批认证远程值守中心）。左列文案：值守人员在岗状态实时可见，火警与故障信号集中受理，7×24 小时为客户进行远程值守；通话录音、操作记录留痕、签订责权协议，所有操作人员均持证上岗；半托管 · 全托管两种模式可选，实现消控室单人值班合规升级，帮助企业降本增效。右列图片叠层：`platform.jpg` 主图 + `ops.jpg` 右下角偏移层叠（金色描边）。
- [ ] **Step 2: 4 个落地案例卡**：
  - 北京地坛医院｜消防运营中心｜三甲医院消防运营集中管理，值守、告警、巡检统一受理
  - 中国服务大厦｜智慧消防项目｜国内首个提出消防维保概念并落地平台的项目
  - 首都机场集团办公楼·信息楼·科技档案馆·电视台｜四栋同步改造
  - 大兴机场公务机楼｜消控室单人值班项目｜单人值班合规化的样板，模式可复制到同类楼宇
- [ ] **Step 3: 资质荣誉 HTML**：`<section id="quals" class="quals">` 浅灰底。.sec-head（en=QUALIFICATIONS，title=资质荣誉，sub=6 项工程资质 · ISO 三体系 · AAA 信用 · 国家高新技术企业）。`.cert-grid` 12 张 `<img class="cert-img" loading="lazy">`（cert-01..12）；`.cert-badges` 横条 6 项：ISO9001 质量管理体系 / ISO14001 环境管理体系 / ISO45001 职业健康安全 / 企业信用等级 AAA / 国家高新技术企业 / 北京消防协会单位会员。
- [ ] **Step 4: 灯箱 HTML**：`<div class="lightbox" hidden><button class="lb-close">×</button><img class="lb-img"><button class="lb-prev">‹</button><button class="lb-next">›</button></div>`（Task 10 接 JS）。
- [ ] **Step 5: 样式**：smart 深蓝底白字，案例卡半透明深色卡金边；cert-grid 4 列网格白卡衬证书图（object-fit:contain 防裁剪）；badges 胶囊横条；lightbox fixed 全屏黑底遮罩、大图居中 max 90vh。
- [ ] **Step 6: 核验** — 浏览器确认图片显示、无拉伸；lightbox 手动取消 hidden 可显示大图
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: 智慧消防+资质荣誉板块"`

### Task 6: 团队专家 + 客户与案例

**Files:**
- Modify: `index.html`、`css/sections.css`

**Interfaces:**
- Consumes: `.sec-head`（Task 2）、tab 交互模式（Task 4）
- Produces: `.team-grid` 7 卡、`.org-chart` 层级、`.client-wall`（`.client-item`）、`.case-tabs`（复用 `.tab-btn[data-tab]`/`.tab-panel[data-panel]` 模式，面板 id 前缀 case-）

- [ ] **Step 1: 团队 HTML**：`<section id="team" class="team">` 白底。7 张 `.member-card`（姓名/职务/持证/代表）：
  - 李华｜总经理｜荷兰商学院 DBA 博士｜横跨机场、地铁、通信、高校、酒店的 14 项重点工程——从单体楼宇到城市轨道交通线网；6 条北京轨道交通线路的机电与消防系统建设经历
  - 武仁杰｜副总经理 · 综合部经理｜一级建造师（机电）2015 · 一级消防工程师 2024｜电子城 IT 产业园、万寿路甲 15 号院五区节能综合改造、上海嘉定行政服务中心、北京信息科技大学、北京新机场公务机楼
  - 张炯锋｜市场部经理 · 公司法定代表人｜一级建造师（机电）2023 · 中级消防员｜地坛医院消防工程和安防工程、大兴公务机空侧维修机库/停机库/特车库消防中控室集成改造、通马路综合交通枢纽 A 区消防/弱电、首都公务机楼消防管理服务
  - 卢秀文｜履约部经理｜二级造价师（安装）2024 · 建（构）筑物中级消防员 2016｜重庆江北机场、北京中航总部大厦、卫星通讯大厦、专利大厦、北京地铁 7/8/西郊线、7 号线二期、昌南线、房山线北延、19 号线二期等投标
  - 陈飞虹｜工程主管｜19 号线开通保障优秀单位 · 优秀员工｜首都机场东海康得思酒店、金盖方舱医院、地铁 19 号线、国家粮食和物资储备局月坛北街 25 号院、首都机场 2 号航站楼 1301 气体灭火更新、T1/T2 消防稳压罐更换、T2 消防水炮更新改造
  - 于东鹰｜市场主管 · 智慧消防｜思科认证网络工程师｜智慧消防平台建设、消防中控室值班技术推广、硬件集成、软件开发、地坛医院消控室单人值班、中国服务大厦智慧消防
  - 郑健｜财务主管｜会计中级职称 · 2023/2024 连续两年优秀员工｜全盘账务审核、月度结账、财务报表及经营分析、资金收支、税务筹划、财务制度、内控流程、成本核算、预算管理
- [ ] **Step 2: 组织架构**：`.org-chart` 简化为两级：总经理 → 常务副总经理 →（副总经理·办公室·核查办·财务副经理·市场规划副经理·合同履约副经理）→ 商务中心（下辖第一中心/第二中心/第三中心/维保）。CSS 树形连线（border 线 + 节点块）。
- [ ] **Step 3: 客户墙 HTML**：`<section id="cases" class="cases">` 浅灰底。.sec-head（en=CLIENTS & CASES，title=客户与案例，sub=长期服务对象覆盖机场、轨道交通、三甲医院、文体场馆、央企高校与政府机关——共 13 组重点客户）。`.client-wall` marquee 容器（JS 复制内容实现无限滚动），13 个 `.client-item` 文字标识：首都机场集团 / 大兴国际机场 / 北京地铁 / 北京公交有轨电车有限公司 / 首都医科大学附属北京地坛医院 / 首都图书馆 / 北京首都机场希尔顿酒店 / 东海康得思酒店 / 中国航空集团 / 中国卫通 / 中国地质大学 / 北京信息科技大学 / 国家粮食和物资储备局。
- [ ] **Step 4: 案例 tab**：`.case-tabs` 3 个按钮：工程实施（15 项）/ 消防维保（11 项）/ 智慧消防（4 项）。面板 1 编号列表（逐字）：
  01 北京地铁 7 号线工程 FAS 系统及气体灭火设备安装工程 I 标段
  02 北京地铁 8 号线三期工程 FAS 系统及气体灭火设备安装工程 II 标段
  03 北京市轨道交通房山线北延工程火灾自动报警系统及气体灭火设备安装工程
  04 北京地铁 19 号线工程 FAS 系统及气体灭火设备安装工程 II 标段
  05 北京市轨道交通昌平线南延工程火灾自动报警、气体灭火及集中控制型疏散指示系统设备安装工程
  06 中国航空集团总部大厦项目消防工程
  07 首都机场 2 号航站楼消防主机扩容改造项目
  08 北京新机场公务机楼工程消防专业分包工程
  09 北京信息科技大学新校区建设工程第一教学组团项目弱电工程/消防电工程
  10 北京通州文化旅游区通马路综合交通枢纽项目 A 区消防工程/弱电工程
  11 北京新机场飞行区附属工程 1 号消防站及急救站机电专业分包工程
  12 北京首都机场东海康得思酒店机电维修改造工程
  13 北京大兴国际机场飞行区充电桩二期项目
  14 中国卫星通讯大厦机电及消防工程
  15 中国地质大学（北京）交流中心改造消防工程
  附注：已完工程均通过消防验收并投入使用，可提供合同与验收资料供核查。
  面板 2（11 项，逐字）：
  01 北京首都机场物业管理有限公司七处楼宇消防维保及监控服务项目
  02 北京大兴国际机场运行办服务楼宇消防设备维保项目
  03 北京大兴国际机场消防管理部火警指挥调度系统维保服务项目
  04 大兴公务机兴和楼及陆侧园区消防管理服务项目
  05 大兴机场货运区消防设备设施维保项目
  06 北京首都机场旅业有限公司首都机场希尔顿酒店消防系统维护技术服务项目
  07 民航营业大厦消防维保项目
  08 首都图书馆消防维保服务项目
  09 首都医科大学附属北京地坛医院及顺义院区消防维保服务项目
  10 北京首都机场东海康得思酒店消防维保项目
  11 哈尔滨太平国际机场公共区域建筑消防设施设备巡查、保养维修及年度消防安全检测服务项目
  附注：远程值守中心集中受理火警与故障信号，分级派单到人；驻场班组日常维护，按周期巡检并留痕；消电检与消防安全评估同步交付，形成完整合规档案。
  面板 3（4 项）：与 Task 5 案例卡同源，此处为编号列表：01 北京地坛医院·消防运营中心 / 02 中国服务大厦·智慧消防项目 / 03 首都机场集团办公楼·信息楼·科技档案馆·电视台四栋同步改造 / 04 大兴机场公务机楼·消控室单人值班项目。
- [ ] **Step 5: 样式**：member-card 白卡（头像占位用姓名首字圆形金字徽章），hover 金顶线；org-chart 连接线 2px `--blue-bright`；client-item 灰色粗体大字 hover 变深蓝；case 列表两列卡片式编号（金色编号大字 + 项目名）。
- [ ] **Step 6: 核验** — 浏览器核对案例编号与名称逐字一致（重点：15/11/4 项数量）；组织架构连线正常
- [ ] **Step 7: Commit** — `git add -A && git commit -m "feat: 团队+客户案例板块"`

### Task 7: 联系我们 + 页脚

**Files:**
- Modify: `index.html`、`css/sections.css`

**Interfaces:**
- Consumes: `.sec-head`（Task 2）
- Produces: `.contact-cards`、`.footer`

- [ ] **Step 1: 联系我们 HTML**：`<section id="contact" class="contact">` 深蓝底。.sec-head（en=CONTACT US，title=联系我们，sub=期待与您合作）。3 张信息卡（金色图标 SVG + 标题 + 内容）：电话｜13366130540；邮箱｜13366130540@163.com；地址｜北京市顺义区首都机场。加公众号卡：微信公众号｜北京中航华信机电设备安装有限公司。背景装饰：SVG 细线网格 + 金色渐变光斑。
- [ ] **Step 2: 页脚 HTML**：`.footer` 深色底：logo + 公司全称 + 三驾马车链接（工程施工·维护维保·智慧消防 锚点）+ 版权行「© 2026 北京中航华信机电设备安装有限公司 版权所有」+「京ICP备XXXXXXXX号」占位。
- [ ] **Step 3: 样式**：contact 卡深色半透明金边；footer 小字灰、链接 hover 金色。
- [ ] **Step 4: 核验** — 浏览器确认电话邮箱地址正确（13366130540 / 13366130540@163.com / 北京市顺义区首都机场）；备案占位存在
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: 联系我们+页脚"`

### Task 8: JS 交互（main.js）

**Files:**
- Create: `js/main.js`
- Modify: `index.html`（`<script src="js/main.js" defer>`）

**Interfaces:**
- Consumes: 所有 Task 2-7 产出的类名与 data 属性（`.reveal`、`.stat-num[data-target]`、`.tab-btn[data-tab]`/`.tab-panel[data-panel]`、`.loop-node`、`.cert-img[data-full]`、`.client-wall`、`.site-nav`、`.nav-toggle`、`.hero-particles`）
- Produces: 全局 init 函数与事件绑定；无对外 API

- [ ] **Step 1: 写 main.js 骨架与守卫**：IIFE + `'use strict'`；`const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`；DOMContentLoaded 后依次调用各 init；每个模块独立函数并在文件头注释列出。
- [ ] **Step 2: 导航**：滚动 >80px 时 `.site-nav` 加 `.scrolled`；汉堡点击切换 `.nav-open`（body 锁定滚动），点击链接后关闭；IntersectionObserver 监听 `section[id]`，`rootMargin: '-40% 0px -55%'` 时给对应 `.nav-links a[href="#id"]` 加 `.active`；锚点点击默认 smooth（CSS 已设），JS 仅做 `scroll-margin-top: 80px` 补偿（用 CSS `section{scroll-margin-top:80px}` 更简单，写入 sections.css）。
- [ ] **Step 3: reveal 观察器**：`new IntersectionObserver` 对 `.reveal` 加 `.in-view`（`threshold: .12`，进入后 unobserve）；对 `.loop-node` 加 `.lit` 并按索引 stagger（`setTimeout(i*180)`）；对 `.stats-band` 进入时启动数字滚动。
- [ ] **Step 4: 数字滚动**：`.stat-num[data-target]` 用 rAF 从 0 缓动到 target（easeOutCubic，1200ms），显示为整数；reduceMotion 时直接写入 target。
- [ ] **Step 5: tab 切换（服务与案例通用）**：点击 `.tab-btn` 时同容器内移除/添加 `.active`（按钮与面板按 `data-tab`/`data-panel` 匹配）；面板切换加淡入过渡类。
- [ ] **Step 6: 触摸滑动**：对 `.tab-panel.active` 的父容器绑定 touchstart/touchend，横向位移 >50px 且纵向 <30px 时切换到相邻 tab（首尾循环）。
- [ ] **Step 7: 证书灯箱**：点击 `.cert-img` 打开 `.lightbox`（hidden 移除、body 锁滚动），显示 `data-full` 大图；左右按钮/ESC/遮罩点击切换与关闭；当前索引保存在模块变量。
- [ ] **Step 8: 客户墙 marquee**：`.client-wall` 内容复制一份（`innerHTML += innerHTML`），CSS 动画 `@keyframes marquee{to{transform:translateX(-50%)}}` 线性无限，hover 时 `animation-play-state: paused`（CSS 实现，JS 仅做复制）。
- [ ] **Step 9: Hero 粒子**：`.hero-particles` canvas 全尺寸（devicePixelRatio 处理），50 个金色/白色小圆点自下而上漂浮、透明度呼吸，30fps rAF；`reduceMotion` 或视口 <768px 时不启动。
- [ ] **Step 10: 核验** — `node --check js/main.js` 通过；浏览器：控制台零报错；导航高亮跟随滚动、汉堡开合、数字滚动、tab 点击+滑动、灯箱开闭切换、marquee 滚动 hover 暂停、粒子漂浮；`prefers-reduced-motion` 模拟（DevTools Rendering）时粒子停止且 reveal 直显
- [ ] **Step 11: Commit** — `git add -A && git commit -m "feat: 全站交互脚本"`

### Task 9: 响应式打磨 + 全站验收

**Files:**
- Create: `css/responsive.css`
- Modify: `index.html`（确保 head 中 responsive.css 在最后引入）

**Interfaces:**
- Consumes: 全部类名（Task 2-8）

- [ ] **Step 1: 写 responsive.css**：`@media (max-width:1024px)`：container padding 24px、grid 列数降为 2、团队/证书 3 列；`@media (max-width:768px)`：`.section{padding:72px 0}`、单列、汉堡菜单（`.nav-links` 全屏展开面板，链接 44px 高）、Hero 标题 clamp 缩小、closed-loop 竖排、案例列表单列、org-chart 竖排（横向滚动容器）；`@media (orientation:landscape) and (max-height:500px)`：`.hero{min-height:70vh}`、导航压缩、section padding 减半；触摸目标 ≥44px。
- [ ] **Step 2: 全站验收清单逐项过**（对照 spec 第 9 节）：双击打开无报错；1920/1440/1024、390/375 竖屏与 844×390 横屏排版正常；锚点全部可跳（8 个导航项）；证书灯箱 12 张可遍历；文案与 PPT 一致；备案号占位在。
- [ ] **Step 3: 性能快查**：图片全部 `loading="lazy"`（hero 除外）；总页面 JS 无未用监听器泄漏；DevTools Lighthouse Performance ≥85 分目标（如低分则压缩图片质量至 78）。
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: 响应式适配与全站验收"`

---

## Self-Review 记录

- 规格覆盖：板块 1-11 均有对应任务（Task 2 导航/Hero、3 数据带/关于、4 业务、5 智慧消防/资质、6 团队/案例、7 联系/页脚、8 全部动效 JS、9 响应式）；素材映射在 Task 1；验收清单在 Task 9
- 占位符扫描：ICP 备案号为规格明示的交付占位符，非计划缺陷；无 TBD
- 类型一致性：`.tab-btn[data-tab]`/`.tab-panel[data-panel]` 命名在 Task 4 定义、Task 6 复用、Task 8 消费，一致；`.cert-img[data-full]` 定义于 Task 5、消费于 Task 8，一致；`.stat-num[data-target]` 定义于 Task 3、消费于 Task 8，一致

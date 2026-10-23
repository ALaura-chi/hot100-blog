# Hot 100 刷题博客复现规划

> 编写日期：2026-10-18。适用环境：Windows + PowerShell。
> 交付目标：做出一个类似参考页、能持续更新并公开访问的个人刷题博客。
> 本文是实施规划，执行进度以第 4 节的勾选状态为准；已核对参考页源码、题目链接及本机基础工具，目前没有创建网站或执行发布。

## 1. 目标、依据与实施顺序

- 参考页面：[hot_100 思路](https://slantedbookshelf.github.io/Blog/posts/hot_100/)。
- 对照仓库：[slantedbookshelf/Blog](https://github.com/slantedbookshelf/Blog)。用于理解结构，本方案另建自己的项目。
- 官方题单：[力扣热题 100](https://leetcode.cn/studyplan/top-100-liked/)。本文附录逐题列出从参考页提取的 100 个题目链接。
- 推荐方案：**Astro 静态网站 + Markdown 题解 + 原生 CSS / TypeScript 交互 + GitHub Pages**。
- 完成顺序：**3 题跑通内容 → 页面与交互 → 100 题目录 → 检查 → 发布 → 日常维护**。搭建网页不要求先写完 100 道题解。

### 1.1 已确认的参考页特征

以下来自实际读取的 HTML、CSS 和交互脚本；尺寸是样式声明值，不代表已经完成截图像素对比。

| 部分 | 参考页表现 | 复现目标 |
| --- | --- | --- |
| 技术 | Astro 构建，正文为静态 HTML | 构建出可直接托管的静态文件 |
| 布局 | 桌面端两列；容器最大 1120px，索引列 236px，列间距 18px | 先沿用这些尺寸，再用截图校准 |
| 顶栏 | 吸顶、半透明背景；含导航和主题按钮 | 保持阅读时可访问主要入口 |
| 索引 | 17 类、100 题；独立滚动；题目带难度圆点 | 点击定位，滚动时高亮当前题目 |
| 正文 | 标题、日期、分类、标签；按分类连续呈现题解 | 同一页浏览题意摘要、思路和代码 |
| 代码 | 高亮、语言栏、复制按钮 | 代码易读，复制后有成功或失败提示 |
| 主题 | 浅色、深色；读取系统偏好并记住手动选择 | 刷新后保留主题，首屏减少闪烁 |
| 阅读反馈 | 顶部 2px 进度条；锚点平滑定位 | 顶部接近 0%，底部接近 100% |
| 装饰 | 渐变光斑、Canvas 网格；鼠标影响网格，点击产生波纹 | 核心功能完成后增加，并支持减少动效 |
| AI 入口 | 页面有“问问博客”面板；本次读取的静态配置未设置 API 地址 | 列为可选扩展，接通服务需另做后端 |

### 1.2 第一版范围

**必做：**首页入口、Hot 100 长文页、分类索引、官方题目链接、难度、代码复制、主题、阅读进度、手机适配、静态部署。

**随后做：**背景网格与波纹、文章日期与标签展示、简单分类页、关于页、图标与分享信息。

**可选增强：**完成数量、复习日期、掌握状态筛选、全文搜索、AI 问答。这些增强不应阻塞首版上线。

## 2. 环境和所需软件

### 2.1 配置清单

| 软件 / 账户 | 选择与配置 | 验证方法 |
| --- | --- | --- |
| Windows | Windows 10/11；项目放在独立目录，例如 `D:\dev\hot100-blog` | 目录可写，且不在另一个 Git 仓库中 |
| Node.js | 使用 Node.js **24.x**；本地与 CI 使用同一主版本 | `node --version` 显示 `v24...` |
| npm | 随 Node 安装；仅用 npm 管理依赖 | `npm.cmd --version` 正常输出 |
| Git | 安装 Git for Windows；保留 Git Credential Manager | `git --version` 正常输出 |
| VS Code | 安装官方 Astro 扩展；Markdown 用内置预览 | `.astro` 有语法高亮，Markdown 可预览 |
| 浏览器 | Chrome 或 Edge；使用开发者工具检查手机尺寸 | 能打开 Elements、Console、Network |
| GitHub | 登录自己的账户；创建公开项目仓库 | 能打开仓库和 Actions、Settings 页面 |
| Astro | 安装在项目内，通过锁文件固定依赖 | `npm.cmd ls astro --depth=0` 输出版本 |
| 检查工具 | 项目开发依赖：`@astrojs/check`、`typescript` | `npm.cmd run check` 可运行 |

Astro 当前安装文档要求 Node.js 22.22.0 或以上，并不支持奇数主版本；本方案统一使用 24.x。[Astro 环境要求](https://docs.astro.build/en/install-and-setup/)

软件入口：[Node.js](https://nodejs.org/en/download)、[Git for Windows](https://git-scm.com/downloads/win)、[VS Code](https://code.visualstudio.com/)、[Astro 扩展](https://marketplace.visualstudio.com/items?itemName=astro-build.astro-vscode)。

本次只读检测结果：Node.js `v24.11.0`、npm `11.6.1`、Git `2.54.0.windows.1`，`code` 命令可用。没有修改软件版本或 Git 配置；VS Code 扩展是否安装仍需人工检查。

### 2.2 约定

- 下文命令在**网站项目根目录**执行，另有注明的除外。
- PowerShell 使用 `npm.cmd`，避免 `npm.ps1` 被执行策略拦截。
- 全文的 `YOUR_USERNAME` 都替换成自己的 GitHub 用户名。
- 远程仓库名统一为 `hot100-blog`，主分支为 `main`。
- 编码统一 UTF-8；提交 `package-lock.json`，忽略 `node_modules/`、`.astro/`、`dist/`、`.env*`。

## 3. 项目结构与内容约定

### 3.1 建议目录

```text
hot100-blog/
├─ .github/workflows/deploy.yml       # 自动构建与发布
├─ .nvmrc                            # 内容为 24
├─ astro.config.mjs
├─ package.json
├─ package-lock.json
├─ public/favicon.svg
├─ scripts/verify-build.mjs           # 检查构建结果与题目数据
├─ docs/
│  ├─ reference.md                   # 参考特征和范围
│  ├─ environment.md                 # 软件、依赖版本
│  ├─ acceptance.md                  # 验收结果
│  ├─ deployment.md                  # 地址、提交、上线检查
│  └─ screenshots/                   # 对照截图
└─ src/
   ├─ content.config.ts              # 内容集合及字段校验
   ├─ content/problems/
   │  ├─ 0001-two-sum.md
   │  └─ ...                         # 最终 100 个文件
   ├─ data/categories.ts             # 17 类名称、锚点、顺序
   ├─ layouts/BaseLayout.astro
   ├─ components/
   │  ├─ SiteHeader.astro
   │  ├─ ProblemIndex.astro
   │  ├─ ProblemSection.astro
   │  ├─ ThemeToggle.astro
   │  ├─ ReadingProgress.astro
   │  ├─ BackgroundEffects.astro
   │  └─ SiteFooter.astro
   ├─ pages/
   │  ├─ index.astro
   │  ├─ posts/hot_100.astro
   │  ├─ categories/index.astro
   │  ├─ about.astro
   │  ├─ problems.json.ts            # 构建时导出题目元数据
   │  └─ 404.astro
   ├─ scripts/reader.ts              # 定位、高亮、进度、复制
   └─ styles/global.css
```

**内容策略：**每题一个 Markdown 文件，构建时按顺序合并成长文。文件中保存唯一的题号、难度、分类和链接；索引与正文读取同一份数据。以后修改题名，不会破坏 `#problem-1` 这样的稳定锚点。

内容集合使用 `glob()` 读取 Markdown，并用 schema 校验字段；不要混用旧版内容集合示例。[Astro 内容集合文档](https://docs.astro.build/en/guides/content-collections/)

### 3.2 每题字段

| 字段 | 类型 / 示例 | 用途与约束 |
| --- | --- | --- |
| `problemId` | 整数，如 `1` | 力扣原题号；全局唯一，不是题单位置 |
| `title` | `两数之和` | 显示名称 |
| `category` | `哈希` | 必须属于规定的 17 类 |
| `difficulty` | `easy / medium / hard` | 显示简单 / 中等 / 困难 |
| `order` | 1～100 的整数 | 题单显示顺序；全局唯一 |
| `leetcode` | 官方题目完整地址 | 必须为 `https://leetcode.cn/problems/.../` |
| `status` | `unstarted / assisted / independent / review` | 未开始 / 看题解完成 / 独立完成 / 待复习 |
| `lastReviewed` | 可选日期，如 `2026-10-18` | 只有实际复习后才填写 |

**题解模板：**下列示例初始状态为未开始，实施时填入自己的分析和通过记录。

````markdown
---
problemId: 1
title: "两数之和"
category: "哈希"
difficulty: "easy"
order: 1
leetcode: "https://leetcode.cn/problems/two-sum/"
status: "unstarted"
---

**题目摘要**

用自己的话概括输入、输出和关键约束；完整题面通过原题链接查看。

**核心思路**

填写关键观察、算法选择，以及为什么正确。

**代码**

```java
// 填写自己验证通过的代码
```

**复杂度**

填写时间复杂度、空间复杂度和理由。

**易错点与复盘**

填写边界情况、第一次出错原因和下次检查重点。
````

用加粗文本标记题解内部小节，分类和题目标题由页面组件统一生成，避免合并 100 篇笔记后产生重复标题 ID。

## 4. 实施步骤完整清单

执行规则：每行是一项工作；完成“验收方法”后再勾选，并保存对应产出。截图、检查日志和发布记录是**实施时应生成的证据**，本文没有宣称这些证据已经存在。

### A. 固定参考和环境

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [x] | A01 | 保存参考 URL、目标路由及首版功能范围 | `docs/reference.md` | 写明首版必做项和可选项 |
| [x] | A02 | 记录参考页顶部、中部、底部，分别保存浅色和深色截图；用户已同意放宽原定 1440×900 固定视口要求 | `docs/screenshots/reference-desktop-*.png`；已归档 8 张不同原图，六个目标画面齐全，进度见 `docs/screenshots/A02桌面截图记录.md` | 用户已接受视口差异；原图、实际像素尺寸与主题位置均已核对，不作为固定视口像素对照基准 |
| [x] | A03 | 在 390×844 视口记录参考页导航、索引和长代码表现 | `docs/screenshots/reference-mobile-*.png`；共 8 张，详见 `docs/screenshots/A03手机截图记录.md` | CSS 视口及 PNG 尺寸均已核对；导航可展开 / 收起，题目索引常显并内部滚动，长代码自动换行 |
| [x] | A04 | 检查 Node、npm、Git 版本；必要时安装第 2 节的软件 | `docs/environment.md`、`docs/environment-checks.json` | 默认版本为 Node v24.11.0、npm 11.6.1、Git 2.54.0.windows.1，三个命令退出码均为 0，无需安装或升级 |
| [x] | A05 | 安装 / 检查 Astro 扩展，打开浏览器开发者工具 | `docs/A05编辑器与DevTools检查.md`、`docs/editor-devtools-checks.json` 及 4 张证据截图 | 官方 Astro 扩展 2.16.20 已安装，`.astro` 高亮正常，Elements / Console / Network 均通过检查 |
| [x] | A06 | 选一个独立项目父目录；确认未嵌套在其他 Git 仓库中 | `D:\dev`、`docs/A06项目目录检查.md`、`docs/project-location-checks.json` | 父目录读写正常，不属于已有 Git 仓库；项目位置为 `D:\dev\hot100-blog`，后续空间复核见 B01 记录 |
| [x] | A07 | 登录 GitHub，确认能创建仓库 | `docs/A07GitHub账户检查.md`、`docs/github-account-checks.json` 及 2 张证据截图 | 2026-10-20 已由用户截图确认登录 `ALaura-chi`，新建仓库表单可访问，Owner 与用户名一致；实际创建留到 H01 |

### B. 初始化项目

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [x] | B01 | 按第 5.1 节创建 Astro minimal 项目，目录名用 `hot100-blog` | `D:\dev\hot100-blog`、`docs/B01项目初始化验收.md`、`docs/project-initialization-checks.json` | 2026-10-20 截图与本地检查均确认 `package.json`、`src/pages/index.astro` 存在；Astro 7.4.1 已安装 |
| [x] | B02 | 进入项目，确认依赖安装完成 | `package-lock.json`、本地依赖、`docs/B02依赖安装验收.md`、`docs/dependency-installation-checks.json` | 2026-10-20 `npm.cmd ls astro --depth=0` 输出 `astro@7.4.1`，退出码 0；锁文件与本地版本一致 |
| [x] | B03 | 安装 `@astrojs/check` 与 `typescript` 开发依赖 | 更新后的依赖与锁文件、`docs/B03开发依赖验收.md`、`docs/development-tools-checks.json` | 2026-10-20 正确命令复核退出码 0；`@astrojs/check@0.9.11`、`typescript@6.0.3` 均为开发依赖，锁文件与本地一致 |
| [x] | B04 | 添加第 5.2 节的脚本、`.nvmrc` 和 Node 主版本约束 | `docs/B04脚本与版本配置验收.md`、`docs/project-configuration-checks.json` 及截图 | 2026-10-22 六项脚本齐全，Node 声明 `>=24 <25`、`.nvmrc` 为 `24`、锁文件已同步；类型检查 0 errors / 0 warnings / 0 hints，退出码 0 |
| [ ] | B05 | 创建 `docs/`、组件、内容、数据和脚本目录 | 第 3.1 节目录骨架 | 每个计划文件都有明确职责 |
| [ ] | B06 | 检查 `.gitignore`，记录实际 Node、npm、Astro 版本 | `.gitignore`、`docs/environment.md` | 锁文件被追踪；依赖、构建和环境文件被忽略 |
| [ ] | B07 | 启动开发服务器，访问终端显示的地址 | 可访问的空白首页 | 修改首页文字后浏览器自动更新 |
| [ ] | B08 | 确认 Git 已初始化，保存第一笔提交 | 初始化提交 | `git log -1 --oneline` 可见提交 |

### C. 建立题目数据和长文路由

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | C01 | 按附录顺序建立 17 类名称、英文锚点和分类排序 | `src/data/categories.ts` | 类别数为 17；英文锚点不重复 |
| [ ] | C02 | 建立 `problems` 内容集合，按第 3.2 节定义必填字段和枚举 | `src/content.config.ts` | 故意把难度写错时检查失败，改回后通过 |
| [ ] | C03 | 建立 1 两数之和、283 移动零、42 接雨水的样例文件 | 3 个 Markdown 文件 | 覆盖两个分类、三种难度；题号和链接匹配 |
| [ ] | C04 | 创建 `/posts/hot_100/` 页面，用 `getCollection()` 读取并按 `order` 排序，再用 `render()` 渲染正文 | `src/pages/posts/hot_100.astro` | 页面出现 3 题，显示顺序正确 |
| [ ] | C05 | 分类使用固定 ID，如 `category-hash`；每题使用 `problem-题号` | 稳定的正文锚点 | 修改题名后 `#problem-1` 仍能定位 |
| [ ] | C06 | 每题标题展示题号、官方题目链接、难度文字；外链新标签打开并设置 `rel` | `ProblemSection.astro` | 三题分别跳转至正确力扣题目 |
| [ ] | C07 | 让索引和正文共享排序后的题目数组，生成分类和题目导航 | `ProblemIndex.astro` | 索引 3 项和正文 3 项逐一对应 |
| [ ] | C08 | 创建静态 `problems.json` 接口，导出字段和题目锚点，供检查使用 | `src/pages/problems.json.ts` | 浏览器访问该 JSON 能读到 3 条数据 |

### D. 完成页面样式

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | D01 | 建立完整 HTML 布局，设置 `lang="zh-CN"`、viewport、标题和描述 | `BaseLayout.astro` | 每页只有一个主内容区，标题随页面变化 |
| [ ] | D02 | 建立第 5.3 节浅色 / 深色 CSS 变量、系统中文字体及等宽字体 | `global.css` 主题变量 | 正文、边框和背景均通过变量控制 |
| [ ] | D03 | 建立最大 1120px 容器、236px 左列和 18px 间距；正文列设 `minmax(0,1fr)` | 桌面两列布局 | 1440px 视口中正文和索引均可见，长代码不撑宽页面 |
| [ ] | D04 | 顶栏吸顶；添加博客名、首页、刷题、分类、关于、GitHub 和主题按钮 | `SiteHeader.astro` | 每个入口都指向已存在页面或有效外链 |
| [ ] | D05 | 索引设 `position:sticky; top:64px`，内部独立滚动 | 可滚动题目索引 | 滚动长文后索引仍可见；索引底部可到达 |
| [ ] | D06 | 添加文章标题、日期、分类、标签和页脚；个人信息使用自己的资料 | 文章页头与页脚 | 没有残留参考作者的名字、邮箱或模板占位文字 |
| [ ] | D07 | 正文约 16px、行高约 1.78；代码高亮先用 `github-dark`；长代码局部滚动 | 排版与代码样式 | 中文易读；页面整体没有横向滚动 |
| [ ] | D08 | 简单 / 中等 / 困难分别显示绿 / 黄 / 红；索引保留难度说明，正文显示文字 | 难度圆点和徽标 | 两种主题下均能辨认，不单靠颜色表达难度 |
| [ ] | D09 | 添加边框、4px 圆角、浅渐变光斑；装饰层禁用指针事件 | 静态背景层 | 背景不遮挡文字，不影响点击、选中和复制 |
| [ ] | D10 | 为小于 900px 设计单列；索引改为“展开题目目录”；小屏导航可展开 | 手机布局 | 390px 视口可打开目录、选择题目、收起目录；键盘也可操作 |

### E. 完成交互和装饰

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | E01 | 在 `<head>` 内提前设置主题：已保存选择优先，否则读取系统主题；处理存储不可用情况 | 首屏主题初始化 | 深色刷新不先出现明显浅色首屏；存储失败时页面仍可用 |
| [ ] | E02 | 主题按钮切换 `data-theme` 并保存选择，设置可理解的按钮名称 | `ThemeToggle.astro` | 切换后刷新仍保持选择，键盘 Enter 可触发 |
| [ ] | E03 | 题目锚点增加约 96px 的 `scroll-margin-top`；点击后保留 URL hash | 锚点定位 | 标题不被顶栏遮挡，复制 URL 到新标签能直达题目 |
| [ ] | E04 | 增加滚动定位逻辑，高亮当前题目并设置 `aria-current="location"` | 当前题目反馈 | 下滚、上滚、滚至底部时，高亮符合正文位置 |
| [ ] | E05 | 在顶部添加 2px 进度条；滚动比例限制在 0～1，短页不除以零 | `ReadingProgress.astro` | 顶部接近 0，底部接近 1，窗口缩放后仍正确 |
| [ ] | E06 | 给每个代码块生成语言栏和复制按钮；用代码纯文本复制并反馈结果 | 代码复制交互 | 粘贴结果与原代码一致，不包含按钮文字；失败时有提示 |
| [ ] | E07 | 滚动监听用被动监听与 `requestAnimationFrame` 合并更新；避免每个代码块重复绑定全局事件 | `src/scripts/reader.ts` | 连续滚动时交互正常，Console 无重复初始化错误 |
| [ ] | E08 | 增加 Canvas 网格；桌面鼠标影响网格、点击产生短波纹；隐藏标签页时暂停动画 | `BackgroundEffects.astro` | 动效可见；切回标签页正常恢复，正文交互不受影响 |
| [ ] | E09 | 尊重 `prefers-reduced-motion`；触屏减少网格交互；平滑滚动可退回立即定位 | 动效降级规则 | DevTools 模拟减少动效后，无波纹和非必要位移动画 |

### F. 补齐 100 题和博客入口

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | F01 | 按附录建立其余 97 个题目文件，正确填写题号、分类、难度、顺序和官方链接 | 共 100 个 Markdown 文件 | 数据中有 100 个唯一题号、100 个唯一顺序 |
| [ ] | F02 | 未写题解的条目显示“待补充”，状态设 `unstarted`；已写条目填入真实复盘 | 内容状态明确的 100 题 | 不会把占位代码展示成“已完成题解” |
| [ ] | F03 | 先完成并独立验证 3 篇样例题解；记录使用语言、复杂度和力扣提交结果 | 3 篇自己的完整题解 | 每篇有思路、可运行代码、复杂度、易错点 |
| [ ] | F04 | 创建首页和 Hot 100 入口；创建分类页与关于页 | 对应页面文件 | 所有站内导航都有落地页面，分类能定位至对应段落 |
| [ ] | F05 | 配置自己的 favicon、网站名、页面描述及 canonical；静态资源路径带上 base | 网站身份和页面元信息 | 标签页图标正确，canonical 指向自己的线上域名 |
| [ ] | F06 | 创建 404 页面，提供首页和刷题页入口 | `src/pages/404.astro` | 构建得到 `404.html`，页面能返回有效入口 |

### G. 构建与验收

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | G01 | 编写构建检查脚本：读取 `dist/problems.json` 和长文 HTML | `scripts/verify-build.mjs` | 发现错误时返回非零退出码，并指出具体题目 / 路径 |
| [ ] | G02 | 检查脚本核对 100 题、17 类、唯一题号 / 顺序、难度枚举、官方域名及 100 个题目锚点 | 自动检查结果 | 数据和 HTML 一致；不把顶部分类链接算作题目数 |
| [ ] | G03 | 补充脚本检查：每个索引 hash 都有目标，HTML 全局 ID 无重复，base 前缀后的本地资源确实存在 | 站内结构检查 | 删掉一个题目锚点时会失败，恢复后通过 |
| [ ] | G04 | 运行类型检查、生产构建和构建检查，按顺序修复错误 | `docs/checks.txt` | 第 5.5 节全部命令成功退出 |
| [ ] | G05 | 启动生产预览；按配置中的 base 访问；直接刷新长文页和含 hash 的地址 | 生产预览页面 | 路由、CSS、JS、favicon 均正常 |
| [ ] | G06 | 在 1440×900、768×1024、390×844 三个视口分别检查两种主题，保存截图 | `docs/screenshots/local-*.png` | 无整体横向溢出、文字遮挡或无法关闭的菜单 |
| [ ] | G07 | 与参考截图逐项对照容器、顶栏、索引、字体、间距、配色；登记并修正偏差 | `docs/acceptance.md` 对照记录 | 每项有通过结论或明确差异，不写未经验证的像素一致性 |
| [ ] | G08 | 用键盘检查菜单、主题、目录、代码复制；检查 Console 和 Network | 浏览器验收记录 | 焦点可见、无键盘陷阱、无站内资源 404 和未处理异常 |
| [ ] | G09 | 核对 100 个外链格式和去重；按分类人工打开原题核对，完整校对时勾选附录 | 题目链接校对记录 | 题号与标题对应；力扣限流 / 登录提示单独记录，不误判为链接失效 |
| [ ] | G10 | 检查首屏和滚动性能；发现长任务时先降低 / 关闭装饰，再复测 | 性能检查记录 | 阅读、选题和复制无明显卡顿；减少动效模式可用 |

### H. 发布部署

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | H01 | 在 GitHub 新建公开空仓库 `hot100-blog`，不额外初始化 README | 远程仓库 URL | 远程仓库没有与本地冲突的初始提交 |
| [ ] | H02 | 按第 5.4 节设置真实 `site`、`base`、静态输出和尾斜杠 | `astro.config.mjs` | 用户名、仓库名与实际完全一致 |
| [ ] | H03 | 检查所有站内链接和 public 资源通过 `BASE_URL` 或统一函数拼接 | 带前缀的 URL | `/hot100-blog/` 下没有误指向域名根路径的内部链接 |
| [ ] | H04 | 按第 6.1 节添加 GitHub Actions 工作流 | `.github/workflows/deploy.yml` | 触发分支为 `main`，Node 版本与本地一致 |
| [ ] | H05 | 在仓库 Settings → Pages 中选择 GitHub Actions 为 Source | Pages 设置 | 页面显示部署来源为 Actions |
| [ ] | H06 | 按第 6.2 节设置远程并推送；首次凭据认证用浏览器 / Credential Manager 完成 | 远程 main 分支 | GitHub 可见源码、锁文件及工作流 |
| [ ] | H07 | 打开 Actions，查看 build 和 deploy 两个作业；失败时修复根因再推送 | 成功的工作流运行 | 两个作业都成功，拿到 Pages 部署 URL |
| [ ] | H08 | 访问主页与 `/posts/hot_100/`，再直接刷新长文页和带锚点的链接 | 可公开访问的网站 | 无需作者登录；首页、文章及资源均成功加载 |
| [ ] | H09 | 在线检查主题保持、目录跳转、手机导航、代码复制和全部站内链接 | 线上验收记录 | 功能与本地生产预览一致 |
| [ ] | H10 | 写入实际 URL、部署时间、提交 SHA、Actions 运行链接和已知差异 | `docs/deployment.md` | 另一人可凭记录打开站点并找到对应代码 |
| [ ] | H11 | 修改一条样例复盘并再次提交，验证自动更新 | 第二次成功部署 | 页面显示新文字，证明日常更新链路可用 |
| [ ] | H12 | 给成功版本打标签，并记录第 6.3 节回退方法 | `v1.0.0` 标签 / 回退说明 | 可以确定最近一个可用版本 |

### I. 可选扩展与维护

| 完成 | 编号 | 具体操作 | 可验证中间产出 | 验收方法 |
| --- | --- | --- | --- | --- |
| [ ] | I01 | 按 `status` 统计已完成题目，可增加待复习过滤；统计口径写清楚 | 完成进度与过滤器 | 未开始不计完成；切换条件后计数匹配数据 |
| [ ] | I02 | 需要跨设备保存时，将状态和复习日期写入 Markdown 并提交 | Git 中的个人记录 | 第二台设备拉取后能读到相同记录 |
| [ ] | I03 | 若增加 AI 问答，单独规划服务端 API、访问控制和额度；只在配置可用时启用入口 | 可用的问答服务或明确停用的入口 | 前端和公开仓库不含 API 密钥；GitHub Pages 只托管前端 |
| [ ] | I04 | 每次更新题解后运行检查、预览，再推送；记录依赖升级前后的版本 | 维护流程 | 新增 / 修改题解不会破坏导航、构建和已完成记录 |

## 5. 实施时使用的命令与配置

### 5.1 初始化

在选好的独立项目父目录打开 PowerShell：

```powershell
node --version
npm.cmd --version
git --version
npm.cmd create astro@latest -- --template minimal
```

向导中：项目路径填 `./hot100-blog`，安装依赖选 Yes，初始化 Git 选 Yes。然后：

```powershell
cd hot100-blog
npm.cmd install --save-dev @astrojs/check typescript
npm.cmd run dev
```

首次按终端实际地址预览；配置 base 后通常访问 `http://localhost:4321/hot100-blog/`。端口被占用时以终端输出为准。停止开发服务器使用 `Ctrl+C`。[初始化方式](https://docs.astro.build/en/install-and-setup/)

### 5.2 npm 脚本与版本固定

在 `package.json` 中合并以下字段，保留向导生成的依赖和其他必要字段：

```json
{
  "engines": { "node": ">=24 <25" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "verify": "node scripts/verify-build.mjs",
    "ci": "npm run check && npm run build && npm run verify"
  }
}
```

`.nvmrc` 写入 `24`。它记录版本约定，Windows 上只有安装相应版本管理器才会自动切换；否则使用 Node 安装程序保持 24.x。`verify-build.mjs` 按 G01～G03 实现后才能运行完整 `ci`。

### 5.3 样式基准

以下配色和尺寸从参考页样式中提取，作为起点；响应式折叠方式是本方案的实现选择。

```css
:root {
  --bg: #f7f7f4;
  --surface: #ffffff;
  --text: #171a17;
  --muted: #4f574f;
  --border: #d9ddd4;
  --accent: #0f6b42;
  --radius: 4px;
}
:root[data-theme="dark"] {
  --bg: #111311;
  --surface: #161916;
  --text: #e9ece7;
  --muted: #a4aaa1;
  --border: #30372f;
  --accent: #8fd6a8;
}
.page-shell { width: min(1120px, calc(100% - 24px)); margin: auto; }
.article-layout { display: grid; grid-template-columns: 236px minmax(0, 1fr); gap: 18px; }
.problem-index { position: sticky; top: 64px; max-height: calc(100vh - 86px); overflow-y: auto; }
.article-body { min-width: 0; }
.problem-section, .category-heading { scroll-margin-top: 96px; }
.prose { font-size: 0.98rem; line-height: 1.78; }
.prose pre { overflow-x: auto; white-space: pre; }
@media (max-width: 900px) {
  .article-layout { grid-template-columns: minmax(0, 1fr); }
  .problem-index { position: static; max-height: 50vh; }
}
```

该片段只提供样式基准；移动目录的开关、按钮状态和焦点处理仍需按 D10 实现。

### 5.4 Astro 配置和路径

`astro.config.mjs`：

```javascript
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  base: '/hot100-blog',
  output: 'static',
  trailingSlash: 'always',
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
```

代码主题可在后续改为双主题，首版先保持参考页的深色代码风格。[代码高亮配置](https://docs.astro.build/en/guides/syntax-highlighting/)

站内路径通过 `import.meta.env.BASE_URL` 拼接；为了兼容有无尾斜杠的情况，统一处理：

```javascript
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const hot100Url = `${base}/posts/hot_100/`;
const faviconUrl = `${base}/favicon.svg`;
```

只给站内页面和 public 资源加前缀，力扣 / GitHub 等外链保持原地址。`site` 只填站点域名，仓库路径放在 `base` 中。[Pages 的 site / base 规则](https://docs.astro.build/en/guides/deploy/github/)

### 5.5 发布前检查

```powershell
npm.cmd ci
npm.cmd run check
npm.cmd run build
npm.cmd run verify
npm.cmd run preview
```

- `npm ci` 验证锁文件能还原依赖；通常在首次交付或依赖变更后执行，日常只改笔记无需重复安装。
- `check` 通过不代表页面视觉正确；还需完成 G05～G10。
- `build` 后应有 `dist/index.html`、`dist/posts/hot_100/index.html`、`dist/problems.json`、`dist/404.html` 和资源目录。
- `dist` 内路径通常不额外套 `hot100-blog/` 文件夹；URL 的仓库前缀由 Pages 和 Astro base 共同处理。
- 检查脚本移除 URL base 后再映射本地文件；目录链接映射至 `index.html`，资源 query / hash 先移除。

## 6. 发布部署详解

### 6.1 自动部署工作流

把下面内容保存为 `.github/workflows/deploy.yml`。这是本方案编写的工作流骨架；Actions 主版本与编写日 Astro 官方部署指南核对一致，实际实施仍需通过首次 CI 验证。

```yaml
name: Deploy Hot100 Blog

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Check, build and upload
        uses: withastro/action@v6
        with:
          node-version: 24
          package-manager: npm@11.6.1
          build-cmd: npm run ci

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

工作流要求 `verify-build.mjs` 已实现。若实施时选择其他 npm 版本，同时更新这里和 `docs/environment.md`；不要无记录地切换版本。不要把访问令牌写进 YAML。[官方部署流程](https://docs.astro.build/en/guides/deploy/github/)

### 6.2 首次推送

先在 GitHub 建空仓库并配置 Pages 的 Source。检查本地分支、远程和待提交文件：

```powershell
git status --short
git branch --show-current
git remote -v
```

新建项目、没有既有远程时执行：

```powershell
git add .
git commit -m "Build Hot100 reading blog"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hot100-blog.git
git push -u origin main
```

如果初始化时已经生成提交，继续追加自己的提交即可；如果已有 `origin`，先检查其地址，不能盲目重复添加或覆盖。首次认证按 Git Credential Manager 的浏览器提示完成。

预期地址：

```text
首页：https://YOUR_USERNAME.github.io/hot100-blog/
文章：https://YOUR_USERNAME.github.io/hot100-blog/posts/hot_100/
某题：https://YOUR_USERNAME.github.io/hot100-blog/posts/hot_100/#problem-1
```

最终以 GitHub 实际返回的部署地址为准。正式上线后，用未登录窗口或另一台设备访问；只在自己已登录浏览器中成功打开，不足以证明公开访问正常。

### 6.3 更新、回退与常见问题

日常更新：修改 Markdown → 本地检查与预览 → 提交 → 推送 → 确认 Actions 成功 → 核对线上文字。

首次成功后可记录版本：

```powershell
git tag v1.0.0
git push origin v1.0.0
```

需要回退时，找到引入问题的提交；对单个普通提交使用 `git revert BAD_COMMIT_SHA`，解决冲突并重新运行检查，再 `git push` 触发发布。把 `BAD_COMMIT_SHA` 替换为实际提交；涉及多次提交或合并提交时先确认依赖关系，再逐笔回退，保留历史。

| 现象 | 排查顺序 | 修复后的证据 |
| --- | --- | --- |
| npm 命令被 PowerShell 拦截 | 使用 `npm.cmd`，重开终端检查 PATH | 版本命令正常输出 |
| CI 提示 Node 不兼容 | 对照本地、工作流和 Astro 要求 | 两边使用 24.x，重新构建通过 |
| `npm ci` 失败 | 比较依赖声明和锁文件；本地正常安装后提交更新的锁文件 | 干净安装成功 |
| 页面有文字但样式 / 图标 404 | 检查 base 大小写和资源 URL | Network 中站内资源成功加载 |
| 发布作业权限失败 | 检查 Pages Source、仓库 Actions 设置和工作流 permissions | deploy 作业成功 |
| 首页正常但文章 404 | 检查文件路由、生成目录与线上路径；不要手写不同大小写 | 文章地址直接刷新成功 |
| 点击目录标题被遮住 | 调整锚点滚动偏移，与顶栏高度核对 | 选题后完整显示标题 |
| 复制失败 | 确认 HTTPS、浏览器剪贴板权限与失败提示 | HTTPS 下复制正常，拒绝权限时有反馈 |
| 手机上卡顿 | 先停用波纹 / 降低网格绘制，再测正文操作 | 滚动与选题恢复流畅 |
| 力扣返回限流或登录页 | 人工核对题目 slug 和官方题单，不高频重试 | 记录核对结果，区分限流和真实失效 |

自定义域名可在稳定上线后再配置；届时同步调整 `site`、`base`、DNS 和 Pages 域名设置，并重新检查全站链接。

## 7. 最终交付验收

- [ ] 站点源代码、锁文件和版本说明齐全，另一台同版本环境能安装、检查、构建。
- [ ] 17 类、100 个唯一题号、100 个有效格式的官方题目链接，顺序与附录一致。
- [ ] 至少 3 篇自己的完整题解；其余明确标记待补充，没有虚构完成记录。
- [ ] 两列阅读、手机目录、主题保持、锚点跳转、当前题目高亮、进度条、代码复制均通过。
- [ ] 三种视口 × 两种主题的截图已保存；差异和已知限制有记录。
- [ ] 类型检查、生产构建和构建结果校验全部通过；无站内资源 404。
- [ ] GitHub Actions 部署成功；公开地址、提交 SHA 和部署记录可追溯。
- [ ] 已验证一次内容更新发布；有可识别的稳定版本和回退办法。

## 8. 官方资料与实施参考

| 用途 | 资料 |
| --- | --- |
| 页面依据 | [参考页](https://slantedbookshelf.github.io/Blog/posts/hot_100/)；[参考仓库](https://github.com/slantedbookshelf/Blog) |
| 创建项目与版本要求 | [Astro 安装](https://docs.astro.build/en/install-and-setup/) |
| 内容读取与校验 | [内容集合](https://docs.astro.build/en/guides/content-collections/) |
| Markdown 编写 | [Markdown 内容](https://docs.astro.build/en/guides/markdown-content/) |
| 代码主题 | [语法高亮](https://docs.astro.build/en/guides/syntax-highlighting/) |
| 发布配置 | [Astro → GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) |
| 题目依据 | [力扣热题 100 学习计划](https://leetcode.cn/studyplan/top-100-liked/) |

## 附录 A. 100 道题目链接

来源：2026-10-18 从参考页正文提取的题号、分类、难度和官方链接，共 **17 类、100 题**。顺序沿用参考页，不按题号大小排序；它不等同于力扣对所有历史 Hot 100 版本的永久定义。已检查数量、去重和 URL 格式，未逐个确认 100 个外部页面的实时可访问性；实施时可勾选“校对”列。

| 校对 | 顺序 | 分类 | 题号与名称（官方链接） | 难度 |
| --- | --- | --- | --- | --- |
| [ ] | 1 | 哈希 | [1、两数之和](https://leetcode.cn/problems/two-sum/) | 简单 |
| [ ] | 2 | 哈希 | [49、字母异位词分组](https://leetcode.cn/problems/group-anagrams/) | 中等 |
| [ ] | 3 | 哈希 | [128、最长连续序列](https://leetcode.cn/problems/longest-consecutive-sequence/) | 中等 |
| [ ] | 4 | 双指针 | [283、移动零](https://leetcode.cn/problems/move-zeroes/) | 简单 |
| [ ] | 5 | 双指针 | [11、盛最多水的容器](https://leetcode.cn/problems/container-with-most-water/) | 中等 |
| [ ] | 6 | 双指针 | [15、三数之和](https://leetcode.cn/problems/3sum/) | 中等 |
| [ ] | 7 | 双指针 | [42、接雨水](https://leetcode.cn/problems/trapping-rain-water/) | 困难 |
| [ ] | 8 | 滑动窗口 | [3、无重复字符的最长子串](https://leetcode.cn/problems/longest-substring-without-repeating-characters/) | 中等 |
| [ ] | 9 | 滑动窗口 | [438、找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/) | 中等 |
| [ ] | 10 | 子串 | [560、和为 K 的子数组](https://leetcode.cn/problems/subarray-sum-equals-k/) | 中等 |
| [ ] | 11 | 子串 | [239、滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/) | 困难 |
| [ ] | 12 | 子串 | [76、最小覆盖子串](https://leetcode.cn/problems/minimum-window-substring/) | 困难 |
| [ ] | 13 | 普通数组 | [53、最大子数组和](https://leetcode.cn/problems/maximum-subarray/) | 中等 |
| [ ] | 14 | 普通数组 | [56、合并区间](https://leetcode.cn/problems/merge-intervals/) | 中等 |
| [ ] | 15 | 普通数组 | [189、轮转数组](https://leetcode.cn/problems/rotate-array/) | 中等 |
| [ ] | 16 | 普通数组 | [238、除自身以外数组的乘积](https://leetcode.cn/problems/product-of-array-except-self/) | 中等 |
| [ ] | 17 | 普通数组 | [41、缺失的第一个正数](https://leetcode.cn/problems/first-missing-positive/) | 困难 |
| [ ] | 18 | 矩阵 | [73、矩阵置零](https://leetcode.cn/problems/set-matrix-zeroes/) | 中等 |
| [ ] | 19 | 矩阵 | [54、螺旋矩阵](https://leetcode.cn/problems/spiral-matrix/) | 中等 |
| [ ] | 20 | 矩阵 | [48、旋转图像](https://leetcode.cn/problems/rotate-image/) | 中等 |
| [ ] | 21 | 矩阵 | [240、搜索二维矩阵 II](https://leetcode.cn/problems/search-a-2d-matrix-ii/) | 中等 |
| [ ] | 22 | 链表 | [160、相交链表](https://leetcode.cn/problems/intersection-of-two-linked-lists/) | 简单 |
| [ ] | 23 | 链表 | [206、反转链表](https://leetcode.cn/problems/reverse-linked-list/) | 简单 |
| [ ] | 24 | 链表 | [234、回文链表](https://leetcode.cn/problems/palindrome-linked-list/) | 简单 |
| [ ] | 25 | 链表 | [141、环形链表](https://leetcode.cn/problems/linked-list-cycle/) | 简单 |
| [ ] | 26 | 链表 | [142、环形链表 II](https://leetcode.cn/problems/linked-list-cycle-ii/) | 中等 |
| [ ] | 27 | 链表 | [21、合并两个有序链表](https://leetcode.cn/problems/merge-two-sorted-lists/) | 简单 |
| [ ] | 28 | 链表 | [2、两数相加](https://leetcode.cn/problems/add-two-numbers/) | 中等 |
| [ ] | 29 | 链表 | [19、删除链表的倒数第 N 个结点](https://leetcode.cn/problems/remove-nth-node-from-end-of-list/) | 中等 |
| [ ] | 30 | 链表 | [24、两两交换链表中的节点](https://leetcode.cn/problems/swap-nodes-in-pairs/) | 中等 |
| [ ] | 31 | 链表 | [25、K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/) | 困难 |
| [ ] | 32 | 链表 | [138、随机链表的复制](https://leetcode.cn/problems/copy-list-with-random-pointer/) | 中等 |
| [ ] | 33 | 链表 | [148、排序链表](https://leetcode.cn/problems/sort-list/) | 中等 |
| [ ] | 34 | 链表 | [23、合并 K 个升序链表](https://leetcode.cn/problems/merge-k-sorted-lists/) | 困难 |
| [ ] | 35 | 链表 | [146、LRU 缓存](https://leetcode.cn/problems/lru-cache/) | 中等 |
| [ ] | 36 | 二叉树 | [94、二叉树的中序遍历](https://leetcode.cn/problems/binary-tree-inorder-traversal/) | 简单 |
| [ ] | 37 | 二叉树 | [104、二叉树的最大深度](https://leetcode.cn/problems/maximum-depth-of-binary-tree/) | 简单 |
| [ ] | 38 | 二叉树 | [226、翻转二叉树](https://leetcode.cn/problems/invert-binary-tree/) | 简单 |
| [ ] | 39 | 二叉树 | [101、对称二叉树](https://leetcode.cn/problems/symmetric-tree/) | 简单 |
| [ ] | 40 | 二叉树 | [543、二叉树的直径](https://leetcode.cn/problems/diameter-of-binary-tree/) | 简单 |
| [ ] | 41 | 二叉树 | [102、二叉树的层序遍历](https://leetcode.cn/problems/binary-tree-level-order-traversal/) | 中等 |
| [ ] | 42 | 二叉树 | [108、将有序数组转换为二叉搜索树](https://leetcode.cn/problems/convert-sorted-array-to-binary-search-tree/) | 简单 |
| [ ] | 43 | 二叉树 | [98、验证二叉搜索树](https://leetcode.cn/problems/validate-binary-search-tree/) | 中等 |
| [ ] | 44 | 二叉树 | [230、二叉搜索树中第 K 小的元素](https://leetcode.cn/problems/kth-smallest-element-in-a-bst/) | 中等 |
| [ ] | 45 | 二叉树 | [199、二叉树的右视图](https://leetcode.cn/problems/binary-tree-right-side-view/) | 中等 |
| [ ] | 46 | 二叉树 | [114、二叉树展开为链表](https://leetcode.cn/problems/flatten-binary-tree-to-linked-list/) | 中等 |
| [ ] | 47 | 二叉树 | [105、从前序与中序遍历序列构造二叉树](https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | 中等 |
| [ ] | 48 | 二叉树 | [437、路径总和 III](https://leetcode.cn/problems/path-sum-iii/) | 中等 |
| [ ] | 49 | 二叉树 | [236、二叉树的最近公共祖先](https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/) | 中等 |
| [ ] | 50 | 二叉树 | [124、二叉树中的最大路径和](https://leetcode.cn/problems/binary-tree-maximum-path-sum/) | 困难 |
| [ ] | 51 | 图论 | [200、岛屿数量](https://leetcode.cn/problems/number-of-islands/) | 中等 |
| [ ] | 52 | 图论 | [994、腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/) | 中等 |
| [ ] | 53 | 图论 | [207、课程表](https://leetcode.cn/problems/course-schedule/) | 中等 |
| [ ] | 54 | 图论 | [208、实现 Trie (前缀树)](https://leetcode.cn/problems/implement-trie-prefix-tree/) | 中等 |
| [ ] | 55 | 回溯 | [46、全排列](https://leetcode.cn/problems/permutations/) | 中等 |
| [ ] | 56 | 回溯 | [78、子集](https://leetcode.cn/problems/subsets/) | 中等 |
| [ ] | 57 | 回溯 | [17、电话号码的字母组合](https://leetcode.cn/problems/letter-combinations-of-a-phone-number/) | 中等 |
| [ ] | 58 | 回溯 | [39、组合总和](https://leetcode.cn/problems/combination-sum/) | 中等 |
| [ ] | 59 | 回溯 | [22、括号生成](https://leetcode.cn/problems/generate-parentheses/) | 中等 |
| [ ] | 60 | 回溯 | [79、单词搜索](https://leetcode.cn/problems/word-search/) | 中等 |
| [ ] | 61 | 回溯 | [131、分割回文串](https://leetcode.cn/problems/palindrome-partitioning/) | 中等 |
| [ ] | 62 | 回溯 | [51、N 皇后](https://leetcode.cn/problems/n-queens/) | 困难 |
| [ ] | 63 | 二分查找 | [35、搜索插入位置](https://leetcode.cn/problems/search-insert-position/) | 简单 |
| [ ] | 64 | 二分查找 | [74、搜索二维矩阵](https://leetcode.cn/problems/search-a-2d-matrix/) | 中等 |
| [ ] | 65 | 二分查找 | [34、在排序数组中查找元素的第一个和最后一个位置](https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/) | 中等 |
| [ ] | 66 | 二分查找 | [33、搜索旋转排序数组](https://leetcode.cn/problems/search-in-rotated-sorted-array/) | 中等 |
| [ ] | 67 | 二分查找 | [153、寻找旋转排序数组中的最小值](https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/) | 中等 |
| [ ] | 68 | 二分查找 | [4、寻找两个正序数组的中位数](https://leetcode.cn/problems/median-of-two-sorted-arrays/) | 困难 |
| [ ] | 69 | 栈 | [20、有效的括号](https://leetcode.cn/problems/valid-parentheses/) | 简单 |
| [ ] | 70 | 栈 | [155、最小栈](https://leetcode.cn/problems/min-stack/) | 中等 |
| [ ] | 71 | 栈 | [394、字符串解码](https://leetcode.cn/problems/decode-string/) | 中等 |
| [ ] | 72 | 栈 | [739、每日温度](https://leetcode.cn/problems/daily-temperatures/) | 中等 |
| [ ] | 73 | 栈 | [84、柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/) | 困难 |
| [ ] | 74 | 堆 | [215、数组中的第K个最大元素](https://leetcode.cn/problems/kth-largest-element-in-an-array/) | 中等 |
| [ ] | 75 | 堆 | [347、前 K 个高频元素](https://leetcode.cn/problems/top-k-frequent-elements/) | 中等 |
| [ ] | 76 | 堆 | [295、数据流的中位数](https://leetcode.cn/problems/find-median-from-data-stream/) | 困难 |
| [ ] | 77 | 贪心算法 | [121、买卖股票的最佳时机](https://leetcode.cn/problems/best-time-to-buy-and-sell-stock/) | 简单 |
| [ ] | 78 | 贪心算法 | [55、跳跃游戏](https://leetcode.cn/problems/jump-game/) | 中等 |
| [ ] | 79 | 贪心算法 | [45、跳跃游戏 II](https://leetcode.cn/problems/jump-game-ii/) | 中等 |
| [ ] | 80 | 贪心算法 | [763、划分字母区间](https://leetcode.cn/problems/partition-labels/) | 中等 |
| [ ] | 81 | 动态规划 | [70、爬楼梯](https://leetcode.cn/problems/climbing-stairs/) | 简单 |
| [ ] | 82 | 动态规划 | [118、杨辉三角](https://leetcode.cn/problems/pascals-triangle/) | 简单 |
| [ ] | 83 | 动态规划 | [198、打家劫舍](https://leetcode.cn/problems/house-robber/) | 中等 |
| [ ] | 84 | 动态规划 | [279、完全平方数](https://leetcode.cn/problems/perfect-squares/) | 中等 |
| [ ] | 85 | 动态规划 | [322、零钱兑换](https://leetcode.cn/problems/coin-change/) | 中等 |
| [ ] | 86 | 动态规划 | [139、单词拆分](https://leetcode.cn/problems/word-break/) | 中等 |
| [ ] | 87 | 动态规划 | [300、最长递增子序列](https://leetcode.cn/problems/longest-increasing-subsequence/) | 中等 |
| [ ] | 88 | 动态规划 | [152、乘积最大子数组](https://leetcode.cn/problems/maximum-product-subarray/) | 中等 |
| [ ] | 89 | 动态规划 | [416、分割等和子集](https://leetcode.cn/problems/partition-equal-subset-sum/) | 中等 |
| [ ] | 90 | 动态规划 | [32、最长有效括号](https://leetcode.cn/problems/longest-valid-parentheses/) | 困难 |
| [ ] | 91 | 多维动态规划 | [62、不同路径](https://leetcode.cn/problems/unique-paths/) | 中等 |
| [ ] | 92 | 多维动态规划 | [64、最小路径和](https://leetcode.cn/problems/minimum-path-sum/) | 中等 |
| [ ] | 93 | 多维动态规划 | [5、最长回文子串](https://leetcode.cn/problems/longest-palindromic-substring/) | 中等 |
| [ ] | 94 | 多维动态规划 | [1143、最长公共子序列](https://leetcode.cn/problems/longest-common-subsequence/) | 中等 |
| [ ] | 95 | 多维动态规划 | [72、编辑距离](https://leetcode.cn/problems/edit-distance/) | 中等 |
| [ ] | 96 | 技巧 | [136、只出现一次的数字](https://leetcode.cn/problems/single-number/) | 简单 |
| [ ] | 97 | 技巧 | [169、多数元素](https://leetcode.cn/problems/majority-element/) | 简单 |
| [ ] | 98 | 技巧 | [75、颜色分类](https://leetcode.cn/problems/sort-colors/) | 中等 |
| [ ] | 99 | 技巧 | [31、下一个排列](https://leetcode.cn/problems/next-permutation/) | 中等 |
| [ ] | 100 | 技巧 | [287、寻找重复数](https://leetcode.cn/problems/find-the-duplicate-number/) | 中等 |

分类数量核对：哈希 3 题；双指针 4 题；滑动窗口 2 题；子串 3 题；普通数组 5 题；矩阵 4 题；链表 14 题；二叉树 15 题；图论 4 题；回溯 8 题；二分查找 6 题；栈 5 题；堆 3 题；贪心算法 4 题；动态规划 10 题；多维动态规划 5 题；技巧 5 题。


# 新项目实施清单

本记录对应独立复现项目，不继承旧项目的 B01～B04 验收。依据为 `reference/original-plan.md`。状态“本地完成”仅覆盖本地实现；GitHub 和力扣的外部操作另列。

## B：初始化

| 步骤 | 状态与可验证产出 |
|---|---|
| B01 | 已从空目录手工建立 Astro minimal 结构；`package.json`、`astro.config.mjs`、`src/pages/index.astro`。绕过模板下载，不依赖原项目源码 |
| B02 | 安装锁文件对应依赖；`package-lock.json`、`node_modules/`；最终目录复验写入 `checks/final-workspace.txt` |
| B03 | `@astrojs/check@0.9.11`、`typescript@6.0.3`；见 package.json 和 ci.txt |
| B04 | `.nvmrc=24`、Node >=24 <25，dev/build/preview/check/verify/ci 六项脚本齐全，增加 test:algorithms |
| B05 | 组件、布局、内容、数据、脚本、示例和文档目录均有实际文件；README 项目地图说明职责 |
| B06 | `.gitignore` 和 `environment.md`；锁文件可追踪，依赖/构建/环境文件忽略 |
| B07 | 独立开发服务器在修改首页后自动显示 HMR 验证文字，随后还原；extra-qa.json |
| B08 | 在最终 D 盘新目录初始化独立 main 分支并提交；最终 Git 检查见 final-workspace.txt |

## C：数据和路由

| 步骤 | 状态与可验证产出 |
|---|---|
| C01 | 17 类及固定 slug：`src/data/categories.ts` |
| C02 | 内容 Schema：`src/content.config.ts`；错误难度负例已验证失败并还原 |
| C03 | 1、283、42 样例 Markdown，另补 200、287；examples/java 独立验证 |
| C04 | 长文路由使用 getCollection / render；最终完整输出 100 题 |
| C05 | category-slug / problem-ID 稳定锚点，题名不参与 ID；构建验证锚点齐全 |
| C06 | ProblemSection 展示题号、原题链接、难度；外链使用新标签和 noopener noreferrer |
| C07 | 索引和正文共享排序题目；100 项一一对应 |
| C08 | `src/pages/problems.json.ts` 静态导出 100 条数据和锚点 |

## D：样式

| 步骤 | 状态与可验证产出 |
|---|---|
| D01～D02 | BaseLayout：中文 lang、viewport、各页标题/描述；global.css：主题变量、系统字体 |
| D03～D05 | 1120/236/18 桌面布局、吸顶导航、独立滚动索引；六张视口主题截图 |
| D06 | 自有博客名、日期、分类、标签、页脚，无参考作者身份残留 |
| D07～D08 | 正文排版、github-dark 高亮、代码局部滚动、难度文字和三色标记 |
| D09～D10 | 网格/渐变/边框；手机折叠目录、可展开导航；浏览器和键盘验收通过 |

## E：交互

| 步骤 | 状态与可验证产出 |
|---|---|
| E01～E02 | head 提前设置主题；保存优先、系统回退、存储失败保护；刷新和禁用存储均通过 |
| E03～E04 | 96px scroll-margin、URL hash、aria-current 当前题目；200 定位和 287 底部高亮通过 |
| E05 | 2px 阅读进度；比率限制和短页保护；底部 100% 通过 |
| E06 | 五个代码块生成语言栏/复制按钮，成功和失败反馈均通过 |
| E07 | passive scroll + requestAnimationFrame 合并更新；缓存位置并在大小变化时重测 |
| E08～E09 | Canvas 网格、鼠标影响和点击波纹；隐藏暂停、触屏和减少动效降级；静态 Canvas 负载检查通过 |

## F、G：内容和验收

| 步骤 | 状态与可验证产出 |
|---|---|
| F01～F02 | 100 篇 Markdown，95 篇明确待补充；个人 status 全部 unstarted |
| F03 | 五篇独立样例 + 2005 项本地 Java 断言完成；力扣平台提交未执行，不能勾作平台通过 |
| F04～F06 | 首页/分类/关于/404，favicon、描述、canonical 和 base 齐全 |
| G01～G03 | verify-build.mjs，100 题/17 类/唯一性/官方域名/锚点/站内资源；缺锚点负例通过 |
| G04 | npm run ci 全流程成功；checks/ci.txt |
| G05～G06 | 生产预览、直接路由、三视口两主题；browser-qa.json 和 screenshots/ |
| G07～G08 | 逐项视觉对照、键盘、Console/资源网络验收；acceptance.md |
| G09 | 100 链接结构核验通过；尝试读取全部官方页面及官方 description 子路由，96 项题号/题名匹配、1 项题名存在同义简称、3 项读取超时；external-links.json 逐项记录，不将超时误报为失效 |
| G10 | 本机加载/连续滚动抽样与减少动效测试；extra-qa.json，记录实测局限 |

## H、I：发布与维护

| 步骤 | 状态与可验证产出 |
|---|---|
| H02～H04 | site/base 静态配置、统一路径函数、Actions 工作流已完成；账号为 ALaura-chi |
| H01、H05～H12 | 需要指定账号实际授权后执行；实际仓库、运行、SHA、线上验证和标签均以 deployment.md 为准 |
| I01～I03 | 可选过滤/跨设备状态/AI 服务未启用；首页只统计题目、分类和样例笔记数 |
| I04 | README 写明修改、检查、预览、推送流程；锁文件和 CI 防止无意破坏 |

## 用户追加：当前浏览器个人草稿

按用户选择新增每题“编辑我的草稿”：支持笔记与 Java 编辑、自动保存、原样恢复、每题独立预览、全部导出、确认导入，以及存储受限与多标签页冲突反馈。数据只保留在当前浏览器，没有同步或改写公开题解。说明见 `drafts.md`，独立功能测试见 `checks/drafts-qa.json`。

回归测试同时修复直接打开 `#problem-200` 时，服务端默认第一题与实际题目可能同时高亮的问题。

第一版内容范围与复现差异见 `reference.md`；完整验收证据见 `acceptance.md`。

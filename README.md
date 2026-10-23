# ALaura · Hot 100 算法笔记

以参考博客的绿色主题、双栏索引和长文阅读形式为基础，使用 Astro 重新实现的独立项目。

当前包含 **100 道题、17 个分类、5 篇完整 Java 样例笔记**。另外 95 篇明确标记为待补充。所有个人练习状态均为 `unstarted`，本地样例测试不等同于力扣提交通过。

## 打开项目

最终项目目录：`D:\dev\hot100-blog-rebuild`。原项目 `D:\dev\hot100-blog` 不参与本次实现。

需要 Node.js 24、npm，以及运行算法测试所需的 JDK 17。已安装依赖时，可双击 `start.cmd`，或在 VS Code 终端执行：

```powershell
Set-Location -LiteralPath 'D:\dev\hot100-blog-rebuild'
npm.cmd run dev
```

打开终端显示的地址，通常为：

- 首页：<http://localhost:4321/hot100-blog/>
- 刷题长文：<http://localhost:4321/hot100-blog/posts/hot_100/>

请保留 `/hot100-blog/` 前缀。如果端口已占用，以终端显示的端口为准。停止服务按 `Ctrl+C`。

从 Git 克隆或依赖目录不存在时，先执行 `npm.cmd ci`。Windows PowerShell 使用 `npm.cmd` 可避免脚本执行策略拦截 `npm.ps1`。

## 内容怎么改

每一道题对应 `src/content/problems/` 中一个 Markdown 文件。例如 `0001-two-sum.md`：

```yaml
problemId: 1
title: "两数之和"
category: "哈希"
difficulty: "easy"
order: 1
leetcode: "https://leetcode.cn/problems/two-sum/"
status: "unstarted"
noteReady: true
```

- `difficulty`：`easy` / `medium` / `hard`。
- `status`：`unstarted` 未开始、`assisted` 借助提示、`independent` 独立完成、`review` 待复习。按真实练习结果填写。
- `noteReady`：完整题解为 `true`，待补充为 `false`，与个人练习状态分别管理。
- 正文写题目摘要、思路、Java 代码、复杂度和易错点；可增加 `lastReviewed: "2026-10-23"`。
- 题名修改后同步 `src/data/problem-index.json` 中的元数据；已有 `problemId`、`order` 不随意变动。锚点仅由题号生成，不随题名变化。
- `scripts/seed-content.mjs` 仅用于初次生成，会覆盖笔记；日常更新直接编辑 Markdown。

## 检查与预览

```powershell
npm.cmd run ci
npm.cmd run preview
```

`ci` 依次执行类型检查、2005 项 Java 算法断言、生产构建、题目/导航/资源检查。预览通常使用 `http://localhost:4321/hot100-blog/`，仍以终端输出为准。

浏览器验收脚本单独运行，需要自行安装 Playwright 并传入其模块目录：

```powershell
node scripts/browser-qa.cjs '你的Playwright模块绝对路径'
node scripts/extra-qa.cjs '你的Playwright模块绝对路径'
```

运行前先用 `npm.cmd run preview -- --host 127.0.0.1 --port 4391` 启动生产预览。脚本默认使用本机 Chrome；可通过 `CHROME_PATH` 指定。`extra-qa` 会临时修改并恢复源码和构建文件，结束后再次运行 `npm.cmd run ci`。

## 项目地图

| 位置 | 用途 |
|---|---|
| `src/pages/` | 首页、刷题、分类、关于、404 和 JSON 输出 |
| `src/content/problems/` | 100 篇独立 Markdown |
| `src/data/` | 题目清单与 17 个分类 |
| `src/components/` | 顶栏、索引、题目段落、页脚等 |
| `src/styles/global.css` | 浅深主题、桌面和手机样式 |
| `src/scripts/reader.ts` | 主题、复制、滚动、目录、网格动效 |
| `examples/java/` | 五个算法实现与测试 |
| `scripts/` | 生成、构建校验和浏览器验收 |
| `.github/workflows/deploy.yml` | GitHub Pages 自动部署 |
| `docs/implementation.md` | B 起实施清单和证据 |
| `docs/acceptance.md` | 验收结论、截图和已知差异 |
| `docs/deployment.md` | 发布状态、步骤和回退 |

## 发布

目标账号为 **ALaura-chi**，仓库为 **hot100-blog**。预计站点地址为 `https://alaura-chi.github.io/hot100-blog/`；此地址在实际部署成功前仅是配置目标。

在 GitHub 将 Pages 的 Source 设置为 GitHub Actions，向 `main` 推送即执行检查与发布。详细步骤和实际进度见 [部署记录](docs/deployment.md)。

参考：[SlantedBookshelf 的 hot_100 思路](https://slantedbookshelf.github.io/Blog/posts/hot_100/)。页面代码和五篇样例说明在本项目重新编写，未复制参考作者的整篇题解，也未配置其身份信息和 AI 服务。

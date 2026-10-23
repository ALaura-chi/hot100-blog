# GitHub Pages 部署记录

更新时间：2026-10-23。当前状态：本地成品与工作流已准备，尚未声称已经上线。用户指定使用 **ALaura-chi**，已完成浏览器授权并通过 GitHub API 核对账号。

## 固定配置

| 项目 | 值 |
|---|---|
| 最终本地目录 | `D:\dev\hot100-blog-rebuild` |
| GitHub 所有者 | `ALaura-chi` |
| 仓库名 | `hot100-blog` |
| 发布分支 | `main` |
| site | `https://ALaura-chi.github.io` |
| base | `/hot100-blog` |
| 目标首页（待部署验证） | `https://alaura-chi.github.io/hot100-blog/` |
| 目标长文（待部署验证） | `https://alaura-chi.github.io/hot100-blog/posts/hot_100/` |
| 构建 | Node 24 / npm 11.6.1 / JDK 17，`npm run ci` |

本地初始提交：`1069b73`（Build Hot 100 study blog with Astro）。D 盘独立目录已重新安装 335 个锁定依赖并通过完整检查。设备登录入口超时后，改用 Git Credential Manager 的浏览器认证流程，成功核对账号为 ALaura-chi。无令牌、密码或临时授权码写入本仓库。

## 首次发布

1. 用 Git Credential Manager 的浏览器或设备流程登录 ALaura-chi；不要把密码或令牌粘贴进源码、终端命令或聊天。
2. 确认账号身份，再检查同名仓库。没有则创建公开空仓库；已有仓库先检查内容，不能覆盖或强制推送。
3. 在仓库 Settings → Pages 中选择 GitHub Actions。
4. 设置远程 `https://github.com/ALaura-chi/hot100-blog.git`，推送 main。工作流会先运行类型检查、算法测试、构建和结构校验，再发布。
5. 在 Actions 确认 build / deploy 成功，记录实际运行链接与提交 SHA。
6. 无痕或独立浏览器打开首页、长文、含 `#problem-200` 的直达链接；刷新并检查资源、主题、复制、目录和手机导航。
7. 修改一条真实样例复盘，再提交推送，验证第二次自动部署。成功后给该提交打 `v1.0.0` 标签。

## 实际发布证据

| 证据 | 当前记录 |
|---|---|
| 仓库 URL | 尚未完成指定账号认证后的核验 |
| 首次部署时间 / SHA | 待实际部署 |
| 首次 Actions 运行 | 待实际部署 |
| 公开访问验收 | 待实际部署 |
| 第二次部署 | 待实际部署 |
| 成功标签 | 待实际部署 |

## 以后更新

在 VS Code 修改 Markdown → `npm.cmd run ci` → `npm.cmd run preview` 检查 → `git add`、`git commit`、`git push`。不要把 node_modules、dist、环境变量和任何密钥提交到仓库。

## 回退

先在 Actions 找到最近一次成功部署对应的提交，检查差异后使用 `git revert <有问题的提交SHA>` 创建回退提交，再推送 main 重新发布。保留正常历史，不使用强制推送。`v1.0.0` 只在真实线上验收成功后创建。

## 官方参考

- [Astro 部署到 GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
- [GitHub Pages REST API](https://docs.github.com/en/rest/pages/pages)
- [Astro 内容集合](https://docs.astro.build/en/guides/content-collections/)

工作流采用官方 Astro 部署指南的当前组合：checkout v7、withastro/action v6、deploy-pages v5；另加 setup-java v5 以运行本项目的算法测试。

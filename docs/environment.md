# 环境记录

记录日期：2026-10-23（Asia/Shanghai）。本项目从 B 开始重新实施，旧项目的完成勾选不作为新项目的测试证据。

| 软件 | 实测版本 / 配置 |
|---|---|
| 系统 | Windows，PowerShell |
| Node.js | 24.11.0；`.nvmrc` 为 `24`；`engines` 为 `>=24 <25` |
| npm | 11.6.1 |
| Astro | 7.4.1 |
| @astrojs/check | 0.9.11 |
| TypeScript | 6.0.3 |
| Java / javac | JDK 17；用于五篇样例的独立测试 |
| Git | 2.54.0.windows.1 |
| 浏览器 | 本机 Chrome，验收引擎 Chromium 155.0.8059.85 |
| 目标目录 | `D:\dev\hot100-blog-rebuild` |
| 实现暂存目录 | `C:\Users\xy\Documents\ChatGPT\实习项目仿作\hot100-blog-rebuild-source` |
| 发布账号 | ALaura-chi（用户已确认） |
| 发布方式 | Astro 静态输出 + GitHub Actions + GitHub Pages |

依赖版本由 `package-lock.json` 锁定；`.gitignore` 忽略 `node_modules/`、`dist/`、`.astro/`、`.java-classes/`、`.env*` 和临时日志，保留锁文件和验收资料。

本机原有 Git Credential Manager 账号为 WLCaura。该账号与用户指定的账号不一致，不用于本项目推送；发布需要 ALaura-chi 的实际授权。没有修改系统全局 Git 身份或代理配置。

如当前终端需要通过用户已有 7890 HTTP/Mixed 代理联网，可在该终端设置：

```powershell
$env:HTTP_PROXY = 'http://127.0.0.1:7890'
$env:HTTPS_PROXY = 'http://127.0.0.1:7890'
$env:NODE_USE_ENV_PROXY = '1'
```

这些环境变量仅影响当前终端及其子进程；代理软件应保持运行。无需关闭 TLS 证书验证。

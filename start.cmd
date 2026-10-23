@echo off
chcp 65001 >nul
title Hot 100 Blog
pushd "%~dp0"
if not exist "node_modules\astro" (
  echo 请先在本目录运行 npm.cmd ci 安装依赖。
  pause
  popd
  exit /b 1
)
echo 请打开终端显示的本地地址，并保留 /hot100-blog/ 前缀。
echo 按 Ctrl+C 停止服务。
call npm.cmd run dev
popd

$ErrorActionPreference = 'Stop'
$source = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$target = [IO.Path]::GetFullPath('D:\dev\hot100-blog-rebuild')
$parent = Get-Item -LiteralPath 'D:\dev'
if ($parent.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'D:\dev must be a regular directory.' }
if ($target -ne 'D:\dev\hot100-blog-rebuild') { throw 'Unexpected target path.' }
if (Test-Path -LiteralPath $target) { throw 'The destination already exists. Nothing was copied or overwritten.' }
if (-not (Test-Path -LiteralPath (Join-Path $source 'src\pages\posts\hot_100.astro'))) { throw 'Missing source project.' }
New-Item -ItemType Directory -Path $target | Out-Null
$excluded = @('.git','node_modules','.astro','.java-classes','.npm-cache','.qa-profile')
foreach ($item in Get-ChildItem -LiteralPath $source -Force) {
    if ($item.Name -notin $excluded) { Copy-Item -LiteralPath $item.FullName -Destination $target -Recurse }
}
Set-Location -LiteralPath $target
npm.cmd ci --offline --no-audit --no-fund 2>&1 | Tee-Object -FilePath '.\docs\checks\dependency-installation.txt'
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
npm.cmd run ci 2>&1 | Tee-Object -FilePath '.\docs\checks\ci.txt'
if ($LASTEXITCODE -ne 0) { throw 'Final workspace checks failed.' }
git init -b main
if ($LASTEXITCODE -ne 0) { throw 'Git initialization failed.' }
git config --local user.name 'ALaura-chi'
git config --local user.email 'ALaura-chi@users.noreply.github.com'
git config --local core.autocrlf false
git config --local credential.https://github.com.username 'ALaura-chi'
$evidence = @(
    'Final workspace: D:\dev\hot100-blog-rebuild'
    'Independent repository: main; original project untouched.'
    "Node: $(node --version)"
    "npm: $(npm.cmd --version)"
    'npm ci: passed using package-lock.json (offline npm cache)'
    'npm run ci: passed in this D-drive workspace'
    'Ignored generated paths:'
)
$ignored = git check-ignore node_modules/ dist/ .astro/ .java-classes/ .env
if ($LASTEXITCODE -ne 0) { throw 'Ignore validation failed.' }
$evidence += $ignored
Set-Content -LiteralPath '.\docs\checks\final-workspace.txt' -Value $evidence -Encoding utf8
git add -- .
if ($LASTEXITCODE -ne 0) { throw 'Git staging failed.' }
$lock = git ls-files -- package-lock.json
if ($lock -ne 'package-lock.json') { throw 'The lock file is not tracked.' }
git commit -m 'Build Hot 100 study blog with Astro'
if ($LASTEXITCODE -ne 0) { throw 'Initial commit failed.' }
git log -1 --format='%h %s'
git status --short

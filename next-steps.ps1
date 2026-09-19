# next-steps.ps1
# Corre isto DE DENTRO da pasta curiosity-platform (depois do setup.ps1).
# Vai abrir o browser para autenticares com a Cloudflare e depois cria os
# recursos (D1 + KV) automaticamente, editando wrangler.jsonc por ti.

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".\wrangler.jsonc")) {
    Write-Host "Não encontrei wrangler.jsonc — confirma que estás dentro da pasta curiosity-platform." -ForegroundColor Red
    exit 1
}

Write-Host "== A autenticar com a Cloudflare ==" -ForegroundColor Cyan
Write-Host "Vai abrir o browser. Autoriza o acesso e volta aqui." -ForegroundColor Yellow
npx wrangler login

Write-Host "== A criar a base de dados D1 ==" -ForegroundColor Cyan
$d1Output = npx wrangler d1 create curiosity-platform-db 2>&1 | Out-String
Write-Host $d1Output

$d1Match = [regex]::Match($d1Output, 'database_id\s*=\s*"([0-9a-f-]{36})"')
if (-not $d1Match.Success) {
    $d1Match = [regex]::Match($d1Output, '"database_id":\s*"([0-9a-f-]{36})"')
}

if ($d1Match.Success) {
    $databaseId = $d1Match.Groups[1].Value
    Write-Host "database_id encontrado: $databaseId" -ForegroundColor Green
} else {
    Write-Host "Não consegui extrair o database_id automaticamente." -ForegroundColor Red
    Write-Host "Copia-o à mão do texto acima e cola aqui:"
    $databaseId = Read-Host "database_id"
}

Write-Host "== A criar o namespace KV ==" -ForegroundColor Cyan
$kvOutput = npx wrangler kv namespace create SESSIONS_KV 2>&1 | Out-String
Write-Host $kvOutput

$kvMatch = [regex]::Match($kvOutput, '"id":\s*"([0-9a-f]{32})"')
if ($kvMatch.Success) {
    $kvId = $kvMatch.Groups[1].Value
    Write-Host "KV id encontrado: $kvId" -ForegroundColor Green
} else {
    Write-Host "Não consegui extrair o id do KV automaticamente." -ForegroundColor Red
    Write-Host "Copia-o à mão do texto acima e cola aqui:"
    $kvId = Read-Host "kv id"
}

Write-Host "== A atualizar wrangler.jsonc ==" -ForegroundColor Cyan
$content = Get-Content .\wrangler.jsonc -Raw
$content = $content -replace '("database_id":\s*")<configure-me>(")', "`${1}$databaseId`${2}"
$content = $content -replace '("kv_namespaces"[\s\S]*?"id":\s*")<configure-me>(")', "`${1}$kvId`${2}"
Set-Content -Path .\wrangler.jsonc -Value $content -NoNewline

Write-Host "wrangler.jsonc atualizado. Confirma com: cat .\wrangler.jsonc" -ForegroundColor Green

Write-Host "== A regenerar tipos ==" -ForegroundColor Cyan
npx wrangler types

Write-Host "== A aplicar o schema à base de dados remota ==" -ForegroundColor Cyan
npm run db:migrate:remote

Write-Host "== A fazer commit e push da configuração atualizada ==" -ForegroundColor Cyan
git add wrangler.jsonc worker-configuration.d.ts
git commit -m "Configurar database_id e KV id reais da Cloudflare"
git push

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host " Configuração completa." -ForegroundColor Green
Write-Host " Para testar localmente:  npm run dev" -ForegroundColor Green
Write-Host " Para publicar em produção:  npm run deploy" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

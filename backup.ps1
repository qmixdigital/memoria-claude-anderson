# Backup do "cerebro" (memoria, skills, documentacao) para o GitHub, sem credenciais.
# Roda todo dia pela tarefa agendada "Backup memoria-claude" ou a mao: powershell -File backup.ps1
# O que entra: ~/.claude (sem transcritos e caches) e D:\SISTEMAS (sem dumps, videos e codigo de app).
# O que NAO entra, por ordem do Anderson (17/09/2026): chaves SSH, chaves de API, senhas,
# .env, cofres. O passo de limpeza (limpar.py) apaga qualquer chave que esteja no meio de um texto.
$ErrorActionPreference = "Continue"
$repo = "D:\GitHub\cerebro-claude"
$claude = "$env:USERPROFILE\.claude"
$log = Join-Path $repo "ultimo-backup.log"
Set-Location $repo
"== backup iniciado $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" | Out-File $log -Encoding utf8

function Sync($origem, $destino, $extras) {
    if (-not (Test-Path $origem)) { "pulado (nao existe): $origem" | Out-File $log -Append -Encoding utf8; return }
    $args = @($origem, $destino, "/MIR", "/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NP", "/XJ",
        "/XF", "*.jsonl", "*.bak*", "*.orig", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "*.sql", "*.sql.gz", "*.zip", "*.7z", "*.tar", "*.tar.gz", "*.tgz", "*.rar", "*.db", "*.db-wal", "*.db-shm",
                "*.env", ".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx", "id_rsa*", "id_ed25519*", "*.log", "*.mp4", "*.mov", "*.mkv", "*.psd", "*.iso", "*.exe", "*.msi",
        "/XD", "node_modules", ".git", ".next", ".next-build", "dist", "build", ".cache", ".cache_banco", "cache", "__pycache__", ".venv", "venv", "vendor",
               "chrome", "file-history", "shell-snapshots", "debug", "sessions", "session-env", "statsig", "todos") + $extras
    & robocopy @args | Out-Null
    $code = $LASTEXITCODE
    if ($code -ge 8) { "ERRO robocopy ($code): $origem" | Out-File $log -Append -Encoding utf8 } else { "ok: $origem -> $destino" | Out-File $log -Append -Encoding utf8 }
}

# 1) ~/.claude: so o que e conhecimento
Sync "$claude\skills"   "$repo\claude\skills"   @()
Sync "$claude\agents"   "$repo\claude\agents"   @()
Sync "$claude\commands" "$repo\claude\commands" @()
Sync "$claude\scheduled-tasks" "$repo\claude\scheduled-tasks" @()
Copy-Item "$claude\CLAUDE.md" "$repo\claude\CLAUDE.md" -Force
# memorias de cada projeto (projects\<slug>\memory\*.md), sem os transcritos .jsonl
Get-ChildItem "$claude\projects" -Directory | ForEach-Object {
    $mem = Join-Path $_.FullName "memory"
    if (Test-Path $mem) { Sync $mem "$repo\claude\projects\$($_.Name)\memory" @() }
}

# 2) D:\SISTEMAS: documentacao, skills de projeto, planilhas de trabalho (sem os dumps)
#    Fora: backups (66 GB de dumps WP), QMIX-VIDEOS (4,4 GB), codigo PHP do acesso.qmix (32 mil arquivos, tem repo proprio)
$foraSistemas = @("/XD", "D:\SISTEMAS\MinhasHospedagens\backups", "D:\SISTEMAS\QMIX-VIDEOS", "D:\SISTEMAS\acesso.qmix.com.br\codigo", "/MAX:20000000")
Sync "D:\SISTEMAS" "$repo\sistemas" $foraSistemas
# robocopy /XD nao apaga no destino o que ficou excluido: garante que nao sobra copia antiga
foreach ($d in @("$repo\sistemas\QMIX-VIDEOS", "$repo\sistemas\acesso.qmix.com.br\codigo", "$repo\sistemas\MinhasHospedagens\backups")) {
    if (Test-Path $d) { Remove-Item $d -Recurse -Force }
}

# 3) limpeza de credenciais na copia (nunca nos originais)
$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) { & python "$repo\limpar.py" "$repo\claude" "$repo\sistemas" | Out-File $log -Append -Encoding utf8 } else { "AVISO: python nao encontrado, limpeza nao rodou; backup NAO enviado" | Out-File $log -Append -Encoding utf8; exit 1 }

# 4) git
& git add -A 2>&1 | Out-Null
$mudou = & git status --porcelain
if (-not $mudou) { "nada mudou, sem commit" | Out-File $log -Append -Encoding utf8; "== fim $(Get-Date -Format 'HH:mm:ss')" | Out-File $log -Append -Encoding utf8; exit 0 }
& git commit -q -m "backup $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-File $log -Append -Encoding utf8
if (& git remote get-url origin 2>$null) { & git push -q origin HEAD 2>&1 | Out-File $log -Append -Encoding utf8 } else { "sem remoto origin: commit local feito, push pendente" | Out-File $log -Append -Encoding utf8 }
"== fim $(Get-Date -Format 'HH:mm:ss')" | Out-File $log -Append -Encoding utf8

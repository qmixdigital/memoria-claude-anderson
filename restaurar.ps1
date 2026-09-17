# Devolve o backup ao lugar numa máquina nova. Não sobrescreve arquivo mais novo no destino.
$repo = Split-Path -Parent $MyInvocation.MyCommand.Path
$claude = "$env:USERPROFILE\.claude"
New-Item -ItemType Directory -Force $claude | Out-Null
robocopy "$repo\claude" $claude /E /XO /R:1 /W:1 /NFL /NDL /NJH /NP
robocopy "$repo\sistemas" "D:\SISTEMAS" /E /XO /R:1 /W:1 /NFL /NDL /NJH /NP
Write-Host "Restaurado. Agora recrie ~/.ssh, Documents/APIs e os .env, e preencha os <<REMOVIDO>>."

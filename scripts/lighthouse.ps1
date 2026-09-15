# Roda a auditoria Lighthouse completa sozinho: build, preview, 12 medições, para tudo no final.
$ErrorActionPreference = "Stop"

if (-not (Test-Path "node_modules/lighthouse")) {
  npm install -D lighthouse
}

npm run build

New-Item -ItemType Directory -Force -Path "relatorios" | Out-Null

$preview = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run preview" -PassThru -WindowStyle Hidden

try {
  $pronto = $false
  for ($i = 0; $i -lt 30; $i++) {
    try {
      Invoke-WebRequest -Uri "http://localhost:4173" -UseBasicParsing -TimeoutSec 2 | Out-Null
      $pronto = $true
      break
    } catch {
      Start-Sleep -Seconds 1
    }
  }
  if (-not $pronto) { throw "Preview não respondeu em 30s." }

  $paginas = @(
    @{ nome = "inicio";  url = "http://localhost:4173/" },
    @{ nome = "detalhe"; url = "http://localhost:4173/nfts/nft-01" }
  )
  $perfis = @(
    @{ nome = "mobile";  flag = "" },
    @{ nome = "desktop"; flag = "--preset desktop" }
  )

  foreach ($pagina in $paginas) {
    foreach ($perfil in $perfis) {
      for ($rodada = 1; $rodada -le 3; $rodada++) {
        $saida = "relatorios/$($pagina.nome)-$($perfil.nome)-$rodada.html"
        Write-Host "Medindo: $saida"
        $comando = "npx lighthouse `"$($pagina.url)`" $($perfil.flag) --output html --output-path $saida --quiet"
        Invoke-Expression $comando
      }
    }
  }

  Write-Host ""
  Write-Host "Pronto. 12 relatórios em relatorios/. Abra cada um e anote Performance/Acessibilidade/Boas práticas/SEO/LCP/CLS/TBT."
} finally {
  Stop-Process -Id $preview.Id -Force -ErrorAction SilentlyContinue
  # cmd.exe pode não derrubar o node filho junto; mata quem estiver na porta 4173.
  Get-NetTCPConnection -LocalPort 4173 -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}

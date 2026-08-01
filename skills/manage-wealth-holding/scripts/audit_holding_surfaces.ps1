param(
  [Parameter(Mandatory = $true)][string]$Canonical,
  [Parameter(Mandatory = $true)][string]$DisplayLabel,
  [string[]]$Aliases = @(),
  [ValidateSet('present', 'absent')][string]$Expected = 'present',
  [ValidateSet('all', 'selectors')][string]$Scope = 'all',
  [string]$BackendPath = 'D:\WebApp\WebApp.gs',
  [string]$FrontendPath = 'D:\wealth-dashboard\index.html'
)

$ErrorActionPreference = 'Stop'

function Test-TextState {
  param([string]$Surface, [string]$Needle, [string]$Content)
  $found = $Content.Contains($Needle)
  $pass = if ($Expected -eq 'present') { $found } else { -not $found }
  [pscustomobject]@{
    surface = $Surface
    value = $Needle
    found = $found
    expected = $Expected
    pass = $pass
  }
}

if (-not (Test-Path -LiteralPath $BackendPath)) { throw "Backend not found: $BackendPath" }
if (-not (Test-Path -LiteralPath $FrontendPath)) { throw "Frontend not found: $FrontendPath" }

$backend = Get-Content -Raw -Encoding utf8 -LiteralPath $BackendPath
$frontend = Get-Content -Raw -Encoding utf8 -LiteralPath $FrontendPath
$checks = @()

if ($Scope -eq 'selectors') {
  $dividendBlock = [regex]::Match($frontend, '(?s)var\s+DIVIDEND_SYMBOLS\s*=\s*\[.*?\];').Value
  $stockBlock = [regex]::Match($frontend, '(?s)var\s+STOCK_SYMBOLS\s*=\s*\[.*?\];').Value
  if (-not $dividendBlock -or -not $stockBlock) { throw 'Frontend selector blocks not found' }
  $selectorContent = $dividendBlock + "`n" + $stockBlock
  $checks += Test-TextState -Surface 'frontend selectors canonical' -Needle $Canonical -Content $selectorContent
  $checks += Test-TextState -Surface 'frontend selectors display label' -Needle $DisplayLabel -Content $selectorContent
} else {
  $checks += Test-TextState -Surface 'backend canonical/display' -Needle $Canonical -Content $backend
  $checks += Test-TextState -Surface 'backend display label' -Needle $DisplayLabel -Content $backend
  $checks += Test-TextState -Surface 'frontend canonical' -Needle $Canonical -Content $frontend
  $checks += Test-TextState -Surface 'frontend display label' -Needle $DisplayLabel -Content $frontend

  foreach ($alias in ($Aliases | ForEach-Object { $_ -split ',' })) {
    if ([string]::IsNullOrWhiteSpace($alias)) { continue }
    $checks += Test-TextState -Surface 'frontend alias' -Needle $alias.Trim() -Content $frontend
  }
}

$checks | ConvertTo-Json -Depth 4
if ($checks.Where({ -not $_.pass }).Count -gt 0) { exit 1 }

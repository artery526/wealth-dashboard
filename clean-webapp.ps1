param(
  [switch]$Apply
)

$script = Join-Path $PSScriptRoot "tools\safe-clean-webapp.ps1"
& $script @PSBoundParameters

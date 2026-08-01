param(
  [switch]$Apply,
  [string]$WebAppRoot = "D:\WebApp",
  [string]$FrontendRoot = "D:\wealth-dashboard",
  [string]$AndroidRoot = "D:\EmpireApp",
  [string]$ArchiveRoot = ("D:\EmpireArchive\" + (Get-Date -Format "yyyy-MM-dd") + "-webapp-cleanup")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-ExistingPath {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Path does not exist: $Path"
  }
  return (Resolve-Path -LiteralPath $Path).Path
}

function Assert-UnderPath {
  param(
    [string]$Child,
    [string]$Parent,
    [string]$Label
  )
  $parentWithSlash = $Parent.TrimEnd("\") + "\"
  if (-not ($Child.Equals($Parent, [StringComparison]::OrdinalIgnoreCase) -or $Child.StartsWith($parentWithSlash, [StringComparison]::OrdinalIgnoreCase))) {
    throw "$Label is outside expected path. Child=$Child Parent=$Parent"
  }
}

function New-CleanupCandidate {
  param(
    [string]$Type,
    [string]$Source,
    [string]$Destination,
    [string]$Reason
  )
  [pscustomobject]@{
    Type = $Type
    Source = $Source
    Destination = $Destination
    Reason = $Reason
  }
}

$resolvedWebApp = Resolve-ExistingPath $WebAppRoot
$resolvedArchiveParent = Split-Path -Parent $ArchiveRoot
if (-not (Test-Path -LiteralPath $resolvedArchiveParent)) {
  New-Item -ItemType Directory -Force -Path $resolvedArchiveParent | Out-Null
}
$resolvedArchiveParent = Resolve-ExistingPath $resolvedArchiveParent
if (-not $resolvedArchiveParent.Equals("D:\EmpireArchive", [StringComparison]::OrdinalIgnoreCase)) {
  Assert-UnderPath -Child $resolvedArchiveParent -Parent "D:\EmpireArchive" -Label "Archive parent"
}

$candidates = New-Object System.Collections.Generic.List[object]

$frontendMedia = @(
  "Kongmingmenuv2.mp4",
  "domestic-cardv2.mp4",
  "finance-cardv2.mp4",
  "medical-cardv2.mp4",
  "military-controlv2.mp4",
  "pangtongmenuv2.mp4",
  "starsv2.mp4",
  "wallv2.mp4"
)

if (Test-Path -LiteralPath $FrontendRoot) {
  foreach ($name in $frontendMedia) {
    $source = Join-Path $resolvedWebApp $name
    $frontend = Join-Path $FrontendRoot $name
    if ((Test-Path -LiteralPath $source) -and (Test-Path -LiteralPath $frontend)) {
      $sourceHash = (Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash
      $frontendHash = (Get-FileHash -LiteralPath $frontend -Algorithm SHA256).Hash
      if ($sourceHash -eq $frontendHash) {
        $dest = Join-Path $ArchiveRoot ("WebApp-root-frontend-media\" + $name)
        $candidates.Add((New-CleanupCandidate -Type "DuplicateFrontendMedia" -Source $source -Destination $dest -Reason "Same SHA256 as D:\wealth-dashboard\$name")) | Out-Null
      }
    }
  }
}

$legacyAndroid = Join-Path $resolvedWebApp "EmpireAndroid"
if ((Test-Path -LiteralPath $legacyAndroid) -and (Test-Path -LiteralPath $AndroidRoot)) {
  $androidFileCount = (Get-ChildItem -LiteralPath $legacyAndroid -Recurse -File | Measure-Object).Count
  $newAndroidFileCount = (Get-ChildItem -LiteralPath $AndroidRoot -Recurse -File -Exclude "*.apk" | Where-Object { $_.FullName -notmatch "\\build\\" } | Measure-Object).Count
  if ($androidFileCount -gt 0 -and $newAndroidFileCount -gt 0) {
    $dest = Join-Path $ArchiveRoot "EmpireAndroid-original"
    $candidates.Add((New-CleanupCandidate -Type "LegacyAndroidFolder" -Source $legacyAndroid -Destination $dest -Reason "Dedicated Android source exists at D:\EmpireApp")) | Out-Null
  }
}

Write-Host "Empire WebApp safe cleanup"
Write-Host "Mode: $(if ($Apply) { 'APPLY - archive candidates' } else { 'DRY RUN - no files moved' })"
Write-Host "WebApp: $resolvedWebApp"
Write-Host "Archive: $ArchiveRoot"
Write-Host ""

if ($candidates.Count -eq 0) {
  Write-Host "No cleanup candidates found."
  exit 0
}

$candidates | Select-Object Type, Source, Destination, Reason | Format-Table -AutoSize

if (-not $Apply) {
  Write-Host ""
  Write-Host "Dry run only. Re-run with -Apply to archive these candidates."
  exit 0
}

foreach ($candidate in $candidates) {
  $sourceResolved = Resolve-ExistingPath $candidate.Source
  Assert-UnderPath -Child $sourceResolved -Parent $resolvedWebApp -Label "Cleanup source"

  $destParent = Split-Path -Parent $candidate.Destination
  New-Item -ItemType Directory -Force -Path $destParent | Out-Null

  if (Test-Path -LiteralPath $candidate.Destination) {
    throw "Destination already exists: $($candidate.Destination)"
  }

  Move-Item -LiteralPath $candidate.Source -Destination $candidate.Destination
  Write-Host "Archived: $($candidate.Source) -> $($candidate.Destination)"
}

Write-Host ""
Write-Host "Cleanup complete. Files were archived, not deleted."

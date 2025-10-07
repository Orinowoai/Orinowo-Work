<#
  Orinowo .env + Render Sync Check (PowerShell)

  What it does:
  - Ensures .env.local exists at repo root (creates with placeholders if missing)
  - Compares AI_MUSIC_* vars (and PORT) in .env.local to either:
      a) a provided env file exported from Render (-RenderEnvPath), or
      b) the current process environment variables

  Usage examples (run from repo root):
    pwsh ./scripts/env-sync.ps1
    pwsh ./scripts/env-sync.ps1 -RenderEnvPath ./render.env

  Notes:
  - Keep secrets safe; the script masks secrets in output.
  - .env.local is gitignored in this repo by default.
#>

param(
  [string]$RenderEnvPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Read-EnvFile([string]$path) {
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content -Path $path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { return }
    if ($line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1).Trim()
    # Strip surrounding quotes if present
    if ($v.StartsWith('"') -and $v.EndsWith('"')) { $v = $v.Substring(1, $v.Length-2) }
    if ($v.StartsWith("'") -and $v.EndsWith("'")) { $v = $v.Substring(1, $v.Length-2) }
    $map[$k] = $v
  }
  return $map
}

function Mask([string]$value) {
  if ([string]::IsNullOrEmpty($value)) { return '(empty)' }
  if ($value.Length -le 8) { return ('*' * $value.Length) }
  return $value.Substring(0,4) + ('*' * ($value.Length - 8)) + $value.Substring($value.Length - 4)
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir '..')
$envPath = Join-Path $repoRoot '.env.local'

Write-Host "=== ORINOWO .ENV + RENDER SYNC CHECK ===" -ForegroundColor Cyan

# 1) Ensure .env.local exists
if (-not (Test-Path $envPath)) {
  Write-Host "Creating .env.local..." -ForegroundColor Yellow
  @"
AI_MUSIC_ENDPOINT=https://api.replicate.com/v1/predictions
AI_MUSIC_KEY=r8_your_replicate_api_token_here
AI_MUSIC_VERSION=ac732dfb5ba2c90b847c... # replace with actual version
PORT=8080
"@ | Set-Content -Path $envPath -NoNewline
} else {
  Write-Host ".env.local already exists — skipping creation." -ForegroundColor Green
}
Write-Host " .env.local verified at $envPath" -ForegroundColor Green

$localEnv = Read-EnvFile $envPath

# 2) Prepare comparison source
$sourceName = ''
$remoteEnv = @{}
if ($RenderEnvPath) {
  if (-not (Test-Path $RenderEnvPath)) {
    Write-Host "Provided RenderEnvPath not found: $RenderEnvPath" -ForegroundColor Yellow
  } else {
    $remoteEnv = Read-EnvFile $RenderEnvPath
    $sourceName = "Render file: $RenderEnvPath"
  }
}
if ($remoteEnv.Count -eq 0) {
  $sourceName = 'current process environment'
  foreach ($k in [Environment]::GetEnvironmentVariables().Keys) {
    $remoteEnv[$k] = [Environment]::GetEnvironmentVariable($k)
  }
}

Write-Host "\nComparing .env.local with $sourceName ..." -ForegroundColor Cyan

$keysToCheck = @(
  'AI_MUSIC_ENDPOINT',
  'AI_MUSIC_KEY',
  'AI_MUSIC_VERSION',
  'PORT'
)

$missing = @()
$mismatch = @()
$match = @()

foreach ($key in $keysToCheck) {
  $localVal = $localEnv[$key]
  if (-not $localVal) {
    Write-Host (" Missing in .env.local: {0}" -f $key) -ForegroundColor Yellow
    $missing += $key
    continue
  }
  $remoteVal = $remoteEnv[$key]
  if ([string]::IsNullOrEmpty($remoteVal)) {
    Write-Host (" Missing on remote: {0}" -f $key) -ForegroundColor Yellow
    $missing += $key
  } elseif ($remoteVal -ceq $localVal) {
    $mask = if ($key -eq 'AI_MUSIC_KEY') { Mask($localVal) } else { $localVal }
    Write-Host (" Match: {0} = {1}" -f $key, $mask) -ForegroundColor Green
    $match += $key
  } else {
    $lDisp = if ($key -eq 'AI_MUSIC_KEY') { Mask($localVal) } else { $localVal }
    $rDisp = if ($key -eq 'AI_MUSIC_KEY') { Mask($remoteVal) } else { $remoteVal }
    Write-Host (" Mismatch: {0} (local={1}, remote={2})" -f $key, $lDisp, $rDisp) -ForegroundColor Red
    $mismatch += $key
  }
}

Write-Host "\n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host (" Matches  : {0}" -f ($match -join ', '))
Write-Host (" Missing  : {0}" -f (($missing | Select-Object -Unique) -join ', '))
Write-Host (" Mismatches: {0}" -f ($mismatch -join ', '))
Write-Host "\nENV SYNC CHECK COMPLETE"

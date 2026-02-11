param(
  [string]$Message = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Message)) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $Message = "chore: sync $stamp"
}

git add -A

$staged = git diff --cached --name-only
if (-not $staged) {
  Write-Host "No staged changes to commit."
  exit 0
}

git commit -m $Message
git push origin main


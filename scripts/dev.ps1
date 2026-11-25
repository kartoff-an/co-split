param(
    [switch]$HostNetwork
)

$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

if (-not (Test-Path "node_modules")) {
    Write-Host "Dependencies not installed. Running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Co-Split frontend..." -ForegroundColor Cyan

if ($HostNetwork) {
    npm run dev -- --host 0.0.0.0
}
else {
    npm run dev
}

$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

$checks = @(
    @{ Name = "TypeScript"; Command = "npx"; Args = @("tsc", "--noEmit") },
    @{ Name = "ESLint"; Command = "npm"; Args = @("run", "lint") },
    @{ Name = "Production build"; Command = "npm"; Args = @("run", "build") }
)

foreach ($check in $checks) {
    Write-Host "`n==> $($check.Name)" -ForegroundColor Cyan

    & $check.Command @($check.Args)

    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n$($check.Name) failed." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "`nAll checks passed." -ForegroundColor Green

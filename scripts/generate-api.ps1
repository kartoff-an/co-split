param(
    [string]$ApiUrl = "http://localhost:8000",
    [string]$Output = "src/api/generated/schema.d.ts"
)

$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

$schemaUrl = "$($ApiUrl.TrimEnd('/'))/openapi.json"

Write-Host "Fetching OpenAPI schema from $schemaUrl..." -ForegroundColor Cyan

$schema = Join-Path $env:TEMP "co-split-openapi.json"

try {
    Invoke-WebRequest -Uri $schemaUrl -OutFile $schema
}
catch {
    Write-Host "Could not reach the FastAPI backend." -ForegroundColor Red
    Write-Host "Make sure the backend is running at $ApiUrl."
    exit 1
}

$outputDirectory = Split-Path $Output -Parent

if (-not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Froce | Out-Null
}

Write-Host "Generating TypeScript definitions..." -ForegroundColor Cyan

npx openapi-typescript $schema -o $Output

if ($LASTEXITCODE -ne 0) {
    throw "API type generation failed."
}

Remove-Item $schema -Force

Write-Host "API types generated successfully: $Output" -ForegroundColor Green
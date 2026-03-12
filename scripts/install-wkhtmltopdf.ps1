<#
  install-wkhtmltopdf.ps1
  Downloads a portable wkhtmltopdf ZIP, extracts it to scripts\tools, and
  runs the PDF generator script using the extracted binary in the current session.
#>

$ErrorActionPreference = 'Stop'

$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$tools = Join-Path $base "tools"
New-Item -ItemType Directory -Path $tools -Force | Out-Null


$zip = Join-Path $tools "wkhtmltopdf.zip"

# Try a list of known release URLs until one succeeds
$candidates = @(
  'https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.6/wkhtmltox-0.12.6-1.msvc2015-win64.zip',
  'https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.5/wkhtmltox-0.12.5-1.msvc2015-win64.zip',
  'https://github.com/wkhtmltopdf/wkhtmltopdf/releases/download/0.12.4/wkhtmltox-0.12.4-1.msvc2015-win64.zip'
)

$downloaded = $false
foreach ($u in $candidates) {
  try {
    Write-Host "Attempting download: $u"
    Invoke-WebRequest -Uri $u -OutFile $zip -UseBasicParsing -ErrorAction Stop
    Write-Host "Downloaded from $u"
    $downloaded = $true
    break
  } catch {
    Write-Warning "Failed to download from $u - $_"
  }
}

if (-not $downloaded) {
  Write-Error "All download attempts failed. Please download wkhtmltopdf manually from https://wkhtmltopdf.org/downloads.html and place the extracted folder under $tools\wkhtmltox\bin"
  exit 1
}

Write-Host "Extracting $zip to $tools"
Expand-Archive -Path $zip -DestinationPath $tools -Force

$bin = Join-Path $tools "wkhtmltox\bin"
if (-not (Test-Path $bin)) {
  Write-Error "Expected bin folder not found at $bin"
  exit 1
}

Write-Host "Adding $bin to PATH for this session"
$env:Path = $bin + ';' + $env:Path

Write-Host "wkhtmltopdf location:"
Get-Command wkhtmltopdf -ErrorAction Stop | Select-Object Path

Write-Host "Running PDF generator script..."
. (Join-Path $base "generate-pdfs.ps1")

Write-Host "Done. PDFs (if generated) are in answer-keys\pdfs or see messages above."

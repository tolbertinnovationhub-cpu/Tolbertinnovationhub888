<#
  generate-pdfs.ps1
  Converts HTML answer-keys to PDF using wkhtmltopdf if available.

  Usage:
    .\scripts\generate-pdfs.ps1

  If `wkhtmltopdf` is not installed, the script will list files and show how to print to PDF manually.
#>

$ErrorActionPreference = 'Stop'

$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$keysDir = Join-Path $base "..\answer-keys"
$pdfOut = Join-Path $keysDir "pdfs"

Write-Host "Answer keys directory: $keysDir"
Write-Host "PDF output directory: $pdfOut"
New-Item -ItemType Directory -Path $pdfOut -Force | Out-Null

$wk = Get-Command wkhtmltopdf -ErrorAction SilentlyContinue
if ($null -ne $wk) {
  Write-Host "Found wkhtmltopdf at $($wk.Path). Converting HTML files to PDF..."
  Get-ChildItem -Path $keysDir -Filter "*.html" | ForEach-Object {
    $html = $_.FullName
    $pdf = Join-Path $pdfOut ($_.BaseName + ".pdf")
    Write-Host "Converting $($_.Name) → $($pdf)"
    & $wk.Path $html $pdf
  }
  Write-Host "PDF generation complete. Files are in: $pdfOut"
} else {
  Write-Warning "wkhtmltopdf not found."
  Write-Host "You can create PDFs by opening the HTML files in a browser and using Print → Save as PDF."
  Write-Host "HTML files located in: $keysDir"
  Get-ChildItem -Path $keysDir -Filter "*.html" | ForEach-Object { Write-Host " - $($_.FullName)" }
}

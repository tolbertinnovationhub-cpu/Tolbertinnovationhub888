<#
  download-resources.ps1
  Downloads a sample MP3 into audio/listening1.mp3 for local testing.

  Usage (PowerShell):
    .\scripts\download-resources.ps1

  Note: This script downloads a public sample MP3 (SoundHelix example).
  If you have your own audio, place it at audio\listening1.mp3 instead.
#>

$ErrorActionPreference = 'Stop'

$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$audioDir = Join-Path $base "..\audio"

Write-Host "Ensuring audio directory exists: $audioDir"
New-Item -ItemType Directory -Path $audioDir -Force | Out-Null

$outFile = Join-Path $audioDir "listening1.mp3"
$sampleUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'

Write-Host "Downloading sample MP3 to $outFile"
try {
  Invoke-WebRequest -Uri $sampleUrl -OutFile $outFile -UseBasicParsing
  Write-Host "Downloaded sample MP3 successfully."
} catch {
  Write-Error "Failed to download sample MP3: $_. Exception.Message"
  exit 1
}

Write-Host "Done. You can now open ielts-course.html and play audio/listening1.mp3"

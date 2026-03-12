param(
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $Root)) {
  throw "Root path does not exist: $Root"
}

$Root = (Resolve-Path $Root).Path
$htmlFiles = Get-ChildItem -Path $Root -Recurse -File -Filter *.html

$brokenFileRefs = New-Object System.Collections.Generic.List[object]
$missingHashTargets = New-Object System.Collections.Generic.List[object]

foreach ($src in $htmlFiles) {
  $content = Get-Content -Path $src.FullName -Raw
  $matches = [regex]::Matches($content, '(?:href|src)="([^"]+)"')

  foreach ($m in $matches) {
    $link = $m.Groups[1].Value

    if ($link -match '^(https?:|mailto:|tel:|javascript:|data:)') { continue }
    if ($link -match '^\$\{') { continue }

    $parts = $link.Split('#')
    $pathPart = $parts[0]
    $hashId = if ($parts.Length -gt 1) { $parts[1] } else { '' }

    if ([string]::IsNullOrWhiteSpace($pathPart)) {
      $targetFile = $src.FullName
    }
    else {
      $candidate = $pathPart
      if ($candidate.EndsWith('/')) { $candidate = "$candidate/index.html" }
      $targetFile = [System.IO.Path]::GetFullPath((Join-Path $src.DirectoryName $candidate))
    }

    if (-not (Test-Path $targetFile)) {
      $brokenFileRefs.Add([pscustomobject]@{
        Source = $src.FullName.Replace($Root + '\\','')
        Link = $link
        Target = $targetFile
      })
      continue
    }

    if (-not [string]::IsNullOrWhiteSpace($hashId)) {
      $targetContent = Get-Content -Path $targetFile -Raw
      $idPattern = 'id="' + [regex]::Escape($hashId) + '"'
      if (-not [regex]::IsMatch($targetContent, $idPattern)) {
        $missingHashTargets.Add([pscustomobject]@{
          Source = $src.FullName.Replace($Root + '\\','')
          Link = $link
          Target = $targetFile.Replace($Root + '\\','')
          MissingId = $hashId
        })
      }
    }
  }
}

$brokenFileRefs = $brokenFileRefs | Sort-Object Source,Link -Unique
$missingHashTargets = $missingHashTargets | Sort-Object Source,Link -Unique

$timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
$summary = [pscustomobject]@{
  generatedAt = $timestamp
  htmlFilesScanned = $htmlFiles.Count
  brokenFileReferences = $brokenFileRefs.Count
  missingHashTargets = $missingHashTargets.Count
  topBrokenExamples = ($brokenFileRefs | Select-Object -First 10)
  topMissingHashExamples = ($missingHashTargets | Select-Object -First 10)
}

$jsonPath = Join-Path $Root '_qa_summary.json'
$mdPath = Join-Path $Root '_qa_summary.md'

$summary | ConvertTo-Json -Depth 6 | Set-Content -Path $jsonPath -Encoding UTF8

$md = @()
$md += '# QA Summary'
$md += ''
$md += "Generated: $timestamp"
$md += ''
$md += "- HTML files scanned: $($htmlFiles.Count)"
$md += "- Broken file references: $($brokenFileRefs.Count)"
$md += "- Missing hash targets: $($missingHashTargets.Count)"

if ($brokenFileRefs.Count -gt 0) {
  $md += ''
  $md += '## Broken file reference examples'
  foreach ($r in ($brokenFileRefs | Select-Object -First 10)) {
    $md += "- $($r.Source): $($r.Link)"
  }
}

if ($missingHashTargets.Count -gt 0) {
  $md += ''
  $md += '## Missing hash target examples'
  foreach ($r in ($missingHashTargets | Select-Object -First 10)) {
    $md += "- $($r.Source): $($r.Link) (missing #$($r.MissingId))"
  }
}

Set-Content -Path $mdPath -Value ($md -join [Environment]::NewLine) -Encoding UTF8

Write-Output "QA summary written: _qa_summary.json and _qa_summary.md"
Write-Output "HTML scanned: $($htmlFiles.Count) | Broken refs: $($brokenFileRefs.Count) | Missing hashes: $($missingHashTargets.Count)"
if ($brokenFileRefs.Count -gt 0 -or $missingHashTargets.Count -gt 0) {
  exit 1
}

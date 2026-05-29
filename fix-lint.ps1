$ErrorActionPreference = "SilentlyContinue"

$files = Get-ChildItem -Path "d:\congty\sgv_cms\app","d:\congty\sgv_cms\components" -Recurse -Include "*.tsx","*.ts" | Where-Object { $_.FullName -notmatch "node_modules|\.next|lib\\utils" }

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    if (-not $content) { continue }
    $original = $content

    # Fix useState<any>(null) -> useState<Record<string, unknown> | null>(null)
    $content = $content -replace 'useState<any>\(null\)', 'useState<Record<string, unknown> | null>(null)'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Fixed: $($f.Name)"
    }
}

Write-Host "`nDone!"

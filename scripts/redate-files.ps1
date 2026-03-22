param(
    [string]$RootPath = ".",
    [string]$TargetStart = "2026-03-20T07:00:00-05:00",
    [string]$TargetEnd = "2026-03-22T02:00:00-05:00",
    [string[]]$ExcludeDirs = @(),
    [switch]$Apply,
    [switch]$AlsoSetLastWrite,
    [switch]$AlsoSetLastAccess
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-AbsolutePath {
    param([string]$Path)
    return (Resolve-Path -LiteralPath $Path).Path
}

function Parse-DateOffset {
    param([string]$Value)
    try {
        return [DateTimeOffset]::Parse($Value)
    }
    catch {
        throw "No se pudo parsear la fecha '$Value'. Usa formato ISO-8601, por ejemplo: 2026-03-20T07:00:00-05:00"
    }
}

function Convert-ToLocalDateTime {
    param([DateTimeOffset]$Date)
    return $Date.UtcDateTime.ToLocalTime()
}

function Should-Exclude {
    param(
        [string]$FullPath,
        [string[]]$ExcludedNames
    )

    if (-not $ExcludedNames -or $ExcludedNames.Count -eq 0) {
        return $false
    }

    $segments = $FullPath -split "[\\/]"
    foreach ($name in $ExcludedNames) {
        if ($segments -contains $name) {
            return $true
        }
    }

    return $false
}

function Scale-Time {
    param(
        [DateTime]$Value,
        [DateTime]$SourceMin,
        [DateTime]$SourceMax,
        [DateTime]$TargetMin,
        [DateTime]$TargetMax
    )

    if ($SourceMax -eq $SourceMin) {
        return $TargetMin
    }

    $sourceSpanTicks = ($SourceMax.Ticks - $SourceMin.Ticks)
    $targetSpanTicks = ($TargetMax.Ticks - $TargetMin.Ticks)
    $positionTicks = ($Value.Ticks - $SourceMin.Ticks)

    $ratio = [double]$positionTicks / [double]$sourceSpanTicks
    $scaledTicks = [long]($TargetMin.Ticks + ($ratio * $targetSpanTicks))

    return [DateTime]::new($scaledTicks, [DateTimeKind]::Local)
}

$root = Resolve-AbsolutePath -Path $RootPath
$targetStartOffset = Parse-DateOffset -Value $TargetStart
$targetEndOffset = Parse-DateOffset -Value $TargetEnd

if ($targetEndOffset -le $targetStartOffset) {
    throw "TargetEnd debe ser mayor que TargetStart."
}

$targetStartLocal = Convert-ToLocalDateTime -Date $targetStartOffset
$targetEndLocal = Convert-ToLocalDateTime -Date $targetEndOffset

$allFiles = Get-ChildItem -Path $root -Recurse -File -Force |
    Where-Object { -not (Should-Exclude -FullPath $_.FullName -ExcludedNames $ExcludeDirs) }

if (-not $allFiles -or $allFiles.Count -eq 0) {
    throw "No se encontraron archivos para procesar en '$root'."
}

$sourceMin = ($allFiles | Measure-Object -Property CreationTime -Minimum).Minimum
$sourceMax = ($allFiles | Measure-Object -Property CreationTime -Maximum).Maximum

Write-Host "Raiz: $root"
Write-Host "Archivos a procesar: $($allFiles.Count)"
Write-Host "Rango origen (CreationTime): $sourceMin -> $sourceMax"
Write-Host "Rango destino: $targetStartLocal -> $targetEndLocal"
Write-Host "Modo: $(if ($Apply) { 'APLICAR CAMBIOS' } else { 'SIMULACION (sin cambios)' })"
Write-Host ""

$preview = @()
$processed = 0

foreach ($file in $allFiles) {
    $newCreation = Scale-Time -Value $file.CreationTime -SourceMin $sourceMin -SourceMax $sourceMax -TargetMin $targetStartLocal -TargetMax $targetEndLocal

    if ($Apply) {
        [System.IO.File]::SetCreationTime($file.FullName, $newCreation)

        if ($AlsoSetLastWrite) {
            [System.IO.File]::SetLastWriteTime($file.FullName, $newCreation)
        }

        if ($AlsoSetLastAccess) {
            [System.IO.File]::SetLastAccessTime($file.FullName, $newCreation)
        }
    }

    if ($preview.Count -lt 20) {
        $preview += [PSCustomObject]@{
            File = $file.FullName
            OldCreation = $file.CreationTime
            NewCreation = $newCreation
        }
    }

    $processed++
}

$preview | Format-Table -AutoSize
Write-Host ""
Write-Host "Total procesados: $processed"

if (-not $Apply) {
    Write-Host ""
    Write-Host "No se aplicaron cambios. Ejecuta con -Apply para escribir fechas." -ForegroundColor Yellow
    Write-Host "Ejemplo:" -ForegroundColor Yellow
    Write-Host ".\scripts\redate-files.ps1 -RootPath . -Apply -AlsoSetLastWrite -AlsoSetLastAccess" -ForegroundColor Yellow
}
 
# Находит Android SDK, NDK и Java и подставляет их в переменные окружения
# только для текущего окна PowerShell. Системные настройки не меняются.
#
# Запускать через точку, чтобы переменные остались в вашей сессии:
#   . .\scripts\android-env.ps1

$ErrorActionPreference = "Stop"

# --- Android SDK ---
if (-not $env:ANDROID_HOME) {
    $sdkCandidates = @(
        [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User"),
        [Environment]::GetEnvironmentVariable("ANDROID_SDK_ROOT", "User"),
        (Join-Path $env:LOCALAPPDATA "Android\Sdk")
    )
    foreach ($candidate in $sdkCandidates) {
        if ($candidate -and (Test-Path $candidate)) { $env:ANDROID_HOME = $candidate; break }
    }
}

if (-not $env:ANDROID_HOME) {
    throw "Не найден Android SDK. Установите его через Android Studio или задайте ANDROID_HOME вручную."
}

# Некоторые инструменты до сих пор смотрят на старое имя переменной
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

# --- NDK: берём самую свежую из установленных ---
if (-not $env:NDK_HOME) {
    $ndkRoot = Join-Path $env:ANDROID_HOME "ndk"
    if (Test-Path $ndkRoot) {
        $newest = Get-ChildItem $ndkRoot -Directory |
            Sort-Object { [version]($_.Name -replace '[^\d.].*$', '') } -Descending |
            Select-Object -First 1
        if ($newest) { $env:NDK_HOME = $newest.FullName }
    }
}

if (-not $env:NDK_HOME) {
    throw "Не найден Android NDK. Установите его: sdkmanager `"ndk;27.3.13750724`""
}

# --- Java: Gradle требует JAVA_HOME, даже если java есть в PATH ---
if (-not $env:JAVA_HOME) {
    $java = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($java) { $env:JAVA_HOME = Split-Path (Split-Path $java -Parent) -Parent }
}

if (-not $env:JAVA_HOME) {
    throw "Не найдена Java 17. Установите JDK 17 (например, Eclipse Temurin)."
}

Write-Host "ANDROID_HOME = $env:ANDROID_HOME"
Write-Host "NDK_HOME     = $env:NDK_HOME"
Write-Host "JAVA_HOME    = $env:JAVA_HOME"

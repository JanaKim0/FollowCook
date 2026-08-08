# Собирает .apk и кладёт готовый файл в папку release рядом с проектом.
#
#   .\scripts\build-apk.ps1
#
# Почему сборка не в одну команду `tauri android build`:
# Tauri раскладывает собранные библиотеки по папкам Android-проекта через
# символические ссылки, а Windows разрешает их создавать только в режиме
# разработчика. Поэтому библиотеки мы копируем сами, а Gradle запускаем
# напрямую — так сборка работает при любых настройках системы.
#
# Библиотеки собираются в релизном режиме (они получаются в двадцать раз
# меньше отладочных), а упаковывается всё как debug-сборка — она подписана
# стандартным ключом разработчика, поэтому файл сразу ставится на телефон.
# Для публикации в Google Play нужна своя подпись, см. README.

$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot "android-env.ps1")

Set-Location $root

# Собираем только под настоящие телефоны: x86 бывает лишь у эмуляторов
$targets = @(
    @{ cli = "aarch64"; rust = "aarch64-linux-android";   abi = "arm64-v8a" },
    @{ cli = "armv7";   rust = "armv7-linux-androideabi"; abi = "armeabi-v7a" }
)

# Android-проект создаётся один раз и дальше просто используется
if (-not (Test-Path (Join-Path $root "src-tauri\gen\android"))) {
    Write-Host "`nСоздаю Android-проект..." -ForegroundColor Cyan
    npm run tauri -- android init
    if ($LASTEXITCODE -ne 0) { throw "Не удалось создать Android-проект" }
}

# --- 1. Собираем библиотеку под каждую архитектуру ---
foreach ($t in $targets) {
    $so = Join-Path $root "src-tauri\target\$($t.rust)\release\libfollowcook_lib.so"

    Write-Host "`nСобираю $($t.abi) (первый раз это долго)..." -ForegroundColor Cyan

    # Команда может завершиться ошибкой на шаге с символической ссылкой —
    # это уже после того, как библиотека собрана, поэтому код возврата
    # не проверяем, а смотрим на сам файл.
    $ErrorActionPreference = "Continue"
    npm run tauri -- android build --apk --target $($t.cli)
    $ErrorActionPreference = "Stop"

    if (-not (Test-Path $so)) {
        throw "Библиотека для $($t.abi) не собралась. Смотрите ошибки выше."
    }
}

# --- 2. Копируем библиотеки туда, откуда их заберёт Gradle ---
foreach ($t in $targets) {
    $so = Join-Path $root "src-tauri\target\$($t.rust)\release\libfollowcook_lib.so"
    $dir = Join-Path $root "src-tauri\gen\android\app\src\main\jniLibs\$($t.abi)"
    New-Item -ItemType Directory -Force $dir | Out-Null

    $dest = Join-Path $dir "libfollowcook_lib.so"
    # Сначала удаляем: если там осталась ссылка, копирование пойдёт сквозь неё
    if (Test-Path $dest) { Remove-Item $dest -Force }
    Copy-Item $so $dest -Force

    Write-Host ("  {0,-14} {1,6:N1} МБ" -f $t.abi, ((Get-Item $dest).Length / 1MB))
}

# --- 3. Упаковываем .apk ---
Set-Location (Join-Path $root "src-tauri\gen\android")

$gradleArgs = @(
    "assembleUniversalDebug",
    "-PabiList=arm64-v8a,armeabi-v7a",
    "-PtargetList=aarch64,armv7",
    "-ParchList=arm64,arm",
    # Задачи сборки Rust пропускаем: их работу мы уже сделали выше
    "-x", "rustBuildUniversalDebug",
    "-x", "rustBuildArm64Debug",
    "-x", "rustBuildArmDebug",
    "--console=plain"
)

Write-Host "`nУпаковываю .apk..." -ForegroundColor Cyan
& .\gradlew.bat @gradleArgs
if ($LASTEXITCODE -ne 0) { throw "Gradle завершился с ошибкой" }

$apk = Get-ChildItem -Recurse (Join-Path $root "src-tauri\gen\android") -Filter "*.apk" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $apk) { throw "Сборка прошла, но .apk не найден" }

$releaseDir = Join-Path $root "release"
New-Item -ItemType Directory -Force $releaseDir | Out-Null

$target = Join-Path $releaseDir "FollowCook.apk"
Copy-Item $apk.FullName $target -Force

$mb = [Math]::Round((Get-Item $target).Length / 1MB, 1)
Write-Host "`nГотово: $target ($mb МБ)" -ForegroundColor Green
Write-Host "Отправьте этот файл на телефон и откройте его, чтобы установить приложение."

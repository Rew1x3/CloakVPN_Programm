# Скрипт для сборки EXE с отключенной подписью
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:SKIP_NOTARIZATION = "true"

Write-Host "Сборка EXE файла..."
Write-Host "Подпись кода отключена"

# Запускаем сборку
npm run build
npx electron-builder --win portable --x64 --config.win.sign=false --config.win.signingHashAlgorithms=[] 2>&1 | Out-String

Write-Host ""
Write-Host "Проверка результата..."
if (Test-Path "release\CloakVPN-1.0.0-portable.exe") {
    Write-Host "✅ EXE файл создан: release\CloakVPN-1.0.0-portable.exe"
} else {
    Write-Host "❌ EXE файл не найден. Проверьте ошибки выше."
}



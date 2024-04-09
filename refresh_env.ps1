# refresh_env.ps1

Write-Host "`n------------------------"

# Check if the .env file exists before trying to delete it
if (Test-Path .\documentai-backend\project-setup\.env) {
    # Remove the .env file
    Remove-Item .\documentai-backend\project-setup\.env
    Write-Host "Removed .env file." -ForegroundColor Green
}
else {
    Write-Host "No .env file to remove." -ForegroundColor Yellow
}

# Check if the local_settings.py file exists before trying to delete it
if (Test-Path .\documentai-backend\SSDjango\SSDjango\local_settings.py) {
    # Remove the local_settings.py file
    Remove-Item .\documentai-backend\SSDjango\SSDjango\local_settings.py
    Write-Host "Removed local_settings.py file." -ForegroundColor Green
}
else {
    Write-Host "No local_settings.py file to remove." -ForegroundColor Yellow
}

Write-Host "------------------------`n"

Write-Host "Environment refreshed." -ForegroundColor Green
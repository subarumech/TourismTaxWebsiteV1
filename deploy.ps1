# Universal Deployment Wrapper for Windows (PowerShell)
# Automatically calls Git Bash to run the bash deployment script

$BASH_PATH = "C:\Program Files\Git\bin\bash.exe"
$SCRIPT_DIR = $PSScriptRoot
$BASH_SCRIPT = "universal-deploy.sh"

Write-Host "===========================================
" -ForegroundColor Cyan
Write-Host "Universal Deploy (Windows via Git Bash)" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $BASH_PATH)) {
    Write-Host "Error: Git Bash not found at $BASH_PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git for Windows:" -ForegroundColor Yellow
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Convert Windows path to Git Bash path format (e.g., G:\path -> /g/path)
$bashScriptPath = $SCRIPT_DIR -replace '\\', '/'
if ($bashScriptPath -match '^([A-Z]):') {
    $driveLetter = $matches[1].ToLower()
    $bashScriptPath = $bashScriptPath -replace '^[A-Z]:', "/$driveLetter"
}

# Run via Git Bash without auto-confirm so user can interact
& $BASH_PATH -i -c "cd '$bashScriptPath' && ./$BASH_SCRIPT"

$exitCode = $LASTEXITCODE
Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "All done!" -ForegroundColor Green
} else {
    Write-Host "Process exited with code: $exitCode" -ForegroundColor Yellow
}

exit $exitCode


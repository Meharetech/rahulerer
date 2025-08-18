@echo off
chcp 65001 >nul
echo 🧹 JSON File Name Cleaner (Windows Batch)
echo ===========================================
echo.

echo 🔍 Scanning for JSON files in database directory...
echo.

set "count=0"
set "renamed=0"

REM Find all JSON files and rename them
for /r "database" %%f in (*.json) do (
    set /a count+=1
    set "filename=%%~nf"
    set "extension=%%~xf"
    
    REM Remove date patterns from filename
    set "cleaned=!filename!"
    
    REM Remove _YYYY-MM-DD pattern
    set "cleaned=!cleaned:_2025-08-17=!"
    set "cleaned=!cleaned:_2025-08-16=!"
    set "cleaned=!cleaned:_2025-08-15=!"
    set "cleaned=!cleaned:_2025-08-14=!"
    set "cleaned=!cleaned:_2025-08-13=!"
    set "cleaned=!cleaned:_2025-08-12=!"
    set "cleaned=!cleaned:_2025-08-11=!"
    set "cleaned=!cleaned:_2025-08-10=!"
    
    REM Remove __YYYY-MM-DD pattern (double underscore)
    set "cleaned=!cleaned:__2025-08-17=!"
    set "cleaned=!cleaned:__2025-08-16=!"
    set "cleaned=!cleaned:__2025-08-15=!"
    set "cleaned=!cleaned:__2025-08-14=!"
    set "cleaned=!cleaned:__2025-08-13=!"
    set "cleaned=!cleaned:__2025-08-12=!"
    set "cleaned=!cleaned:__2025-08-11=!"
    set "cleaned=!cleaned:__2025-08-10=!"
    
    REM Remove other common date patterns
    set "cleaned=!cleaned:_20250817=!"
    set "cleaned=!cleaned:_20250816=!"
    set "cleaned=!cleaned:_20250815=!"
    set "cleaned=!cleaned:_20250814=!"
    set "cleaned=!cleaned:_20250813=!"
    set "cleaned=!cleaned:_20250812=!"
    set "cleaned=!cleaned:_20250811=!"
    set "cleaned=!cleaned:_20250810=!"
    
    REM Check if filename changed
    if not "!cleaned!"=="!filename!" (
        set "newpath=%%~dpf!cleaned!!extension!"
        
        REM Check if target file already exists
        if exist "!newpath!" (
            echo ⚠️  Target exists, skipping: !cleaned!!extension!
        ) else (
            ren "%%f" "!cleaned!!extension!"
            echo ✅ Renamed: %%f → !cleaned!!extension!
            set /a renamed+=1
        )
    ) else (
        echo ℹ️  No change needed: %%f
    )
)

echo.
echo ===========================================
echo 📊 CLEANING SUMMARY
echo ===========================================
echo Total JSON files found: %count%
echo Files renamed: %renamed%
echo Files unchanged: %count%-%renamed%
echo.

if %renamed% gtr 0 (
    echo 🎉 Successfully cleaned %renamed% file names!
) else (
    echo ✨ No files needed cleaning!
)

echo.
pause

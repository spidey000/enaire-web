@echo off
REM Script de deploy a Netlify - ENAIRE Web
echo ========================================
echo Deploy a Netlify - ENAIRE Web
echo ========================================
echo.

REM Opción 1: Usar Netlify CLI
echo [1/3] Verificando Netlify CLI...
npx netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Netlify CLI no encontrado. Instalando...
    call npx netlify-cli@latest install
)

echo.
echo [2/3] Creando build de produccion...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear build
    pause
    exit /b 1
)

echo.
echo [3/3] Deployando a Netlify...
echo Se abrira un navegador para autorizar el deploy
echo.
npx netlify deploy --prod --dir=dist

echo.
echo ========================================
echo Deploy completado!
echo ========================================
echo.
pause

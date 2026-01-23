@echo off
REM Deploy rapido a Surge.sh - ENAIRE Web
echo ========================================
echo Deploy a Surge.sh - ENAIRE Web
echo ========================================
echo.

echo Este metodo es el MAS SIMPLE y rapido
echo No requiere registro, solo un email
echo.

REM Instalar Surge si no existe
npx surge --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando Surge.sh...
    call npx surge --version
)

REM Crear build
echo.
echo Creando build de produccion...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Fallo al crear build
    pause
    exit /b 1
)

REM Deploy
echo.
echo Deployando a Surge.sh...
echo.
echo Se te pedira:
echo 1. Tu email (para identificarte)
echo 2. Dominio (o presiona Enter para usar uno aleatorio)
echo.
npx surge dist

echo.
echo ========================================
echo Deploy completado!
echo ========================================
pause

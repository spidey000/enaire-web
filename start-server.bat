@echo off
REM Script para iniciar el servidor de desarrollo ENAIRE Web

echo ========================================
echo ENAIRE Web - Servidor de Desarrollo
echo ========================================
echo.

REM Verificar Node.js
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado o no está en PATH
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Fallo al instalar dependencias
        pause
        exit /b 1
    )
)

REM Iniciar servidor de desarrollo
echo.
echo Iniciando servidor de desarrollo...
echo La web estará disponible en: http://localhost:3000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause

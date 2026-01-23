# Guía de Instalación y Uso - ENAIRE Web

## 🔧 Resolución de Problemas

Si tienes problemas para iniciar el servidor, sigue estos pasos:

### Opción 1: Usar el script de inicio

**Windows:**
```bash
start-server.bat
```

**Linux/Mac:**
```bash
chmod +x start-server.sh
./start-server.sh
```

### Opción 2: Instalación manual completa

```bash
# 1. Limpiar instalación anterior
rm -rf node_modules package-lock.json

# 2. Instalar dependencias
npm install

# 3. Si hay errores, intentar con flags de fuerza
npm install --force

# 4. O usar yarn en lugar de npm
yarn install
yarn dev
```

### Opción 3: Usar npx directamente

```bash
# Ejecutar Vite directamente con npx
npx vite
```

### Opción 4: Verificar e instalar Node.js

1. Verificar que Node.js esté instalado:
```bash
node --version  # Debe ser v18 o superior
npm --version
```

2. Si no está instalado, descargar desde: https://nodejs.org/

### Opción 5: Modo preview con build

Si el servidor de desarrollo tiene problemas, puedes hacer un build y usar el modo preview:

```bash
# Crear build de producción
npm run build

# Previsualizar build
npm run preview

# O usar un servidor HTTP simple
npx serve dist
```

## 📋 Estructura de Archivos

El proyecto debe tener esta estructura:

```
enaire-web/
├── index.html                    # HTML principal
├── package.json                  # Dependencias
├── vite.config.js               # Configuración de Vite
├── src/
│   ├── data/
│   │   ├── modules/             # 9 archivos .md
│   │   ├── mcq/                 # 6 archivos .json
│   │   └── modules-index.json   # Índice de módulos
│   ├── pages/                   # Páginas (home, quiz, etc.)
│   ├── styles/                  # CSS
│   ├── js/                      # JavaScript
│   └── index.html
├── node_modules/                # Dependencias (se crea con npm install)
└── dist/                        # Build de producción (se crea con npm run build)
```

## 🚀 Una vez que el servidor funcione

1. Abre tu navegador en: http://localhost:3000
2. Verás la página principal con:
   - Dashboard de estadísticas
   - Grid de módulos
   - Accesos a Quiz, Flashcards, Temario

## 🔍 Verificación

Para verificar que todo está correcto:

```bash
# Ver archivos de contenido
ls src/data/modules/     # Debe mostrar 1.md, 2.md, ..., 9.md
ls src/data/mcq/         # Debe mostrar los archivos mcq_modulo*.json

# Ver que las dependencias están instaladas
ls node_modules/         # Debe mostrar carpetas de dependencias
```

## 📞 Ayuda

Si sigues teniendo problemas:

1. Verifica la versión de Node.js: `node --version` (debe ser 18+)
2. Limpia la caché de npm: `npm cache clean --force`
3. Elimina node_modules y reinstala
4. Revisa la consola del navegador para errores de JavaScript
5. Revisa la terminal donde ejecutas el servidor para errores

## 💾 Alternativa: Abrir HTML directamente

Si todo lo anterior falla, puedes abrir el archivo HTML directamente:

1. Abre `index.html` en tu navegador
2. NOTA: Algunas funcionalidades pueden no trabajar sin un servidor (CORS, módulos ES)

La opción recomendada es siempre usar un servidor HTTP local.

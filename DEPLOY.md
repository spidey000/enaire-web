# 🚀 Guía de Deploy - ENAIRE Web

## Opción 1: Netlify (RECOMENDADO - Más Fácil)

### Método A: Arrastrar y Soltar (Drag & Drop)

1. **Crear el build:**
   ```bash
   cd enaire-web
   npm run build
   ```

2. **Subir a Netlify:**
   - Ve a https://app.netlify.com/drop
   - Arrastra la carpeta `dist/` que se creó
   - ¡Listo! En unos segundos tendrás tu web online

### Método B: Netlify CLI

```bash
# Instalar Netlify CLI (opcional, se usa npx directamente)
npm install -g netlify-cli

# Hacer deploy
cd enaire-web
npm run build
netlify deploy --prod --dir=dist
```

O usar el script:
```bash
deploy-netlify.bat    # Windows
./deploy-netlify.sh   # Linux/Mac
```

## Opción 2: Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Hacer deploy
cd enaire-web
npm run build
vercel --prod
```

## Opción 3: GitHub Pages

### Pasos:

1. **Inicializar repo de Git:**
   ```bash
   cd enaire-web
   git init
   git add .
   git commit -m "Initial commit - ENAIRE Web"
   ```

2. **Crear repositorio en GitHub:**
   - Ve a https://github.com/new
   - Crea un nuevo repositorio (nombre: enaire-web)
   - NO inicializar con README

3. **Subir a GitHub:**
   ```bash
   git remote add origin https://github.com/TU_USUARIO/enaire-web.git
   git branch -M main
   git push -u origin main
   ```

4. **Activar GitHub Pages:**
   - Ve a Settings > Pages
   - Source: Deploy from a branch
   - Branch: main / root
   - Click en Save

5. **Tu web estará en:**
   ```
   https://TU_USUARIO.github.io/enaire-web/
   ```

## Opción 4: Surge.sh (Más Simple)

```bash
# Instalar Surge
npm install -g surge

# Hacer build
cd enaire-web
npm run build

# Deploy (te pedirá email y dominio)
surge dist

# Tu web estará en: http://enaire-web.surge.sh
```

## Opción 5: Python HTTP Server (Local)

Para testing local sin npm:

```bash
cd enaire-web
python start-python.py

# O manualmente:
python -m http.server 3000 --directory .
```

Luego abre: http://localhost:3000

## 📋 Verificación del Build

Antes de hacer deploy, verifica que el build sea correcto:

```bash
# 1. Limpiar build anterior
rm -rf dist/

# 2. Crear nuevo build
npm run build

# 3. Verificar archivos creados
ls dist/
# Debe mostrar: index.html, assets/, etc.

# 4. Probar localmente
npm run preview
# O: npx serve dist
```

## 🔧 Solución de Problemas

### Error: "Cannot find module 'markdown-it'"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "vite command not found"

```bash
# Instalar Vite explícitamente
npm install --save-dev vite
```

### Build falla con errores de import

Verifica que `package.json` tenga:
```json
{
  "type": "module"
}
```

### Deploy funciona pero la web está en blanco

1. Abre la consola del navegador (F12)
2. Busca errores de JavaScript
3. Verifica que las rutas de los archivos sean correctas
4. Common issue: rutas relativas vs absolutas

## 📊 Opciones de Deploy Comparadas

| Servicio | Facilidad | Velocidad | Coste | Custom Domain |
|----------|-----------|-----------|-------|---------------|
| **Netlify Drop** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis | ✅ Sí |
| **Vercel** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Gratis | ✅ Sí |
| **GitHub Pages** | ⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis | ✅ Sí |
| **Surge.sh** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis | ❌ No |
| **Python HTTP** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis (local) | ❌ No |

## 🎯 Recomendación

**Para testing rápido:** Usa Netlify Drop (arrastrar y soltar)

**Para producción:** Usa Netlify o Vercel con custom domain

**Para GitHub integration:** Usa GitHub Pages con GitHub Actions

## ✅ Checklist Pre-Deploy

- [ ] Build de producción funciona localmente
- [ ] Todas las páginas cargan correctamente
- [ ] Links y navegación funcionan
- [ ] LocalStorage funciona (progreso se guarda)
- [ ] Responsive design (móvil, tablet, desktop)
- [ ] No hay errores en consola del navegador
- [ ] Performance aceptable (< 3s carga inicial)

## 🌐 Una vez en Producción

1. **Comparte la URL** con quien necesite
2. **Añade a favoritos** en tu navegador
3. **Crea un acceso directo** en el escritorio
4. **Testing completo** en diferentes dispositivos
5. **Monitorea** si hay errores o problemas

---

**Fecha**: 23 Enero 2025
**Proyecto**: ENAIRE Study Web v1.0.0

# 📚 ENAIRE Study Web

Web de estudio para la preparación del examen de Controlador de Tránsito Aéreo (ATCO) de ENAIRE.

## ✨ Características

- **📖 Visualizador de Temario**: 9 módulos completos en formato Markdown con búsqueda y tabla de contenidos
- **🧠 Sistema de Quiz**: Tests interactivos configurables por módulo, dificultad y número de preguntas
- **🎴 Flashcards con Spaced Repetition**: Sistema de repaso espaciado basado en algoritmo SM-2
- **📊 Seguimiento de Progreso**: Dashboard con estadísticas de estudio
- **🔍 Búsqueda**: Busca contenido en temario y preguntas
- **💾 Persistencia Local**: Tu progreso se guarda en el navegador (LocalStorage)

## 🚀 Instalación y Uso

### Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn

### Pasos de Instalación

```bash
# Entrar en el directorio del proyecto
cd enaire-web

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Comandos Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Previsualizar build de producción
```

## 📁 Estructura del Proyecto

```
enaire-web/
├── src/
│   ├── data/
│   │   ├── modules/           # Temario Markdown (9 módulos)
│   │   ├── mcq/              # Preguntas MCQ (~200 preguntas)
│   │   ├── summaries/        # Resúmenes
│   │   └── modules-index.json # Índice de módulos
│   ├── pages/
│   │   ├── home/             # Dashboard principal
│   │   ├── syllabus/         # Visualizador de temario
│   │   ├── quiz/             # Sistema de quizzes
│   │   ├── flashcards/       # Sistema de flashcards
│   │   └── progress/         # Seguimiento de progreso
│   ├── styles/               # Estilos CSS
│   ├── js/                   # Lógica JavaScript
│   └── index.html            # HTML principal
├── package.json
├── vite.config.js
└── README.md
```

## 🎮 Uso de la Aplicación

### 1. Dashboard (Inicio)
- Vista general de tu progreso
- Accesos rápidos a todas las secciones
- Estadísticas globales de estudio

### 2. Temario
- Navega por los 9 módulos
- Usa la búsqueda para encontrar conceptos
- Marca tu progreso de lectura

### 3. Quiz
- Selecciona los módulos a estudiar
- Configura dificultad y número de preguntas
- Elige modo:
  - **Práctica**: Feedback inmediato después de cada pregunta
  - **Examen**: Feedback al final del test
- Revisa tus errores al finalizar

### 4. Flashcards
- Repasa conceptos clave
- El sistema adapta la frecuencia de repaso según tu rendimiento
- Clasifica tarjetas como:
  - ✅ Lo sé (5) - Repaso en 7 días
  - 🤔 Difícil (3) - Repaso en 3 días
  - ❌ No lo sé (1) - Repaso en 1 día

### 5. Progreso
- Visualiza tu progreso por módulo
- Consulta historial de quizzes
- Monitorea tu mejora continua

## 📊 Contenido Disponible

| Módulo | Tema | Preguntas MCQ |
|--------|------|---------------|
| 1 | Entorno Profesional | 40 |
| 2 | Aerodinámica | 60 |
| 3 | Navegación y Sistemas | 80 |
| 4 | Plan de Vuelo y ATFCM | 50 |
| 5 | Códigos OACI/IATA | 30 |
| 6 | Cartografía | 40 |
| 7-9 | Módulos adicionales | Pendiente |

**Total**: ~300 preguntas MCQ planificadas, ~200 implementadas

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript ES6+
- **Build Tool**: Vite 5
- **Librerías**:
  - markdown-it: Renderizado de Markdown
- **Storage**: LocalStorage (persistencia en navegador)
- **Routing**: Hash-based router (sin servidor)

## 📝 Notas de Desarrollo

### Agregar Nuevas Preguntas MCQ

1. Crea un archivo JSON en `src/data/mcq/` con el formato:
```json
{
  "module_id": "MOD_XXX",
  "module_name": "Nombre del Módulo",
  "mcq_set": [
    {
      "question_id": "MODX_001",
      "question_text": "¿Pregunta?",
      "difficulty": 2,
      "type": "multiple_choice",
      "options": [
        {"option_id": "A", "text": "Opción A"},
        {"option_id": "B", "text": "Opción B"},
        {"option_id": "C", "text": "Opción C"},
        {"option_id": "D", "text": "Opción D"}
      ],
      "correct_answer": "B",
      "hint": "Pista opcional",
      "explanation": "Explicación detallada",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

2. Actualiza `src/data/modules-index.json` para incluir el nuevo módulo

### Agregar Nuevo Módulo de Temario

1. Coloca el archivo Markdown en `src/data/modules/`
2. Actualiza `src/data/modules-index.json`

## 🚀 Deployment

### GitHub Pages

```bash
# Build para producción
npm run build

# El contenido de 'dist/' se sube a GitHub Pages
# O usa gh-pages:
npm install -g gh-pages
gh-pages -d dist
```

### Netlify

1. Conecta tu repositorio a Netlify
2. Configura build command: `npm run build`
3. Configura publish directory: `dist`

### Vercel

```bash
npm install -g vercel
vercel
```

## 🎨 Personalización

### Colores

Edita las CSS variables en `src/styles/main.css`:

```css
:root {
  --primary: #2563eb;      /* Color principal */
  --secondary: #64748b;    /* Color secundario */
  --success: #22c55e;      /* Éxito */
  --error: #ef4444;        /* Error */
  /* ... */
}
```

## 📱 Responsive Design

La aplicación es totalmente responsive y funciona en:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Móvil (< 768px)

## 🔒 Privacidad

- Todos los datos se guardan localmente en tu navegador
- No se envía información a servidores externos
- No requiere registro ni autenticación
- Tu progreso es privado y permanece en tu dispositivo

## 🤝 Contribuciones

Este proyecto está en desarrollo activo. Para añadir contenido o reportar bugs:

1. Añade nuevas preguntas MCQ siguiendo el formato especificado
2. Mejora el temario existente
3. Reporta errores en las preguntas
4. Sugiere nuevas funcionalidades

## 📄 Licencia

Proyecto para uso personal en la preparación del examen ENAIRE.

## 🙏 Agradecimientos

Contenido basado en el temario oficial de ENAIRE para el examen de Controlador de Tránsito Aéreo.

---

**Fecha de creación**: 23 Enero 2025
**Versión**: 1.0.0
**Estado**: ✅ Funcional

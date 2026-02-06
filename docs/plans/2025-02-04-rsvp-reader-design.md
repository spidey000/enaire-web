# 📐 DISEÑO: Lector RSVP para Syllabus ENAIRE

**Fecha**: 4 Febrero 2025
**Versión**: 1.0
**Estado**: Draft para revisión

---

## 1. Visión General y Ubicación

El lector RSVP (Rapid Serial Visual Presentation) será un **banner situado inmediatamente debajo del título del módulo** en la página de syllabus (`src/pages/syllabus/syllabus.js`). No es una página separada ni un modal, sino un componente integrado en el layout existente que convive con el contenido markdown renderizado.

**Estado inicial**: El banner aparece **expandido y pausado** (preview mode), mostrando la primera palabra del módulo en el lector RSVP. Esto permite al usuario entender inmediatamente cómo funciona sin necesidad de hacer clic. La palabra se muestra en tamaño grande, centrada, con la letra ORP marcada en rojo siguiendo el estilo Spritz.

El diseño visual es una **réplica exacta de Spritz.com**: caja blanca centrada de 600px de ancho, palabras de 60px, fondo gris claro (#f5f5f5), minimalista sin distractores. Se integra mediante la clase CSS `.spritz-banner` en los estilos existentes del proyecto.

---

## 2. Arquitectura de Componentes

El lector RSVP se compone de **3 capas principales**:

**Capa 1 - Parser de Markdown (Build-time)**
- Script Python que se ejecuta con `npm run annotate`
- Lee los archivos `.md` originales de `/src/data/modules/`
- Analiza el contenido y añade marcadores `{{PAUSE:TYPE}}` donde detecta:
  - **Bloques de código/fórmulas LaTeX**: patrones ` ``` ` o `$ $` → `{{PAUSE:FORMULA}}`
  - **Siglas mayúsculas**: regex `[A-Z]{2,5}` (ATC, ILS, VOR, DME) → `{{PAUSE:ACRONYM}}`
  - **Listas**: items `<li>`, bullets `*`, números `1.` → `{{PAUSE:LIST}}`
  - **Tablas**: bloques markdown tabla → `{{PAUSE:TABLE}}`
  - **Imágenes**: patrones `![alt](url)` → `{{PAUSE:IMAGE}}`
- Genera archivos anotados en `/src/data/modules-annotated/`
- Preserva los originales sin modificaciones

**Capa 2 - Motor RSVP (Runtime)**
- Clase `RSVPReader` en `/src/js/rsvp/reader.js`
- Calcula ORP (Optical Recognition Point) dinámico: 35% para palabras < 8 chars, 50% para ≥ 8 chars
- Renderiza palabra por palabra en el DOM con la letra ORP en rojo
- Gestiona temporizadores según WPM (100-1000 rango continuo)
- **Aplica delays automáticos**: cada marcador `{{PAUSE:TYPE}}` añade +500ms al tiempo de visualización de esa palabra
- **Para imágenes**: detecta `{{PAUSE:IMAGE}}`, muestra texto alt + aviso "Imagen detectada - Pulsa Espacio para verla" durante 500ms, si el usuario no interactúa continúa automáticamente
- No hay pausas manuales, todas las ralentizaciones son autoprogress

**Capa 3 - Interfaz de Usuario**
- Slider horizontal minimalista con snapping en headings (##, ###)
- Selector WPM: range slider 100-1000 con ajuste fino
- Botón grande "START" que se transforma en controles al activarse
- Sistema de bookmarks con dropdown simple
- Persistencia en LocalStorage integrada con `storage.getProgress()`

---

## 3. Sistema de Navegación y Slider

**Slider por Secciones (Headings)**

El slider representa posiciones lógicas de headings, no palabras individuales. Cada heading (##, ###) = 1 unidad en el slider. El usuario mueve el slider y el lector salta al inicio de ese heading, ignorando cualquier marcador de pausa intermedio.

**Especificaciones técnicas:**
- Slider horizontal minimalista (height: 8px)
- Thumb con snapping visual en headings
- Tooltip muestra: título de sección actual + progreso (ej: "3.2 Navegación VOR - 45%")
- Rango: 0 a N (N = total de headings en el módulo)
- Colores: pendiente (gris #e5e7eb), en curso (azul #2563eb), completado (verde #22c55e)
- El slider ignora las pausas: solo snap en headings, los marcadores {{PAUSE:TYPE}} solo se respetan en playback secuencial

**Integración con TOC existente:**
- El slider se sincroniza con la tabla de contenidos actual
- Al hacer click en un link del TOC, el slider se actualiza a la posición correspondiente
- Bidireccional: mover el slider actualiza el scroll del contenido markdown

---

## 4. Algoritmo ORP y Visualización

**Cálculo del ORP (Spritz estándar):**

```javascript
function calculateORP(word) {
  const len = word.length;
  if (len < 8) {
    return Math.round(len * 0.35); // 35% desde izquierda
  } else {
    return Math.floor(len / 2); // Centro para palabras largas
  }
}
```

**Renderizado de palabra:**
- Palabra completa en negro (#000000)
- Letra ORP en rojo (#ff0000), tamaño aumentado 10%
- Fuente: Arial, 60px, weight bold
- Centrado horizontal en contenedor de 600px
- Transición suave entre palabras (fade-in 50ms)

**Ejemplos:**
- "VOR" (3 chars): ORP = 1 → V**O**R (O en rojo)
- "navegación" (10 chars): ORP = 5 → naveg**a**ción (a en rojo)
- "radioayudas" (11 chars): ORP = 5 → radio**a**yudas (a en rojo)

---

## 5. Control de Velocidad (WPM)

**Slider Continuo 100-1000 WPM:**
- Range input con step=25 para ajuste fino
- Display del valor actual en tiempo real
- Calcula delay por palabra: `delay = 60000 / WPM` ms
- Ejemplo: 300 WPM = 200ms por palabra, 500ms extra si tiene {{PAUSE:TYPE}}

**WPM por Módulo (Persistencia):**
- Cada módulo guarda su WPM preferido en LocalStorage
- Al cambiar de módulo, recupera el WPM anterior de ese módulo
- Inicialización: primer acceso usa 250 WPM (base)
- Storage structure: `storage.getProgress().modules[moduleId].rsvpWpm`

---

## 6. Controles de Playback

**Botón START:**
- Botón grande centrado (200px x 80px), texto "START RSVP"
- Al hacer clic: se transforma en controles de playback
- Efecto: fade-out button, fade-in controls

**Keyboard Shortcuts (completo):**
- `Espacio`: Play/Pause
- `←`: Palabra anterior
- `→`: Palabra siguiente
- `Shift + ←`: Heading anterior
- `Shift + →`: Heading siguiente
- `+` / `-`: Aumentar/Disminuir WPM
- `Ctrl + B` / `⌘ + B`: Crear bookmark en posición actual
- `Esc`: Cerrar banner RSVP (colapsar)
- `?`: Mostrar modal de ayuda con todos los shortcuts

**Toolbar:**
No hay toolbar con iconos, solo el botón START inicial y keyboard shortcuts. Minimalista.

---

## 7. Sistema de Bookmarks

**Dropdown Simple Lista:**
- Botón 🔖 en el banner (visible solo cuando RSVP está activo)
- Click abre dropdown con lista de bookmarks del módulo actual
- Cada bookmark muestra: título de sección + palabra aproximada
- Click en bookmark → salta directo a esa posición
- Persistencia: `storage.getProgress().modules[moduleId].rsvpBookmarks = [{headingId, wordIndex, timestamp}]`

**Sin notas personalizadas:**
- Solo guarda posición, no permite editar títulos o añadir notas
- Simple y rápido

---

## 8. Persistencia y Progreso

**Datos Guardados (LocalStorage):**

```javascript
{
  modules: {
    [moduleId]: {
      questionsSeen: 0,
      questionsCorrect: 0,
      averageScore: 0,
      flashcardsReviewed: 0,
      lastStudied: null,
      readingTime: 0,

      // RSVP-specific
      rsvpPosition: { headingId: "h-3-2", wordIndex: 147 },
      rsvpWpm: 350,
      rsvpBookmarks: [...],
      rsvpCompletedHeadings: ["h-1-1", "h-1-2", "h-2-1", ...]
    }
  },
  lastStudyDate: "2025-01-23"
}
```

**Auto-save cada 5 segundos:**
- Guarda posición exacta (palabra) + heading actual
- Al volver a la página: "Continuando desde: 3.2 Navegación VOR"
- Marca headings como completados cuando el slider pasa por ellos

---

## 9. Procesamiento de Contenido (Híbrido)

**Estrategia Híbrida (Metadata Upfront):**

**Fase 1 - Carga inicial (upfront):**
- Parsea markdown anotado del módulo
- Extrae metadata de todos headings: títulos, IDs, word count, pausas
- Cache en memoria: `moduleMetadata = { headings: [...], totalWords: 15432 }`
- El slider puede mostrar todos los headings sin cargar el texto completo

**Fase 2 - Carga de texto (on-demand):**
- Carga solo texto de secciones actuales (current + 2 siguientes)
- Cada sección ~10KB, carga en chunks
- Cache en memoria para acceso instantáneo
- Libera secciones ya leídas (garbage collection)

**Detección de Pausas con Marcadores:**
```javascript
// Input markdown anotado:
"La ecuación de Bernoulli{{PAUSE:FORMULA}} es fundamental..."

// Parser detecta marcador, extrae TYPE
const pauseType = match[1]; // "FORMULA"
const baseDelay = 60000 / wpm; // ej: 200ms
const totalDelay = baseDelay + 500; // 700ms para esta palabra
```

---

## 10. Manejo de Contenido Especial

**Imágenes:**
- Detecta `{{PAUSE:IMAGE}}`
- Muestra texto alt + aviso "📷 Imagen detectada - Pulsa Espacio para verla"
- Delay de 500ms
- Si usuario pulsa Espacio: abre modal con imagen completa
- Si no interactúa: continúa automáticamente tras 500ms

**Tablas:**
- Detecta `{{PAUSE:TABLE}}`
- Delay de 500ms
- No muestra contenido de tabla (muy complejo para RSVP)
- Usuario puede ver tabla en el markdown renderizado normal (debajo del banner)

**Fórmulas LaTeX:**
- Detecta `{{PAUSE:FORMULA}}`
- Delay de 500ms
- Similar a tablas: no muestra la fórmula en RSVP
- Usuario revisa en contenido markdown normal

**Listas:**
- Detecta `{{PAUSE:LIST}}`
- Delay de 500ms por cada item
- Texto de lista se muestra normalmente en RSVP
- Pausa extra para procesar cada punto

**Siglas:**
- Detecta `{{PAUSE:ACRONYM}}`
- Delay de 500ms
- Sigla se muestra normalmente en RSVP
- Pausa para procesamiento cognitivo

---

## 11. Responsive y Mobile

**Mobile-First Responsive:**

**Desktop (>768px):**
- Banner: 600px ancho, 80px alto
- Palabra: 60px
- Slider: 8px alto
- Keyboard shortcuts completos

**Tablet (768px - 1024px):**
- Banner: 500px ancho, 70px alto
- Palabra: 50px
- Slider: 10px alto (touch-friendly)

**Móvil (<768px):**
- Banner: 100% ancho (menos 20px padding), 60px alto
- Palabra: 40px
- Slider: 12px alto, touch-optimized
- Botón START: 180px x 60px
- Keyboard shortcuts no funcionan (no keyboard físico)
- Controles táctiles: tap (play/pause), swipe left/right (palabra)

---

## 12. Integración con Ecosistema de Estudio

**Final de Módulo - Celebración + Stats:**
```
║  ¡Módulo completado! 🎉                            ║
║                                                     ║
║  Tiempo total: 45 min                               ║
║  WPM promedio: 380                                  ║
║  Headings leídos: 47/47 (100%)                      ║
║                                                     ║
║  [🔄 Repetir módulo]  [➡️ Siguiente módulo]        ║
║  [📝 Tomar quiz de este módulo →]                  ║
║                                                     ║
║  Parece que has dominado Módulo 2.                  ║
║  ¿Continuar con Módulo 3: Navegación?              ║
```

**Persistencia de Estado:**
- Marca módulo como "completado en RSVP" con icono 👁️
- El dashboard muestra:
  - ✅ = Quiz completado
  - 👁️ = Leído en RSVP
  - 📖 = En progreso
  - ⚪ = No iniciado

---

## 13. Accesibilidad (Básico Estándar)

**WCAG 2.1 Basic Compliance:**
- Keyboard navigation completa (desktop)
- ARIA labels en todos los controles
- Focus indicators visuales
- Screen reader compatible (NVDA, JAWS)
- Color contrast ratio > 4.5:1
- Sin modos especiales (dyslexia, high contrast)

---

## 14. Estructura de Archivos

**Nueva Estructura:**
```
src/
├── data/
│   ├── modules/              # Markdown original (sin modificar)
│   │   ├── 1.md
│   │   ├── 2.md
│   │   └── ...
│   └── modules-annotated/    # Markdown con marcadores (generado)
│       ├── 1.md
│       ├── 2.md
│       └── ...
├── js/
│   ├── rsvp/
│   │   ├── reader.js         # Motor RSVP principal
│   │   ├── orp.js            # Cálculo ORP
│   │   ├── parser.js         # Parser de markdown anotado
│   │   └── ui.js             # UI del banner
│   └── utils/
│       └── markdown.js       # (existente, sin modificar)
├── pages/
│   └── syllabus/
│       └── syllabus.js       # Modificado para integrar banner RSVP
└── styles/
    └── rsvp.css              # Estilos del banner Spritz
scripts/
└── annotate_modules.py      # Build-time script para añadir marcadores
package.json                   # Nuevo script: "annotate": "python3 scripts/annotate_modules.py"
```

---

## 15. Script de Anotación (Build-time)

**`scripts/annotate_modules.py`:**

```python
import os
import re

SOURCE_DIR = r'src/data/modules'
TARGET_DIR = r'src/data/modules-annotated'

# Regex patterns for protection (multi-line)
PROTECTED_PATTERNS = [
    (r'(```[\s\S]*?```)', 'FORMULA'),      # Code blocks
    (r'(\$\$[\s\S]*?\$\$)', 'FORMULA'),    # Display math
    (r'(\$[^$]+\$)', 'FORMULA'),           # Inline math
    (r'(!\[([^\]]*)\]\([^)]+\))', 'IMAGE'), # Images
]

def annotate_text(text):
    # Protect specific blocks by wrapping them with PAUSE markers
    # Annotate acronyms
    # Remove punctuation
    ...
```

---

## 16. Plan de Implementación

**Fase 1 - Build Pipeline (1 día):**
- [x] Crear `scripts/annotate_modules.py`
- [x] Añadir script `npm run annotate` a package.json
- [x] Ejecutar anotación en todos los módulos
- [x] Verificar output en `/modules-annotated/`

**Fase 2 - Motor RSVP Core (2 días):**
- [ ] Crear `src/js/rsvp/orp.js` - cálculo ORP
- [ ] Crear `src/js/rsvp/reader.js` - motor principal
- [ ] Implementar word-by-word rendering
- [ ] Implementar WPM timing con delays por pausas
- [ ] Test manual con contenido simple

**Fase 3 - Parser y Metadata (1 día):**
- [ ] Crear `src/js/rsvp/parser.js`
- [ ] Extraer metadata de headings
- [ ] Parsear marcadores {{PAUSE:TYPE}}
- [ ] Implementar carga híbrida (metadata upfront, texto on-demand)

**Fase 4 - UI Banner (2 días):**
- [ ] Crear `src/js/rsvp/ui.js`
- [ ] Diseñar banner Spritz (réplica exacta)
- [ ] Implementar slider con snapping en headings
- [ ] Implementar WPM selector (slider 100-1000)
- [ ] Implementar botón START → controles
- [ ] Añadir keyboard shortcuts

**Fase 5 - Persistencia (1 día):**
- [ ] Integrar con storage.getProgress()
- [ ] Guardar posición, WPM, bookmarks
- [ ] Auto-save cada 5 segundos
- [ ] Restore al volver a la página

**Fase 6 - Features Avanzadas (2 días):**
- [ ] Sistema de bookmarks (dropdown simple)
- [ ] Modal para imágenes
- [ ] Celebración final de módulo + stats
- [ ] Links a siguiente módulo y quiz

**Fase 7 - Integración Syllabus (1 día):**
- [ ] Modificar `src/pages/syllabus/syllabus.js`
- [ ] Insertar banner below title
- [ ] Sincronizar slider con TOC
- [ ] Responsive mobile

**Fase 8 - Testing Manual (1 día):**
- [ ] Leer módulo completo a diferentes WPM
- [ ] Validar todas las pausas automáticas
- [ ] Test keyboard shortcuts
- [ ] Test bookmarks y persistencia
- [ ] Test mobile responsive

**Total estimado: 11 días**

---

## 17. Métricas de Éxito

**Performance:**
- Carga inicial < 2 segundos (metadata upfront)
- Transición entre palabras < 50ms
- Memoria < 50MB (módulo completo cacheado)

**UX:**
- WPM efectivo: 250-500 para comprensión
- Tiempo para leer módulo promedio: 30-45 min
- Retention: usuarios completan > 70% de módulos iniciados

**Adopción:**
- > 50% de usuarios usan RSVP al menos 1 vez
- > 30% de usuarios leen > 50% de módulos en RSVP
- WPM promedio aumenta 20% después de 5 sesiones

---

## 18. Decisiones de Diseño y Trade-offs

**Decisiones clave:**

1. **Build-time vs Runtime anotación**: Build-time elegido por performance. Trade-off: requiere rebuild al modificar markdown, pero runtime es instantáneo.

2. **Snap ignora pausas**: Simplifica UX del slider. Trade-off: no puedes saltar directamente a una fórmula específica, pero reduces complejidad visual.

3. **WPM slider continuo vs presets**: Continuo da flexibilidad. Trade-off: más clicks para ajustar, pero permite encontrar velocidad óptima personal.

4. **Pausas automáticas vs manuales**: Automáticas (+500ms) mantienen flujo. Trade-off: menos control para usuario que quiere estudiar una fórmula en profundidad, pero reduce fricción.

5. **Híbrido metadata upfront**: Balance perfecto. Trade-off: complejidad adicional en parser, pero carga inicial rápida y scrolling instantáneo.

**Riesgos identificados:**
- **Regex falsos positivos**: siglas como "EL" o "LA" pueden marcarse como acrónimos. Solución: diccionario de exclusión.
- **Tamaño de módulos anotados**: +15% tamaño por marcadores. Aceptable.
- **Performance en móviles**: garbage collection crítico. Testing exhaustivo requerido.

---

## 19. Referencias

- **Spritz.com**: https://spritz.com/ (diseño visual y algoritmo ORP)
- **Spritz Algorithm**: https://medium.com/@kevinlelick/an-analysis-of-spritzs-reading-technology-5b7f0e7b6e9f
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Markdown-it**: https://github.com/markdown-it/markdown-it (parser existente)

---

**Fin del documento de diseño**

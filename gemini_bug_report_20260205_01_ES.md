# Informe de Bugs: Problemas de Migración de UI Spritz

## Resumen
**Fecha:** Jueves, 5 de Febrero, 2026
**Proyecto:** enaire-web
**Resumen:** El renombramiento reciente de componentes RSVP a "Spritz" introdujo varias regresiones críticas de funcionalidad en la lógica de navegación.

---

## Hallazgos

### 1. Referencia a Método Indefinido `previousSection()`
- **Archivo:** `src/js/rsvp/ui.js`
- **Ubicación:** Línea 142 (dentro de `_initControls`)
- **Severidad:** **CRÍTICA**
- **Descripción:** El event listener del botón atrás llama a `this.reader.previousSection()`. Sin embargo, la clase `RSVPReader` solo implementa `previousWord()`. Esto causa un error de runtime cuando el usuario intenta retroceder.
- **Impacto:** La navegación está rota; hacer clic en el botón atrás rompe el componente UI.

### 2. Referencia a Método Indefinido `nextSection()`
- **Archivo:** `src/js/rsvp/ui.js`
- **Ubicación:** Línea 143 (dentro de `_initControls`)
- **Severidad:** **CRÍTICA**
- **Descripción:** Similar al botón atrás, el botón adelante llama a `this.reader.nextSection()`, el cual no existe. El método correcto es `nextWord()`.
- **Impacto:** La navegación está rota; hacer clic en el botón adelante rompe el componente UI.

### 3. Escala del Slider de Navegación y Discrepancia de Métodos
- **Archivo:** `src/js/rsvp/ui.js`
- **Ubicación:** Línea 98 (HTML) y Línea 204 (`_handleNavChange`)
- **Severidad:** **ALTA**
- **Descripción:**
    1. El `max` del slider está codificado como `100` en el HTML, pero se usa para indexar palabras directamente. Si un módulo tiene más de 100 palabras, el usuario no puede navegar más allá de la palabra 100.
    2. `_handleNavChange` llama a `this.reader.seekToPosition(position)`, pero el método en `RSVPReader.js` se llama `seekToWord(index)`.
- **Impacto:** Los usuarios están restringidos a una pequeña porción del texto, y la navegación manual vía slider falla completamente.

---

## Correcciones Recomendadas

1. **Actualizar Event Listeners:**
   Cambiar las llamadas en `_initControls` para usar `previousWord()` y `nextWord()`.

2. **Corregir Lógica del Slider:**
   - En `loadModule`, actualizar dinámicamente `document.getElementById('spritzNavSlider').max` para que coincida con `this.reader.getTotalWords()`.
   - En `_handleNavChange`, actualizar la llamada a `this.reader.seekToWord(position)`.

3. **Verificar Nombres de Métodos:**
   Asegurarse de que todas las llamadas de UI-a-Reader coincidan con la API definida en `src/js/rsvp/reader.js`.

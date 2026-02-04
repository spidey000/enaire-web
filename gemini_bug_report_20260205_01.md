# Bug Report: Spritz UI Migration Issues

## Overview
**Date:** Thursday, February 5, 2026
**Project:** enaire-web
**Summary:** The recent renaming of RSVP components to "Spritz" introduced several critical functional regressions in the navigation logic.

---

## Findings

### 1. Reference to Undefined Method `previousSection()`
- **File:** `src/js/rsvp/ui.js`
- **Location:** Line 142 (within `_initControls`)
- **Severity:** **CRITICAL**
- **Description:** The back button event listener calls `this.reader.previousSection()`. However, the `RSVPReader` class only implements `previousWord()`. This causes a runtime error when the user attempts to go back.
- **Impact:** Navigation is broken; clicking the back button crashes the UI component.

### 2. Reference to Undefined Method `nextSection()`
- **File:** `src/js/rsvp/ui.js`
- **Location:** Line 143 (within `_initControls`)
- **Severity:** **CRITICAL**
- **Description:** Similar to the back button, the forward button calls `this.reader.nextSection()`, which does not exist. The correct method is `nextWord()`.
- **Impact:** Navigation is broken; clicking the forward button crashes the UI component.

### 3. Navigation Slider Scaling and Method Mismatch
- **File:** `src/js/rsvp/ui.js`
- **Location:** Line 98 (HTML) and Line 204 (`_handleNavChange`)
- **Severity:** **HIGH**
- **Description:** 
    1. The slider's `max` is hardcoded to `100` in the HTML, but it is used to index words directly. If a module has more than 100 words, the user cannot navigate past the 100th word.
    2. `_handleNavChange` calls `this.reader.seekToPosition(position)`, but the method in `RSVPReader.js` is named `seekToWord(index)`.
- **Impact:** Users are restricted to a small portion of the text, and manual seeking via the slider fails entirely.

---

## Recommended Fixes

1. **Update Event Listeners:**
   Change the calls in `_initControls` to use `previousWord()` and `nextWord()`.

2. **Fix Slider Logic:**
   - In `loadModule`, dynamically update `document.getElementById('spritzNavSlider').max` to match `this.reader.getTotalWords()`.
   - In `_handleNavChange`, update the call to `this.reader.seekToWord(position)`.

3. **Verify Method Names:**
   Ensure all UI-to-Reader calls match the API defined in `src/js/rsvp/reader.js`.

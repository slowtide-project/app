// =========================================================================
// Shared systems - Timer only (mode-specific logic moved to mode files)
// =========================================================================

import { AppState, DOM, AudioState } from './state.js';
import { trackSessionEnd } from './analytics.js';

let currentMode = null;

export function setCurrentMode(mode) {
    currentMode = mode;
}

export function getCurrentMode() {
    return currentMode;
}

/** Session timer management - mode aware */
export const Timer = {
    /**
     * Start the session timer
     * @param {boolean} reset - Whether to reset elapsed time
     */
    start(reset = true) {
        if (AppState.timerInterval) clearInterval(AppState.timerInterval);
        if (reset) { 
            AppState.startTime = Date.now(); 
            AppState.elapsedSaved = 0; 
        }
        
        // Only run timer for activities mode
        if (currentMode === 'activities') {
            this.updateDisplay();
            AppState.timerInterval = setInterval(() => { 
                this.updateDisplay(); 
            }, 1000);
        }
    },

    /**
     * Pause the timer and audio
     */
    pause() {
        clearInterval(AppState.timerInterval);
        AppState.elapsedSaved += Date.now() - AppState.startTime;
        if (AudioState.context) AudioState.context.suspend();
        DOM.pauseBtn.innerText = "Resume Session";
        DOM.pauseBtn.className = "action-btn resume-btn";
        DOM.timerDisplay.innerText += " (PAUSED)";
        
        if (typeof trackPause === 'function') {
            trackPause(true);
        }
    },

    /**
     * Resume the timer and audio
     */
    resume() {
        AppState.startTime = Date.now();
        this.start(false);
        if (AudioState.context) AudioState.context.resume();
        DOM.pauseBtn.innerText = "Pause Session";
        DOM.pauseBtn.className = "action-btn pause-btn";
        
        if (typeof trackPause === 'function') {
            trackPause(false);
        }
    },

    /**
     * Get current elapsed time in seconds
     * @returns {number} Elapsed seconds
     */
    getCurrentElapsed() { 
        return Math.floor((Date.now() - AppState.startTime) + AppState.elapsedSaved) / 1000; 
    },

    /**
     * Update timer display text
     */
    updateDisplay() {
        if (!AppState.isSessionRunning) return;
        if (currentMode === 'story') return; // No timer for story mode
        
        const totalSeconds = AppState.sessionMinutes * 60;
        const currentSessionElapsed = AppState.isPaused ? 
            (AppState.elapsedSaved / 1000) : this.getCurrentElapsed();
        let remaining = totalSeconds - currentSessionElapsed;
        
        // Check if session is complete
        if (remaining <= 0) {
            remaining = 0;
            if (AppState.isSessionRunning) {
                trackSessionEnd(true);
                AppState.isSessionRunning = false;
            }
        }
        
        let rMin = Math.floor(remaining / 60);
        let rSec = Math.floor(remaining % 60);
        DOM.timerDisplay.innerText = `Time Left: ${rMin}m ${rSec < 10 ? '0' : ''}${rSec}s` + 
            (AppState.isPaused ? " (PAUSED)" : "");
    }
};

// Export for activities mode
export { currentMode };

// =========================================================================
// Shared systems - Timer only (mode-specific logic moved to mode files)
// =========================================================================

import { AppState, DOM, AudioState } from './state.js';
import { CONFIG } from './config.js';
import { SensoryDimmer } from './sensory-dimmer.js';
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
                this.checkSunset(); 
                
                // Activities-specific: call sensory dimmer update
                if (typeof SensoryDimmer !== 'undefined') {
                    SensoryDimmer.updatePhase(); 
                }
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
        if (remaining < 0) remaining = 0;
        let rMin = Math.floor(remaining / 60);
        let rSec = Math.floor(remaining % 60);
        DOM.timerDisplay.innerText = `Time Left: ${rMin}m ${rSec < 10 ? '0' : ''}${rSec}s` + 
            (AppState.isPaused ? " (PAUSED)" : "");
    },

    /**
     * Check and apply sunset fade effects
     */
    checkSunset() {
        if (AppState.isPaused) return;
        // Only run sunset for activities mode
        if (currentMode !== 'activities') return;
        
        const totalSeconds = AppState.sessionMinutes * 60;
        const elapsed = this.getCurrentElapsed();
        let progress = elapsed / totalSeconds;
        if (progress > 1) {
            progress = 1;
            if (AppState.isSessionRunning) {
                trackSessionEnd(true);
                AppState.isSessionRunning = false;
            }
        }
        if (progress > CONFIG.SUNSET_FADE_START_RATIO) {
            const fade = (progress - CONFIG.SUNSET_FADE_START_RATIO) * 2;
            DOM.sunsetOverlay.style.opacity = fade * 0.98;
            if (AppState.currentSound !== 'off' && AudioState.gainNode) {
                const multipliers = SensoryDimmer.getPhaseMultipliers();
                AudioState.gainNode.gain.value = 0.8 * (1 - fade) * multipliers.volume;
            }
        }
    }
};

// Export for activities mode
export { currentMode };

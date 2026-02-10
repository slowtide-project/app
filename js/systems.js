import { AppState, AudioState, DOM } from './state.js';
import { CONFIG, VIEWS } from './config.js';
import { ContinuousSynth } from './audio.js';
import { Particles } from './views/particles.js';
import { Bubbles } from './views/bubbles.js';
import { Liquid } from './views/liquid.js';
import { Sorting } from './views/sorting.js';
import { Marbles } from './views/marbles.js';

/** Session timer management */
export const Timer = {
    /**
     * Start the session timer
     * @param {boolean} reset - Whether to reset elapsed time
     */
    start(reset = true) {
        if (AudioState.timerInterval) clearInterval(AudioState.timerInterval);
        if (reset) { 
            AppState.startTime = Date.now(); 
            AppState.elapsedSaved = 0; 
        }
        this.updateDisplay();
        AudioState.timerInterval = setInterval(() => { 
            this.updateDisplay(); 
            this.checkSunset(); 
            IdleManager.checkIdle(); 
        }, 1000);
    },

    /**
     * Pause the timer and audio
     */
    pause() {
        clearInterval(AudioState.timerInterval);
        AppState.elapsedSaved += Date.now() - AppState.startTime;
        if (AudioState.context) AudioState.context.suspend();
        DOM.pauseBtn.innerText = "Resume Session";
        DOM.pauseBtn.className = "action-btn resume-btn";
        DOM.timerDisplay.innerText += " (PAUSED)";
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
        const totalSeconds = AppState.sessionMinutes * 60;
        const elapsed = this.getCurrentElapsed();
        let progress = elapsed / totalSeconds;
        if (progress > 1) progress = 1;
        if (progress > CONFIG.SUNSET_FADE_START_RATIO) {
            const fade = (progress - CONFIG.SUNSET_FADE_START_RATIO) * 2;
            DOM.sunsetOverlay.style.opacity = fade * 0.98;
            if (AppState.currentSound !== 'off' && AudioState.gainNode) {
                AudioState.gainNode.gain.value = 0.8 * (1 - fade);
            }
        }
    }
};

/** System for handling user inactivity */
export const IdleManager = {
    /**
     * Check for idle state and trigger interactions
     */
    checkIdle() {
        if (!AppState.isSessionRunning || AppState.isPaused) return;
        let idleTime = Date.now() - AppState.lastInteraction;
        if (idleTime > CONFIG.GHOST_INTERACTION_TIME && Math.random() < CONFIG.IDLE_INTERACTION_CHANCE) {
            this.ghostInteraction();
        }
        if (idleTime > CONFIG.IDLE_VIEW_SWITCH_TIME) {
            this.switchToRandomView();
        }
    },

    /**
     * Switch to a random different view
     */
    switchToRandomView() {
        const views = Object.values(VIEWS);
        let next = views[Math.floor(Math.random() * views.length)];
        while (next === AppState.currentView) {
            next = views[Math.floor(Math.random() * views.length)];
        }
        ViewManager.switchView(next);
        AppState.lastInteraction = Date.now() - CONFIG.GHOST_INTERACTION_TIME;
    },

    /**
     * Trigger simulated interaction for engagement
     */
    ghostInteraction() {
        let cx = Math.random() * DOM.canvas.width;
        let cy = Math.random() * DOM.canvas.height;
        
        if (AppState.currentView === VIEWS.PARTICLES) Particles.spawn(cx, cy);
        if (AppState.currentView === VIEWS.BUBBLES) Bubbles.spawn();
        if (AppState.currentView === VIEWS.LIQUID) Liquid.spawn(cx, cy);
        if (AppState.currentView === VIEWS.SORTING && AppState.entities.length > 0) {
            let s = AppState.entities[Math.floor(Math.random() * AppState.entities.length)];
            s.dx += (Math.random() - 0.5) * 50; 
            s.dy += (Math.random() - 0.5) * 50; 
            s.vAngle += (Math.random() - 0.5) * 0.1;
        }
        if (AppState.currentView === VIEWS.MARBLES && AppState.entities.length > 0) {
            let m = AppState.entities[Math.floor(Math.random() * AppState.entities.length)];
            m.vx += (Math.random() - 0.5) * 15; 
            m.vy += (Math.random() - 0.5) * 15;
        }
    }
};

/** View switching and management */
export const ViewManager = {
    /**
     * Switch to a different activity view
     * @param {string} viewName - View name from VIEWS
     */
    switchView(viewName) {
        AppState.currentView = viewName;
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        const btn = document.getElementById(`btn-${viewName}`);
        if (btn) btn.classList.add('active');
        AppState.entities = [];
        
        if (viewName === VIEWS.SORTING) Sorting.init();
        if (viewName === VIEWS.BUBBLES) Bubbles.init();
        if (viewName === VIEWS.MARBLES) Marbles.init();
    }
};
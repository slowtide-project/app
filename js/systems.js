import { AppState, DOM } from './state.js';
import { CONFIG, VIEWS } from './config.js';
import { AudioState, AppState } from './state.js';
import { ContinuousSynth } from './audio.js';
import { Particles } from './views/particles.js';
import { Bubbles } from './views/bubbles.js';
import { Liquid } from './views/liquid.js';
import { Sorting } from './views/sorting.js';
import { Marbles } from './views/marbles.js';
import { trackActivitySwitch, trackSessionEnd, trackEngagement } from './analytics.js';

/** Session timer management */
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
        this.updateDisplay();
        AppState.timerInterval = setInterval(() => { 
            this.updateDisplay(); 
            this.checkSunset(); 
            IdleManager.checkIdle(); 
        }, 1000);
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
        
        // Track pause behavior
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
        
        // Track resume behavior
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
        if (progress > 1) {
            progress = 1;
            // Track session completion when timer expires
            if (AppState.isSessionRunning) {
                trackSessionEnd(true); // Session completed successfully
                AppState.isSessionRunning = false; // Prevent multiple tracking
            }
        }
        if (progress > CONFIG.SUNSET_FADE_START_RATIO) {
            const fade = (progress - CONFIG.SUNSET_FADE_START_RATIO) * 2;
            DOM.sunsetOverlay.style.opacity = fade * 0.98;
            if (AppState.currentSound !== 'off' && AudioState.gainNode) {
                AudioState.gainNode.gain.value = 0.8 * (1 - fade);
            }
        }
    }
};

/** Ghost interaction handler mapping by view type */
const GhostInteractionHandlers = {
    [VIEWS.PARTICLES]: () => {
        const cx = Math.random() * DOM.canvas.width;
        const cy = Math.random() * DOM.canvas.height;
        Particles.spawn(cx, cy);
    },
    [VIEWS.BUBBLES]: () => Bubbles.spawn(),
    [VIEWS.LIQUID]: () => {
        const cx = Math.random() * DOM.canvas.width;
        const cy = Math.random() * DOM.canvas.height;
        Liquid.handleStart(cx, cy);
    },
    [VIEWS.SORTING]: () => {
        if (AppState.entities.length > 0) {
            const s = AppState.entities[Math.floor(Math.random() * AppState.entities.length)];
            s.dx += (Math.random() - 0.5) * CONFIG.GHOST_IMPULSE_SORTING;
            s.dy += (Math.random() - 0.5) * CONFIG.GHOST_IMPULSE_SORTING;
            s.vAngle += (Math.random() - 0.5) * CONFIG.GHOST_ANGLE_IMPULSE;
        }
    },
    [VIEWS.MARBLES]: () => {
        if (AppState.entities.length > 0) {
            const m = AppState.entities[Math.floor(Math.random() * AppState.entities.length)];
            m.vx += (Math.random() - 0.5) * CONFIG.GHOST_IMPULSE_MARBLES;
            m.vy += (Math.random() - 0.5) * CONFIG.GHOST_IMPULSE_MARBLES;
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
            // Track ghost interaction as engagement
            trackEngagement('ghost_interaction');
        }
        
        // Auto-switch logic based on parent setting
        if (AppState.autoSwitchMode !== 'off') {
            let switchTime = AppState.autoSwitchMode === 'long' ? 
                CONFIG.IDLE_VIEW_SWITCH_TIME_LONG : CONFIG.IDLE_VIEW_SWITCH_TIME;
            if (idleTime > switchTime) {
                this.switchToRandomView();
                trackEngagement('auto_switch');
            }
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
        const handler = GhostInteractionHandlers[AppState.currentView];
        if (handler) handler();
    }
};

/** View initialization handler mapping */
const ViewInitHandlers = {
    [VIEWS.SORTING]: () => Sorting.init(),
    [VIEWS.BUBBLES]: () => Bubbles.init(),
    [VIEWS.MARBLES]: () => Marbles.init()
};

/** View switching and management */
export const ViewManager = {
    /**
     * Switch to a different activity view
     * @param {string} viewName - View name from VIEWS
     */
    switchView(viewName) {
        const previousView = AppState.currentView;
        AppState.currentView = viewName;
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        const btn = document.getElementById(`btn-${viewName}`);
        if (btn) btn.classList.add('active');
        AppState.entities = [];
        
        const initHandler = ViewInitHandlers[viewName];
        if (initHandler) initHandler();
        
        // Track activity switch (but not for initial random selection)
        if (AppState.isSessionRunning && previousView !== undefined) {
            trackActivitySwitch(viewName);
        } else if (AppState.isSessionRunning) {
            // Track initial activity selection as page view
            const activityTitles = {
                'particles': 'Particles Activity',
                'sorting': 'Sorting Activity', 
                'bubbles': 'Bubbles Activity',
                'liquid': 'Liquid Activity',
                'marbles': 'Marbles Activity'
            };
            const activityTitle = activityTitles[viewName] || viewName;
            trackVirtualPageView(activityTitle, {
                activity_name: viewName,
                transition_type: 'session_start'
            });
        }
    }
};
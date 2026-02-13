// =========================================================================
// Activities Mode - Interactive activities with auto-switch, idle/ghost
// =========================================================================

import { AppState, DOM } from '../state.js';
import { CONFIG, VIEWS, STORY_SCENES } from '../config.js';
import { AudioEngine, ContinuousSynth } from '../audio.js';
import { Timer } from '../systems.js';
import { trackSessionStart, trackActivitySwitch, trackEngagement, trackVirtualPageView, generateSessionIdentifier } from '../analytics.js';
import { Particles } from '../views/activities/particles.js';
import { Sorting } from '../views/activities/sorting.js';
import { Bubbles } from '../views/activities/bubbles.js';
import { Liquid } from '../views/activities/liquid.js';
import { Marbles } from '../views/activities/marbles.js';

// Activities-specific configuration
export const ACTIVITIES_CONFIG = {
    DENSITY_MULTIPLIERS: {
        minimal: CONFIG.DENSITY_MINIMAL_MULTIPLIER,
        standard: CONFIG.DENSITY_STANDARD_MULTIPLIER,
        rich: CONFIG.DENSITY_RICH_MULTIPLIER
    },
    EMERGENT_EVENT_CHANCES: {
        rare: CONFIG.EMERGENT_EVENT_CHANCE_RARE,
        common: CONFIG.EMERGENT_EVENT_CHANCE_COMMON
    },
    RHYTHM_MODE: {
        amplitude: CONFIG.RHYTHM_MODE_AMPLITUDE,
        speed: CONFIG.RHYTHM_MODE_SPEED
    },
    MIX_PATTERN_CYCLE_TIME: CONFIG.MIX_PATTERN_CYCLE_TIME,
    CHAOS_AMPLITUDE_MULTIPLIER: CONFIG.CHAOS_AMPLITUDE_MULTIPLIER,
    CHAOS_SPEED_MULTIPLIER: CONFIG.CHAOS_SPEED_MULTIPLIER
};

// Activities mode state
export const ActivitiesState = {
    isActive: false,
    previousView: null
};

// Input handler mapping for activities views
const InputHandlers = {
    [VIEWS.PARTICLES]: {
        start: (x, y, yRatio) => { Particles.spawn(x, y); ContinuousSynth.start(VIEWS.PARTICLES, yRatio); },
        move: (x, y) => Particles.spawn(x, y)
    },
    [VIEWS.SORTING]: {
        start: (x, y) => Sorting.handleStart(x, y),
        move: (x, y) => Sorting.handleMove(x, y),
        end: () => Sorting.handleEnd()
    },
    [VIEWS.BUBBLES]: {
        start: (x, y) => Bubbles.handleStart(x, y)
    },
    [VIEWS.LIQUID]: {
        start: (x, y, yRatio) => { Liquid.handleStart(x, y); ContinuousSynth.start(VIEWS.LIQUID, yRatio); },
        move: (x, y) => Liquid.handleStart(x, y)
    },
    [VIEWS.MARBLES]: {
        start: (x, y) => Marbles.handleInput(x, y),
        move: (x, y) => Marbles.handleInput(x, y)
    }
};

// Ghost interaction handlers
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

// View init handlers
const ViewInitHandlers = {
    [VIEWS.SORTING]: () => Sorting.init(),
    [VIEWS.BUBBLES]: () => Bubbles.init(),
    [VIEWS.MARBLES]: () => Marbles.init()
};

// Activities views list
const ACTIVITIES_VIEWS = [
    VIEWS.PARTICLES,
    VIEWS.SORTING,
    VIEWS.BUBBLES,
    VIEWS.LIQUID,
    VIEWS.MARBLES
];

// Update handler mapping
const UpdateHandlers = {
    [VIEWS.PARTICLES]: () => Particles.update(),
    [VIEWS.SORTING]: () => Sorting.update(),
    [VIEWS.BUBBLES]: () => Bubbles.update(),
    [VIEWS.LIQUID]: () => Liquid.update(),
    [VIEWS.MARBLES]: () => Marbles.update()
};

// Helper function to get density multiplier
export function getDensityMultiplier() {
    return ACTIVITIES_CONFIG.DENSITY_MULTIPLIERS.rich;
}

// Activities Mode Controller
export const ActivitiesMode = {
    /**
     * Handle input for current activity
     */
    handleInput(e, type) {
        if (type === 'end') {
            ContinuousSynth.stop();
            const handler = InputHandlers[AppState.currentView];
            if (handler?.end) handler.end();
            return;
        }

        if (e.target.closest('.nav-btn') || e.target.closest('#header-area') || e.target.closest('.modal-overlay')) return;
        e.preventDefault();
        const t = e.touches ? e.touches[0] : e;
        const x = t.clientX; 
        const y = t.clientY;

        AppState.lastInteraction = Date.now();
        trackEngagement('user_interaction');
        
        const yRatio = y / DOM.canvas.height;
        const handler = InputHandlers[AppState.currentView];
        if (handler?.[type]) handler[type](x, y, yRatio);
    },

    /**
     * Switch to a different activity view
     */
    switchView(viewName) {
        // Guard: prevent story scenes in activities mode
        const storyScenes = [STORY_SCENES.FOREST, STORY_SCENES.BEACH, STORY_SCENES.MEADOW, STORY_SCENES.NIGHT, STORY_SCENES.LAKE];
        if (storyScenes.includes(viewName)) {
            console.warn('Cannot switch to story scenes in activities mode:', viewName);
            return;
        }
        
        const previousView = AppState.currentView;
        AppState.currentView = viewName;
        
        // Update nav bar
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        const btn = document.getElementById(`btn-${viewName}`);
        if (btn) btn.classList.add('active');
        
        AppState.entities = [];
        
        const initHandler = ViewInitHandlers[viewName];
        if (initHandler) initHandler();
        
        // Track activity switch
        if (AppState.isSessionRunning && previousView !== undefined) {
            trackActivitySwitch(viewName);
        } else if (AppState.isSessionRunning) {
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
    },

    /**
     * Switch to a random activity view
     */
    switchToRandomView() {
        let next = ACTIVITIES_VIEWS[Math.floor(Math.random() * ACTIVITIES_VIEWS.length)];
        while (next === AppState.currentView) {
            next = ACTIVITIES_VIEWS[Math.floor(Math.random() * ACTIVITIES_VIEWS.length)];
        }
        this.switchView(next);
        AppState.lastInteraction = Date.now() - CONFIG.GHOST_INTERACTION_TIME;
    },

    /**
     * Trigger simulated interaction for engagement
     */
    ghostInteraction() {
        const handler = GhostInteractionHandlers[AppState.currentView];
        if (handler) handler();
    },

    /**
     * Check for idle state and trigger interactions
     */
    checkIdle() {
        if (!AppState.isSessionRunning || AppState.isPaused) return;
        
        let idleTime = Date.now() - AppState.lastInteraction;
        if (idleTime > CONFIG.GHOST_INTERACTION_TIME && Math.random() < CONFIG.IDLE_INTERACTION_CHANCE) {
            this.ghostInteraction();
            trackEngagement('ghost_interaction');
        }
        
        // Auto-switch logic (always on)
        if (idleTime > CONFIG.IDLE_VIEW_SWITCH_TIME) {
            this.switchToRandomView();
            trackEngagement('auto_switch');
        }
    },

    /**
     * Update current activity (animation loop)
     */
    update() {
        if (AppState.isSessionRunning && !AppState.isPaused) {
            const updateHandler = UpdateHandlers[AppState.currentView];
            if (updateHandler) updateHandler();
        }
    },

    /**
     * Start an activities session
     */
    start() {
        ActivitiesState.isActive = true;
        
        // Hide activities start screen
        DOM.startScreenActivities.style.display = 'none';
        
        // Show nav bar
        DOM.navBarActivities.style.display = 'flex';
        setTimeout(() => DOM.navBarActivities.style.opacity = 1, 100);
        
        // Show timer for activities mode
        DOM.timerDisplay.style.display = 'block';
        
        // Resize canvas
        this.resizeCanvas();
        
        // Initialize random activity
        const randomView = ACTIVITIES_VIEWS[Math.floor(Math.random() * ACTIVITIES_VIEWS.length)];
        this.switchView(randomView);
        
        AppState.isSessionRunning = true;
        AppState.duration = AppState.sessionMinutes;
        AppState.soundType = AppState.currentSound;
        
        const sessionIdentifier = generateSessionIdentifier();
        AppState.sessionIdentifier = sessionIdentifier;
        if (DOM.sessionIdEl) {
            DOM.sessionIdEl.textContent = `Session ID: ${sessionIdentifier}`;
        }
        
        // Start timer
        Timer.start();
        
        // Note: Atmosphere audio is handled by AudioEngine.init() in app.js
        
        if (typeof trackSessionStart === 'function') {
            trackSessionStart(sessionIdentifier);
        }
    },

    /**
     * End the activities session
     */
    end() {
        ActivitiesState.isActive = false;
        AppState.isSessionRunning = false;
        AppState.entities = [];
        
        // Clear timer
        if (AppState.timerInterval) {
            clearInterval(AppState.timerInterval);
            AppState.timerInterval = null;
        }
        
        // Stop audio
        ContinuousSynth.stop();
        
        // Clear canvas
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Hide nav bar
        DOM.navBarActivities.style.display = 'none';
        DOM.navBarActivities.style.opacity = 0;
    },

    /**
     * Resize canvas and redraw if needed
     */
    resizeCanvas() {
        DOM.canvas.width = window.innerWidth; 
        DOM.canvas.height = window.innerHeight; 
    },

    /**
     * Handle window resize
     */
    handleResize() {
        this.resizeCanvas();
    }
};

// Make available globally for nav buttons
window.activitiesSwitchView = (viewName) => ActivitiesMode.switchView(viewName);

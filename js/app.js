// =========================================================================
// Main application logic
// =========================================================================

import { CONFIG, SOUND_TYPES, VIEWS } from './config.js';
import { AppState, AudioState, DOM, initDOM } from './state.js';
import { AudioEngine, ContinuousSynth, SFX } from './audio.js';
import { savePreferences, loadPreferences } from './storage.js';
import { Timer, IdleManager, ViewManager } from './systems.js';
import { Particles } from './views/particles.js';
import { Sorting } from './views/sorting.js';
import { Bubbles } from './views/bubbles.js';
import { Liquid } from './views/liquid.js';
import { Marbles } from './views/marbles.js';
import { initAdminMode, toggleAdminOverlay, adminForceSunset } from './admin.js';
import { trackSessionStart, trackSessionEnd, trackAtmosphereChange, trackDurationChange, trackSFXChange, trackParentSettingChange, trackActivitySwitch, trackAppUpdate, trackPageView, trackError, trackEngagement, setupEngagementTracking } from './analytics.js';

// =========================================================================
// PARENT MENU & SETTINGS
// =========================================================================

/** Parent menu state */
const ParentMenu = {
    tapCount: 0,
    tapResetTimer: null
};

/**
 * Initialize parent menu event listeners
 */
function initParentMenu() {
    DOM.titleEl.addEventListener('click', handleTitleTap);
}

/**
 * Handle title tap sequence to unlock parent menu
 */
function handleTitleTap() {
    clearTimeout(ParentMenu.tapResetTimer);
    ParentMenu.tapCount++;
    if (ParentMenu.tapCount >= 5) {
        DOM.settingsModal.style.display = 'block';
        ParentMenu.tapCount = 0;
    } else {
        ParentMenu.tapResetTimer = setTimeout(() => { ParentMenu.tapCount = 0; }, 500);
    }
}

/**
 * Update session duration and refresh UI
 * @param {number} mins - Duration in minutes
 */
function changeDuration(mins) {
    const oldDuration = AppState.sessionMinutes;
    AppState.sessionMinutes = mins;
    document.querySelectorAll('.time-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-time') == mins) b.classList.add('selected');
    });
    Timer.updateDisplay();
    saveAllPreferences();
    
    // Track duration change
    if (AppState.isSessionRunning) {
        trackDurationChange(oldDuration, mins);
        trackVirtualPageView('Settings Modal', {
            setting_type: 'duration_change',
            old_value: oldDuration,
            new_value: mins
        });
    }
}

/**
 * Update soundscape and regenerate audio if needed
 * @param {string} type - Sound type from SOUND_TYPES
 */
function changeSound(type) {
    const oldSound = AppState.currentSound;
    AppState.currentSound = type;
    document.querySelectorAll('.sound-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-sound') === type) b.classList.add('selected');
    });
    if (AppState.isSessionRunning && !AppState.isPaused && AudioState.context) {
        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        AudioEngine.generateSoundBuffer(type);
    }
    saveAllPreferences();
    
    // Track atmosphere change
    if (AppState.isSessionRunning || oldSound !== type) {
        trackAtmosphereChange(oldSound, type);
    }
}

/**
 * Toggle sound effects on/off
 * @param {string} val - 'on' or 'off'
 */
function setSFX(val) {
    AppState.sfxEnabled = (val === 'on');
    document.querySelectorAll('.sfx-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-sfx') === val) b.classList.add('selected');
    });
    saveAllPreferences();
    
    // Track SFX change
    trackSFXChange(AppState.sfxEnabled);
}

/**
 * Change behavior pattern
 * @param {string} pattern - 'chaos', 'rhythm', or 'mix'
 */
function changeBehaviorPattern(pattern) {
    const oldPattern = AppState.behaviorPattern;
    AppState.behaviorPattern = pattern;
    document.querySelectorAll('.pattern-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-pattern') === pattern) b.classList.add('selected');
    });
    saveAllPreferences();
    
    // Track parent setting change
    trackParentSettingChange('behavior_pattern', oldPattern || 'chaos', pattern);
}

/**
 * Change auto-switch mode
 * @param {string} mode - 'on', 'off', or 'long'
 */
function changeAutoSwitchMode(mode) {
    const oldMode = AppState.autoSwitchMode;
    AppState.autoSwitchMode = mode;
    document.querySelectorAll('.switch-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-switch') === mode) b.classList.add('selected');
    });
    saveAllPreferences();
    
    // Track parent setting change
    trackParentSettingChange('auto_switch_mode', oldMode || 'on', mode);
}

/**
 * Change visual density
 * @param {string} density - 'minimal', 'standard', or 'rich'
 */
function changeVisualDensity(density) {
    const oldDensity = AppState.visualDensity;
    AppState.visualDensity = density;
    document.querySelectorAll('.density-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-density') === density) b.classList.add('selected');
    });
    // Reinitialize current view to apply density change
    ViewManager.switchView(AppState.currentView);
    saveAllPreferences();
    
    // Track parent setting change
    trackParentSettingChange('visual_density', oldDensity || 'standard', density);
}

/**
 * Change emergent events setting
 * @param {string} events - 'off', 'rare', or 'common'
 */
function changeEmergentEvents(events) {
    const oldEvents = AppState.emergentEvents;
    AppState.emergentEvents = events;
    document.querySelectorAll('.emergent-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-emergent') === events) b.classList.add('selected');
    });
    saveAllPreferences();
    
    // Track parent setting change
    trackParentSettingChange('emergent_events', oldEvents || 'off', events);
}

/**
 * Save all current preferences to storage
 */
function saveAllPreferences() {
    savePreferences({
        duration: AppState.sessionMinutes,
        sound: AppState.currentSound,
        behaviorPattern: AppState.behaviorPattern,
        autoSwitchMode: AppState.autoSwitchMode,
        visualDensity: AppState.visualDensity,
        emergentEvents: AppState.emergentEvents
    });
}

/**
 * Toggle session pause/resume state
 */
function togglePause() {
    if (!AppState.isSessionRunning) return;
    AppState.isPaused = !AppState.isPaused;
    if (AppState.isPaused) {
        Timer.pause();
    } else {
        Timer.resume();
    }
}

/**
 * UI helper functions
 */
function closeSettings() { 
    DOM.settingsModal.style.display = 'none';
    trackVirtualPageView('Main Session');
}
function showQuitConfirm() { 
    DOM.settingsModal.style.display = 'none'; 
    DOM.confirmModal.style.display = 'block';
    trackVirtualPageView('Quit Confirmation');
}
function closeQuitConfirm() { 
    DOM.confirmModal.style.display = 'none'; 
    DOM.settingsModal.style.display = 'block';
    trackVirtualPageView('Settings Modal');
}
function performUpdate() { 
    trackAppUpdate();
    window.location.reload(); 
}

/**
 * Show advanced options modal from start screen
 */
function showAdvancedOptions() {
    DOM.advancedOptionsModal.style.display = 'block';
    trackVirtualPageView('Advanced Options');
}

/**
 * Show advanced options modal from settings (during session)
 */
function showAdvancedOptionsFromSettings() {
    DOM.settingsModal.style.display = 'none';
    DOM.advancedOptionsModal.style.display = 'block';
    trackVirtualPageView('Advanced Options');
}

/**
 * Close advanced options modal
 */
function closeAdvancedOptions() {
    DOM.advancedOptionsModal.style.display = 'none';
    // If we're in a session, show settings modal again
    if (AppState.isSessionRunning) {
        DOM.settingsModal.style.display = 'block';
        trackVirtualPageView('Settings Modal');
    } else {
        trackVirtualPageView('Start Screen');
    }
}

/** Reset application to start state */
function resetApp() {
    // Track session end before resetting
    if (AppState.isSessionRunning) {
        trackSessionEnd(false); // Session ended early
    }
    
    DOM.confirmModal.style.display = 'none';
    if (AudioState.context) AudioState.context.suspend();
    if (AudioState.noiseSource) try { AudioState.noiseSource.stop(); } catch (e) { }
    clearInterval(AppState.timerInterval);
    AppState.isSessionRunning = false; 
    AppState.isPaused = false; 
    AppState.elapsedSaved = 0;
    DOM.sunsetOverlay.style.opacity = 0;
    DOM.navBar.style.display = 'none'; 
    DOM.navBar.style.opacity = 0;
    DOM.startScreen.style.display = 'flex';
    DOM.pauseBtn.innerText = "Pause Session";
    DOM.pauseBtn.className = "action-btn pause-btn";
}

// =========================================================================
// INPUT HANDLING SYSTEM
// =========================================================================

/** View handler mapping for input dispatch */
const ViewInputHandlers = {
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

/** System for managing user input */
const InputManager = {
    /**
     * Initialize input event listeners
     */
    init() {
        DOM.canvas.addEventListener('mouseup', e => this.handleInput(e, 'end'));
        DOM.canvas.addEventListener('touchend', e => this.handleInput(e, 'end'));
        DOM.canvas.addEventListener('mouseleave', e => this.handleInput(e, 'end'));
        
        DOM.canvas.addEventListener('mousedown', e => this.handleInput(e, 'start'));
        DOM.canvas.addEventListener('touchstart', e => this.handleInput(e, 'start'), { passive: false });
        DOM.canvas.addEventListener('mousemove', e => this.handleInput(e, 'move'));
        DOM.canvas.addEventListener('touchmove', e => this.handleInput(e, 'move'), { passive: false });
        
        window.addEventListener('resize', this.resize);
    },

    /**
     * Handle input for the app
     */
    handleInput(e, type) {
        if (type === 'end') {
            ContinuousSynth.stop();
            const handler = ViewInputHandlers[AppState.currentView];
            if (handler?.end) handler.end();
            return;
        }

        if (e.target.closest('.nav-btn') || e.target.closest('#header-area') || e.target.closest('.modal-overlay')) return;
        e.preventDefault();
        const t = e.touches ? e.touches[0] : e;
        const x = t.clientX; const y = t.clientY;

        AppState.lastInteraction = Date.now();
        
        // Track user interaction as engagement
        if (AppState.isSessionRunning) {
            trackEngagement('user_interaction');
            if (typeof trackInteraction === 'function') {
                trackInteraction();
            }
        }
        
        const yRatio = y / DOM.canvas.height;

        const handler = ViewInputHandlers[AppState.currentView];
        if (handler?.[type]) handler[type](x, y, yRatio);
    },

    /**
     * Resize canvas to window dimensions
     */
    resize() { 
        DOM.canvas.width = window.innerWidth; 
        DOM.canvas.height = window.innerHeight; 
    }
};

// =========================================================================
// MAIN ANIMATION LOOP
// =========================================================================

/** View update mapping for animation dispatch */
const ViewUpdateHandlers = {
    [VIEWS.PARTICLES]: () => Particles.update(),
    [VIEWS.SORTING]: () => Sorting.update(),
    [VIEWS.BUBBLES]: () => Bubbles.update(),
    [VIEWS.LIQUID]: () => Liquid.update(),
    [VIEWS.MARBLES]: () => Marbles.update()
};

/**
 * Main render loop - updates current view
 */
function animate() {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        const updateHandler = ViewUpdateHandlers[AppState.currentView];
        if (updateHandler) updateHandler();
    }
    requestAnimationFrame(animate);
}

// =========================================================================
// Application initialization
// =========================================================================

/**
 * Initialize application
 */
function initApp() {
    // Initialize DOM references
    initDOM();

    // Initialize event listeners
    initParentMenu();
    initAdminMode();
    InputManager.init();

    // Load saved preferences or use defaults
    const savedPrefs = loadPreferences();
    const duration = savedPrefs?.duration ?? CONFIG.DEFAULT_SESSION_MINUTES;
    const sound = savedPrefs?.sound ?? SOUND_TYPES.DEEP;
    const behaviorPattern = savedPrefs?.behaviorPattern ?? CONFIG.DEFAULT_BEHAVIOR_PATTERN;
    const autoSwitchMode = savedPrefs?.autoSwitchMode ?? CONFIG.DEFAULT_AUTO_SWITCH_MODE;
    const visualDensity = savedPrefs?.visualDensity ?? CONFIG.DEFAULT_VISUAL_DENSITY;
    const emergentEvents = savedPrefs?.emergentEvents ?? CONFIG.DEFAULT_EMERGENT_EVENTS;
    
    changeDuration(duration);
    changeSound(sound);
    changeBehaviorPattern(behaviorPattern);
    changeAutoSwitchMode(autoSwitchMode);
    changeVisualDensity(visualDensity);
    changeEmergentEvents(emergentEvents);

    // Track initial page view
    trackPageView();
    
    // Setup engagement tracking
    setupEngagementTracking();

    // Begin button click handler
    DOM.beginBtn.addEventListener('click', function () {
        DOM.startScreen.style.display = 'none';
        DOM.navBar.style.display = 'flex';
        setTimeout(() => DOM.navBar.style.opacity = 1, 100);
        InputManager.resize();
        
        const views = Object.values(VIEWS);
        const randomView = views[Math.floor(Math.random() * views.length)];
        ViewManager.switchView(randomView);
        
        AppState.isSessionRunning = true;
        AppState.duration = AppState.sessionMinutes; // Set for analytics
        AppState.soundType = AppState.currentSound; // Set for analytics
        
        // Track session start
        trackSessionStart();
        
        AudioEngine.init();
        animate();
        Timer.start(true);
    });
}

// Make functions globally available for HTML inline handlers
window.switchView = ViewManager.switchView;
window.changeDuration = changeDuration;
window.changeSound = changeSound;
window.setSFX = setSFX;
window.changeBehaviorPattern = changeBehaviorPattern;
window.changeAutoSwitchMode = changeAutoSwitchMode;
window.changeVisualDensity = changeVisualDensity;
window.changeEmergentEvents = changeEmergentEvents;
window.togglePause = togglePause;
window.closeSettings = closeSettings;
window.showQuitConfirm = showQuitConfirm;
window.closeQuitConfirm = closeQuitConfirm;
window.resetApp = resetApp;
window.performUpdate = performUpdate;
window.showAdvancedOptions = showAdvancedOptions;
window.showAdvancedOptionsFromSettings = showAdvancedOptionsFromSettings;
window.closeAdvancedOptions = closeAdvancedOptions;

// Admin mode functions
window.toggleAdminOverlay = toggleAdminOverlay;
window.adminForceSunset = adminForceSunset;

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
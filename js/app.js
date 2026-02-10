// =========================================================================
// Main application logic
// =========================================================================

import { CONFIG, SOUND_TYPES, VIEWS } from './config.js';
import { AppState, AudioState, DOM, initDOM } from './state.js';
import { AudioEngine, ContinuousSynth, SFX } from './audio.js';
import { Timer, IdleManager, ViewManager } from './systems.js';
import { Particles } from './particles.js';
import { Sorting } from './sorting.js';
import { Bubbles } from './bubbles.js';
import { Liquid } from './liquid.js';
import { Marbles } from './marbles.js';
import { initAdminMode, toggleAdminOverlay, adminForceSunset } from './admin.js';

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
    AppState.sessionMinutes = mins;
    document.querySelectorAll('.time-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-time') == mins) b.classList.add('selected');
    });
    Timer.updateDisplay();
}

/**
 * Update soundscape and regenerate audio if needed
 * @param {string} type - Sound type from SOUND_TYPES
 */
function changeSound(type) {
    AppState.currentSound = type;
    document.querySelectorAll('.sound-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-sound') === type) b.classList.add('selected');
    });
    if (AppState.isSessionRunning && !AppState.isPaused && AudioState.context) {
        if (AudioState.context.state === 'suspended') AudioState.context.resume();
        AudioEngine.generateSoundBuffer(type);
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
function closeSettings() { DOM.settingsModal.style.display = 'none'; }
function showQuitConfirm() { DOM.settingsModal.style.display = 'none'; DOM.confirmModal.style.display = 'block'; }
function closeQuitConfirm() { DOM.confirmModal.style.display = 'none'; DOM.settingsModal.style.display = 'block'; }
function performUpdate() { window.location.reload(); }

/** Reset application to start state */
function resetApp() {
    DOM.confirmModal.style.display = 'none';
    if (AudioState.context) AudioState.context.suspend();
    if (AudioState.noiseSource) try { AudioState.noiseSource.stop(); } catch (e) { }
    clearInterval(AudioState.timerInterval);
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
     * Handle end of input (mouse up, touch end, etc)
     */
    handleInput(e, type) {
        if (type === 'end') {
            ContinuousSynth.stop();
            if (AppState.currentView === VIEWS.SORTING) Sorting.handleEnd();
            return;
        }

        if (e.target.closest('.nav-btn') || e.target.closest('#header-area') || e.target.closest('.modal-overlay')) return;
        e.preventDefault();
        const t = e.touches ? e.touches[0] : e;
        const x = t.clientX; const y = t.clientY;

        AppState.lastInteraction = Date.now();
        const yRatio = y / DOM.canvas.height;

        if (type === 'start') {
            this.handleStart(x, y, yRatio);
        } else if (type === 'move') {
            this.handleMove(x, y, yRatio);
        }
    },

    /**
     * Handle input start (mouse down, touch start)
     */
    handleStart(x, y, yRatio) {
        if (AppState.currentView === VIEWS.PARTICLES) { 
            Particles.spawn(x, y); 
            ContinuousSynth.start(VIEWS.PARTICLES, yRatio); 
        }
        if (AppState.currentView === VIEWS.SORTING) { 
            Sorting.handleStart(x, y); 
        }
        if (AppState.currentView === VIEWS.BUBBLES) { 
            Bubbles.handleStart(x, y); 
        }
        if (AppState.currentView === VIEWS.LIQUID) { 
            Liquid.spawn(x, y); 
            ContinuousSynth.start(VIEWS.LIQUID, yRatio); 
        }
        if (AppState.currentView === VIEWS.MARBLES) { 
            Marbles.handleInput(x, y); 
        }
    },

    /**
     * Handle input move (mouse move, touch move)
     */
    handleMove(x, y, yRatio) {
        ContinuousSynth.update(yRatio);
        if (AppState.currentView === VIEWS.PARTICLES) Particles.spawn(x, y);
        if (AppState.currentView === VIEWS.SORTING) Sorting.handleMove(x, y);
        if (AppState.currentView === VIEWS.LIQUID) Liquid.spawn(x, y);
        if (AppState.currentView === VIEWS.MARBLES) Marbles.handleInput(x, y);
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

/**
 * Main render loop - updates current view
 */
function animate() {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        if (AppState.currentView === VIEWS.PARTICLES) Particles.update();
        if (AppState.currentView === VIEWS.SORTING) Sorting.update();
        if (AppState.currentView === VIEWS.BUBBLES) Bubbles.update();
        if (AppState.currentView === VIEWS.LIQUID) Liquid.update();
        if (AppState.currentView === VIEWS.MARBLES) Marbles.update();
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
window.togglePause = togglePause;
window.closeSettings = closeSettings;
window.showQuitConfirm = showQuitConfirm;
window.closeQuitConfirm = closeQuitConfirm;
window.resetApp = resetApp;
window.performUpdate = performUpdate;

// Admin mode functions
window.toggleAdminOverlay = toggleAdminOverlay;
window.adminForceSunset = adminForceSunset;

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
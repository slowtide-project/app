// =========================================================================
// Global state management
// =========================================================================

/** Central application state object */
export const AppState = {
    sessionMinutes: 90,
    currentSound: 'deep',
    sfxEnabled: true,
    isPaused: false,
    isSessionRunning: false,
    currentView: 'particles',
    startTime: 0,
    elapsedSaved: 0,
    entities: [],
    lastInteraction: Date.now(),
    lastSFX: 0,
    timerInterval: null,
    // Parent-configurable settings
    behaviorPattern: 'chaos',
    autoSwitchMode: 'on',
    visualDensity: 'standard',
    emergentEvents: 'off',
    // Sensory dimmer settings
    sensoryDimmerMode: 'auto',
    currentEngagementPhase: 'high',
    phaseStartTime: 0,
    // Session tracking
    sessionIdentifier: null,
    // Maths challenge state
    mathsChallenge: {
        currentQuestion: null,
        correctAnswer: null,
        isActive: false
    }
};

/** Audio system state variables */
export const AudioState = {
    context: null,
    gainNode: null,
    waveLFO: null,
    noiseSource: null,
    activeSynth: null,
    activeSynthGain: null
};

/** Cached DOM element references */
export const DOM = {
    titleEl: null,
    settingsModal: null,
    confirmModal: null,
    updateModal: null,
    instructionsModal: null,
    advancedOptionsModal: null,
    adminOverlay: null,
    startScreen: null,
    timerDisplay: null,
    sessionIdEl: null,
    pauseBtn: null,
    navBar: null,
    canvas: null,
    sunsetOverlay: null,
    beginBtn: null,
    mathsChallengeModal: null,
    mathsQuestionEl: null,
    ctx: null
};

/** Initialize DOM references */
export function initDOM() {
    DOM.titleEl = document.getElementById('app-title');
    DOM.settingsModal = document.getElementById('settings-modal');
    DOM.confirmModal = document.getElementById('confirm-modal');
    DOM.updateModal = document.getElementById('update-modal');
    DOM.instructionsModal = document.getElementById('instructions-modal');
    DOM.advancedOptionsModal = document.getElementById('advanced-options-modal');
    DOM.adminOverlay = document.getElementById('admin-overlay');
    DOM.startScreen = document.getElementById('start-screen');
    DOM.timerDisplay = document.getElementById('timer-display');
    DOM.sessionIdEl = document.getElementById('session-id');
    DOM.pauseBtn = document.getElementById('pause-btn');
    DOM.navBar = document.getElementById('nav-bar');
    DOM.canvas = document.getElementById('main-canvas');
    DOM.sunsetOverlay = document.getElementById('sunset-overlay');
    DOM.beginBtn = document.getElementById('begin-btn');
    DOM.mathsChallengeModal = document.getElementById('maths-challenge-modal');
    DOM.mathsQuestionEl = document.getElementById('maths-question');
    DOM.ctx = DOM.canvas.getContext('2d');
}
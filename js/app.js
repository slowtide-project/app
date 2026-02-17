// =========================================================================
// Main application logic - delegates to mode files
// =========================================================================

import { CONFIG, SOUND_TYPES, VIEWS, APP_VERSION } from './config.js';
import { AppState, AudioState, DOM, initDOM } from './state.js';
import { AudioEngine, ContinuousSynth } from './audio.js';
import { savePreferences, loadPreferences } from './storage.js';
import { ModeManager } from './modes/manager.js';
import { Timer } from './systems.js';
import { initAdminMode, toggleAdminOverlay, adminSwitchScene } from './admin.js';
import { generateMathsQuestion } from './utils.js';
import { trackPageView, trackVirtualPageView, trackError, trackDurationChange, trackAtmosphereChange, trackSFXChange } from './analytics.js';

// =========================================================================
// PARENT MENU & SETTINGS
// =========================================================================

const ParentMenu = {
    tapCount: 0,
    tapResetTimer: null
};

function initParentMenu() {
    DOM.titleEl.addEventListener('click', handleTitleTap);
}

function handleTitleTap() {
    clearTimeout(ParentMenu.tapResetTimer);
    ParentMenu.tapCount++;
    if (ParentMenu.tapCount >= 5) {
        showMathsChallenge();
        ParentMenu.tapCount = 0;
    } else {
        ParentMenu.tapResetTimer = setTimeout(() => { ParentMenu.tapCount = 0; }, 500);
    }
}

// =========================================================================
// MATHS CHALLENGE SYSTEM
// =========================================================================

function showMathsChallenge() {
    const questionData = generateMathsQuestion();
    AppState.mathsChallenge.currentQuestion = questionData.question;
    AppState.mathsChallenge.correctAnswer = questionData.answer;
    AppState.mathsChallenge.isActive = true;
    
    DOM.mathsQuestionEl.textContent = questionData.question;
    DOM.mathsChallengeModal.style.display = 'block';
}

function checkMathsAnswer(answer) {
    if (!AppState.mathsChallenge.isActive) return;
    
    if (answer === AppState.mathsChallenge.correctAnswer) {
        closeMathsChallenge();
        DOM.settingsModal.style.display = 'block';
    } else {
        DOM.mathsChallengeModal.style.animation = 'shake 0.3s';
        setTimeout(() => {
            DOM.mathsChallengeModal.style.animation = '';
        }, 300);
        
        const questionData = generateMathsQuestion();
        AppState.mathsChallenge.currentQuestion = questionData.question;
        AppState.mathsChallenge.correctAnswer = questionData.answer;
        DOM.mathsQuestionEl.textContent = questionData.question;
    }
}

function closeMathsChallenge() {
    AppState.mathsChallenge.isActive = false;
    AppState.mathsChallenge.currentQuestion = null;
    AppState.mathsChallenge.correctAnswer = null;
    DOM.mathsChallengeModal.style.display = 'none';
}

// =========================================================================
// SETTINGS & PREFERENCES
// =========================================================================

function changeDuration(mins) {
    const oldDuration = AppState.sessionMinutes;
    AppState.sessionMinutes = mins;
    document.querySelectorAll('.time-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-time') == mins) b.classList.add('selected');
    });
    Timer.updateDisplay();
    saveAllPreferences();
    
    if (AppState.isSessionRunning) {
        trackDurationChange(oldDuration, mins);
    }
}

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
    
    if (AppState.isSessionRunning || oldSound !== type) {
        trackAtmosphereChange(oldSound, type);
    }
}

function setSFX(val) {
    AppState.sfxEnabled = (val === 'on');
    document.querySelectorAll('.sfx-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-sfx') === val) b.classList.add('selected');
    });
    saveAllPreferences();
    trackSFXChange(AppState.sfxEnabled);
}

function saveAllPreferences() {
    savePreferences({
        duration: AppState.sessionMinutes,
        sound: AppState.currentSound
    });
}

// =========================================================================
// UI HELPERS
// =========================================================================

function togglePause() {
    if (!AppState.isSessionRunning) return;
    AppState.isPaused = !AppState.isPaused;
    if (AppState.isPaused) {
        Timer.pause();
    } else {
        Timer.resume();
    }
}

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
    if ('caches' in window) {
        caches.keys().then(function(names) {
            names.forEach(function(name) {
                caches.delete(name);
            });
        });
    }
    
    const timestamp = new Date().getTime();
    window.location.href = window.location.origin + window.location.pathname + '?v=' + timestamp;
}

// =========================================================================
// INPUT HANDLING - delegates to current mode
// =========================================================================

function handleInput(e, type) {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        ModeManager.handleInput(e, type);
    }
}

// =========================================================================
// MAIN ANIMATION LOOP - delegates to current mode
// =========================================================================

function animate(timestamp) {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        ModeManager.update();
    }
    requestAnimationFrame(animate);
}

// =========================================================================
// APP SELECTION
// =========================================================================

function selectApp(appType) {
    DOM.appSelectionScreen.style.display = 'none';
    
    if (appType === 'activities') {
        DOM.startScreenActivities.style.display = 'flex';
        trackVirtualPageView('/activities-setup');
    } else if (appType === 'story') {
        DOM.startScreenStory.style.display = 'flex';
        trackVirtualPageView('/story-setup');
    }
}

function backToAppSelection() {
    // Clean up any running session before going back
    ModeManager.end();
    ContinuousSynth.stop();
    
    // Clear canvas
    if (DOM.ctx) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    }
    
    // Reset UI elements
    DOM.navBarActivities.style.display = 'none';
    DOM.navBarActivities.style.opacity = 0;
    DOM.navBarStory.style.display = 'none';
    DOM.navBarStory.style.opacity = 0;
    DOM.timerDisplay.style.display = 'none';
    
    AppState.currentView = null;
    
    // Show selection screen
    DOM.startScreenActivities.style.display = 'none';
    DOM.startScreenStory.style.display = 'none';
    DOM.appSelectionScreen.style.display = 'flex';
    
    trackVirtualPageView('/app-selection');
}

// =========================================================================
// APPLICATION INITIALIZATION
// =========================================================================

function initApp() {
    console.log('initApp starting...');
    try {
        console.log('Running initDOM...');
        initDOM();
        console.log('initDOM complete');
        
        // Set version indicators
        document.getElementById('start-screen-version').textContent = APP_VERSION;
        
        console.log('Running initParentMenu...');
        initParentMenu();
        console.log('initParentMenu complete');
        console.log('Running initAdminMode...');
        initAdminMode();
        console.log('initAdminMode complete');
        console.log('Running setupInputListeners...');
        setupInputListeners();
        console.log('setupInputListeners complete');
    } catch (error) {
        console.error('App initialization error:', error);
        if (typeof trackError === 'function') {
            trackError(error, 'app_initialization');
        }
        return;
    }

    console.log('Loading preferences...');
    const savedPrefs = loadPreferences();
    const duration = savedPrefs?.duration ?? CONFIG.DEFAULT_SESSION_MINUTES;
    const sound = savedPrefs?.sound ?? SOUND_TYPES.DEEP;
    
    changeDuration(duration);
    changeSound(sound);

    console.log('Preferences loaded');
    trackPageView();
    console.log('Setting up event listeners...');
    setupEventListeners();
    console.log('initApp complete');
}

function setupInputListeners() {
    DOM.canvas.addEventListener('mouseup', e => handleInput(e, 'end'));
    DOM.canvas.addEventListener('touchend', e => handleInput(e, 'end'));
    DOM.canvas.addEventListener('mouseleave', e => handleInput(e, 'end'));
    
    DOM.canvas.addEventListener('mousedown', e => handleInput(e, 'start'));
    DOM.canvas.addEventListener('touchstart', e => handleInput(e, 'start'), { passive: false });
    DOM.canvas.addEventListener('mousemove', e => handleInput(e, 'move'));
    DOM.canvas.addEventListener('touchmove', e => handleInput(e, 'move'), { passive: false });
    
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    ModeManager.handleResize();
}

function setupEventListeners() {
    console.log('Setting up beginActivitiesBtn listener...');
    DOM.beginActivitiesBtn.addEventListener('click', function () {
        console.log('beginActivitiesBtn clicked!');
        try {
            // Clean up any existing mode before starting
            ModeManager.end();
            ContinuousSynth.stop();
            
            console.log('Calling AudioEngine.init()...');
            AudioEngine.init();
            console.log('Calling ModeManager.start("activities")...');
            ModeManager.start('activities');
            console.log('Calling animate()...');
            animate();
            console.log('Activities mode started successfully!');
        } catch (error) {
            console.error('Begin activities error:', error);
            trackError(error, 'begin_activities');
        }
    });

    console.log('Setting up beginStoryBtn listener...');
    DOM.beginStoryBtn.addEventListener('click', function () {
        console.log('beginStoryBtn clicked!');
        try {
            // Clean up any existing mode before starting
            ModeManager.end();
            ContinuousSynth.stop();
            
            console.log('Calling ModeManager.start("story")...');
            ModeManager.start('story');
            console.log('Calling animate()...');
            animate();
            console.log('Story mode started successfully!');
        } catch (error) {
            console.error('Begin story error:', error);
            trackError(error, 'begin_story');
        }
    });
}

// =========================================================================
// GLOBAL EXPORTS
// =========================================================================

function resetApp() {
    ModeManager.end();
    ContinuousSynth.stop();
    
    if (AudioState.noiseSource) {
        try { AudioState.noiseSource.stop(); } catch (e) { }
        AudioState.noiseSource = null;
    }
    if (AudioState.waveLFO) {
        try { AudioState.waveLFO.stop(); } catch (e) { }
        AudioState.waveLFO = null;
    }
    
    if (DOM.ctx) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    }
    
    DOM.settingsModal.style.display = 'none';
    DOM.confirmModal.style.display = 'none';
    DOM.navBarActivities.style.display = 'none';
    DOM.navBarActivities.style.opacity = 0;
    DOM.navBarStory.style.display = 'none';
    DOM.navBarStory.style.opacity = 0;
    DOM.timerDisplay.style.display = 'none';
    
    AppState.isSessionRunning = false;
    AppState.isPaused = false;
    AppState.currentView = null;
    AppState.entities = [];
    
    if (AppState.timerInterval) {
        clearInterval(AppState.timerInterval);
        AppState.timerInterval = null;
    }
    
    DOM.startScreenActivities.style.display = 'none';
    DOM.startScreenStory.style.display = 'none';
    DOM.appSelectionScreen.style.display = 'flex';
    
    trackVirtualPageView('/app-selection');
}

window.switchView = (viewName) => ModeManager.switchView(viewName);
window.changeDuration = changeDuration;
window.changeSound = changeSound;
window.setSFX = setSFX;
window.togglePause = togglePause;
window.closeSettings = closeSettings;
window.showQuitConfirm = showQuitConfirm;
window.closeQuitConfirm = closeQuitConfirm;
window.resetApp = resetApp;
window.performUpdate = performUpdate;

window.checkMathsAnswer = checkMathsAnswer;
window.closeMathsChallenge = closeMathsChallenge;

window.toggleAdminOverlay = toggleAdminOverlay;
window.adminSwitchScene = adminSwitchScene;

window.selectApp = selectApp;
window.backToAppSelection = backToAppSelection;

document.addEventListener('DOMContentLoaded', initApp);

// =========================================================================
// Main application logic - delegates to mode files
// =========================================================================

import { CONFIG, SOUND_TYPES, VIEWS } from './config.js';
import { AppState, AudioState, DOM, initDOM } from './state.js';
import { AudioEngine, ContinuousSynth } from './audio.js';
import { savePreferences, loadPreferences } from './storage.js';
import { Timer, setCurrentMode } from './systems.js';
import { SensoryDimmer } from './sensory-dimmer.js';
import { initAdminMode, toggleAdminOverlay, adminForceSunset, adminSwitchScene } from './admin.js';
import { generateMathsQuestion } from './utils.js';
import { trackPageView, trackVirtualPageView, trackError, trackDurationChange, trackAtmosphereChange, trackSFXChange, trackParentSettingChange } from './analytics.js';

import { ActivitiesMode } from './modes/activities.js';
import { StoryMode } from './modes/story.js';

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

function changeBehaviorPattern(pattern) {
    const oldPattern = AppState.behaviorPattern;
    AppState.behaviorPattern = pattern;
    document.querySelectorAll('.pattern-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-pattern') === pattern) b.classList.add('selected');
    });
    saveAllPreferences();
    trackParentSettingChange('behavior_pattern', oldPattern || 'chaos', pattern);
}

function changeAutoSwitchMode(mode) {
    const oldMode = AppState.autoSwitchMode;
    AppState.autoSwitchMode = mode;
    document.querySelectorAll('.switch-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-switch') === mode) b.classList.add('selected');
    });
    saveAllPreferences();
    trackParentSettingChange('auto_switch_mode', oldMode || 'on', mode);
}

function changeVisualDensity(density) {
    const oldDensity = AppState.visualDensity;
    AppState.visualDensity = density;
    document.querySelectorAll('.density-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-density') === density) b.classList.add('selected');
    });
    ActivitiesMode.switchView(AppState.currentView);
    saveAllPreferences();
    trackParentSettingChange('visual_density', oldDensity || 'standard', density);
}

function changeEmergentEvents(events) {
    const oldEvents = AppState.emergentEvents;
    AppState.emergentEvents = events;
    document.querySelectorAll('.emergent-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-emergent') === events) b.classList.add('selected');
    });
    saveAllPreferences();
    trackParentSettingChange('emergent_events', oldEvents || 'off', events);
}

function changeSensoryDimmerMode(mode) {
    const oldMode = AppState.sensoryDimmerMode;
    AppState.sensoryDimmerMode = mode;
    document.querySelectorAll('.dimmer-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-dimmer') === mode) b.classList.add('selected');
    });
    saveAllPreferences();
    trackParentSettingChange('sensory_dimmer_mode', oldMode || 'auto', mode);
}

function saveAllPreferences() {
    savePreferences({
        duration: AppState.sessionMinutes,
        sound: AppState.currentSound,
        behaviorPattern: AppState.behaviorPattern,
        autoSwitchMode: AppState.autoSwitchMode,
        visualDensity: AppState.visualDensity,
        emergentEvents: AppState.emergentEvents,
        sensoryDimmerMode: AppState.sensoryDimmerMode
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

function showAdvancedOptions() {
    DOM.advancedOptionsModal.style.display = 'block';
    trackVirtualPageView('Advanced Options');
}

function showAdvancedOptionsFromSettings() {
    DOM.settingsModal.style.display = 'none';
    DOM.advancedOptionsModal.style.display = 'block';
    trackVirtualPageView('Advanced Options');
}

function closeAdvancedOptions() {
    DOM.advancedOptionsModal.style.display = 'none';
    if (AppState.isSessionRunning) {
        DOM.settingsModal.style.display = 'block';
        trackVirtualPageView('Settings Modal');
    } else {
        trackVirtualPageView('Start Screen');
    }
}

function resetApp() {
    DOM.confirmModal.style.display = 'none';
    
    // Stop all audio
    ContinuousSynth.stop();
    if (AudioState.context) AudioState.context.suspend();
    if (AudioState.noiseSource) try { AudioState.noiseSource.stop(); } catch (e) { }
    
    // Clear timer
    clearInterval(AppState.timerInterval);
    
    // End both modes (cleanup)
    if (ActivitiesMode) ActivitiesMode.end();
    if (StoryMode) StoryMode.end();
    
    // Reset all state
    AppState.isSessionRunning = false; 
    AppState.isPaused = false; 
    AppState.elapsedSaved = 0;
    AppState.entities = [];
    AppState.currentView = null;
    
    // Reset UI elements
    DOM.sunsetOverlay.style.opacity = 0;
    DOM.navBar.style.display = 'none'; 
    DOM.navBar.style.opacity = 0;
    DOM.timerDisplay.style.display = 'none';
    
    // Clear canvas
    if (DOM.ctx) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    }
    
    // Hide all screens
    DOM.startScreenActivities.style.display = 'none';
    DOM.startScreenStory.style.display = 'none';
    DOM.appSelectionScreen.style.display = 'flex';
    
    // Reset mode
    currentMode = null;
    setCurrentMode(null);
    
    DOM.pauseBtn.innerText = "Pause Session";
    DOM.pauseBtn.className = "action-btn pause-btn";
}

// =========================================================================
// INPUT HANDLING - delegates to current mode
// =========================================================================

function handleInput(e, type) {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        if (ActivitiesMode) {
            ActivitiesMode.handleInput(e, type);
        }
    }
}

// =========================================================================
// MAIN ANIMATION LOOP - delegates to current mode
// =========================================================================

let lastIdleCheck = 0;
let currentMode = null;

function animate(timestamp) {
    if (AppState.isSessionRunning && !AppState.isPaused) {
        // Only run activities when in activities mode
        if (currentMode === 'activities' && ActivitiesMode) {
            ActivitiesMode.update();
            // Check idle once per second
            if (timestamp - lastIdleCheck > 1000) {
                ActivitiesMode.checkIdle();
                lastIdleCheck = timestamp;
            }
        }
        // Only run story when in story mode
        if (currentMode === 'story' && StoryMode) {
            StoryMode.update();
        }
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
    if (ActivitiesMode) ActivitiesMode.end();
    if (StoryMode) StoryMode.end();
    ContinuousSynth.stop();
    
    // Clear canvas
    if (DOM.ctx) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    }
    
    // Reset UI elements
    DOM.navBar.style.display = 'none';
    DOM.navBar.style.opacity = 0;
    DOM.timerDisplay.style.display = 'none';
    DOM.sunsetOverlay.style.opacity = 0;
    
    // Reset mode
    currentMode = null;
    setCurrentMode(null);
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
    const behaviorPattern = savedPrefs?.behaviorPattern ?? CONFIG.DEFAULT_BEHAVIOR_PATTERN;
    const autoSwitchMode = savedPrefs?.autoSwitchMode ?? CONFIG.DEFAULT_AUTO_SWITCH_MODE;
    const visualDensity = savedPrefs?.visualDensity ?? CONFIG.DEFAULT_VISUAL_DENSITY;
    const emergentEvents = savedPrefs?.emergentEvents ?? CONFIG.DEFAULT_EMERGENT_EVENTS;
    const sensoryDimmerMode = savedPrefs?.sensoryDimmerMode ?? CONFIG.DEFAULT_SENSORY_DIMMER_MODE;
    
    changeDuration(duration);
    changeSound(sound);
    changeBehaviorPattern(behaviorPattern);
    changeAutoSwitchMode(autoSwitchMode);
    changeVisualDensity(visualDensity);
    changeEmergentEvents(emergentEvents);
    changeSensoryDimmerMode(sensoryDimmerMode);

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
    if (ActivitiesMode) ActivitiesMode.handleResize();
    if (StoryMode) StoryMode.handleResize();
}

function setupEventListeners() {
    console.log('Setting up beginActivitiesBtn listener...');
    DOM.beginActivitiesBtn.addEventListener('click', function () {
        console.log('beginActivitiesBtn clicked!');
        try {
            // Clean up any existing mode before starting
            if (StoryMode) StoryMode.end();
            ContinuousSynth.stop();
            
            console.log('Calling AudioEngine.init()...');
            AudioEngine.init();
            console.log('Calling setCurrentMode("activities")...');
            setCurrentMode('activities');
            currentMode = 'activities';
            console.log('Calling animate()...');
            animate();
            console.log('Calling ActivitiesMode.start()...');
            ActivitiesMode.start();
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
            if (ActivitiesMode) ActivitiesMode.end();
            ContinuousSynth.stop();
            
            // No audio for story mode (will be added later)
            console.log('Calling setCurrentMode("story")...');
            setCurrentMode('story');
            currentMode = 'story';
            console.log('Calling animate()...');
            animate();
            console.log('Calling StoryMode.start()...');
            StoryMode.start();
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

window.switchView = ActivitiesMode ? ActivitiesMode.switchView : () => {};
window.changeDuration = changeDuration;
window.changeSound = changeSound;
window.setSFX = setSFX;
window.changeBehaviorPattern = changeBehaviorPattern;
window.changeAutoSwitchMode = changeAutoSwitchMode;
window.changeVisualDensity = changeVisualDensity;
window.changeEmergentEvents = changeEmergentEvents;
window.changeSensoryDimmerMode = changeSensoryDimmerMode;
window.SensoryDimmer = SensoryDimmer;
window.togglePause = togglePause;
window.closeSettings = closeSettings;
window.showQuitConfirm = showQuitConfirm;
window.closeQuitConfirm = closeQuitConfirm;
window.resetApp = resetApp;
window.performUpdate = performUpdate;
window.showAdvancedOptions = showAdvancedOptions;
window.showAdvancedOptionsFromSettings = showAdvancedOptionsFromSettings;
window.closeAdvancedOptions = closeAdvancedOptions;

window.checkMathsAnswer = checkMathsAnswer;
window.closeMathsChallenge = closeMathsChallenge;

window.toggleAdminOverlay = toggleAdminOverlay;
window.adminForceSunset = adminForceSunset;
window.adminSwitchScene = adminSwitchScene;

window.selectApp = selectApp;
window.backToAppSelection = backToAppSelection;

document.addEventListener('DOMContentLoaded', initApp);

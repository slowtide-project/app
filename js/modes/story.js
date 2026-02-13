// =========================================================================
// Story Mode - Calming static scenes, no timer, no sensory dimmer
// =========================================================================

import { AppState, DOM } from '../state.js';
import { CONFIG, VIEWS, STORY_SCENES } from '../config.js';
import { trackSessionStart, trackVirtualPageView, generateSessionIdentifier } from '../analytics.js';
import { Forest } from '../views/story/forest.js';
import { Beach } from '../views/story/beach.js';
import { Meadow } from '../views/story/meadow.js';
import { Night } from '../views/story/night.js';
import { Lake } from '../views/story/lake.js';

// Story mode state
export const StoryState = {
    isActive: false
};

// Story scenes - use from config
const ALL_SCENES = [
    STORY_SCENES.FOREST,
    STORY_SCENES.BEACH,
    STORY_SCENES.MEADOW,
    STORY_SCENES.NIGHT,
    STORY_SCENES.LAKE
];

// Scene view init handlers
const SceneInitHandlers = {
    [STORY_SCENES.FOREST]: () => Forest.init(),
    [STORY_SCENES.BEACH]: () => Beach.init(),
    [STORY_SCENES.MEADOW]: () => Meadow.init(),
    [STORY_SCENES.NIGHT]: () => Night.init(),
    [STORY_SCENES.LAKE]: () => Lake.init()
};

// Scene titles for tracking
const SCENE_TITLES = {
    [STORY_SCENES.FOREST]: 'Forest Scene',
    [STORY_SCENES.BEACH]: 'Beach Scene',
    [STORY_SCENES.MEADOW]: 'Meadow Scene',
    [STORY_SCENES.NIGHT]: 'Night Scene',
    [STORY_SCENES.LAKE]: 'Lake Scene'
};

// Story Mode Controller
export const StoryMode = {
    isActive: false,

    /**
     * Handle input - story scenes are static, no interaction
     */
    handleInput(e, type) {
        // No interaction in story mode - scenes are static
    },

    /**
     * Switch to a different scene
     */
    switchScene(sceneName) {
        // Guard: prevent activity views in story mode
        const activityViews = [VIEWS.PARTICLES, VIEWS.SORTING, VIEWS.BUBBLES, VIEWS.LIQUID, VIEWS.MARBLES];
        if (activityViews.includes(sceneName)) {
            console.warn('Cannot switch to activity views in story mode:', sceneName);
            return;
        }
        
        AppState.currentView = sceneName;
        AppState.entities = [];
        
        // Update nav button active state
        document.querySelectorAll('#nav-bar-story .nav-btn').forEach(el => el.classList.remove('active'));
        const btn = document.getElementById(`btn-${sceneName}`);
        if (btn) btn.classList.add('active');
        
        const initHandler = SceneInitHandlers[sceneName];
        if (initHandler) initHandler();
        
        // Track scene change
        if (AppState.isSessionRunning) {
            const sceneTitle = SCENE_TITLES[sceneName] || sceneName;
            trackVirtualPageView(sceneTitle, {
                scene_name: sceneName,
                transition_type: 'nav_switch'
            });
        }
    },

    /**
     * Get next scene in order (for admin cycling)
     */
    getNextScene() {
        const currentIndex = ALL_SCENES.indexOf(AppState.currentView);
        const nextIndex = (currentIndex + 1) % ALL_SCENES.length;
        return ALL_SCENES[nextIndex];
    },

    /**
     * Get previous scene in order (for admin cycling)
     */
    getPreviousScene() {
        const currentIndex = ALL_SCENES.indexOf(AppState.currentView);
        const prevIndex = (currentIndex - 1 + ALL_SCENES.length) % ALL_SCENES.length;
        return ALL_SCENES[prevIndex];
    },

    /**
     * Update - story scenes are static, no updates needed
     */
    update() {
        // Static scenes - no animation loop updates needed
    },

    /**
     * Start a story session
     */
    start() {
        this.isActive = true;
        StoryState.isActive = true;
        
        // Hide story start screen
        DOM.startScreenStory.style.display = 'none';
        
        // Hide timer for story mode
        DOM.timerDisplay.style.display = 'none';
        
        // Show story nav bar
        DOM.navBarStory.style.display = 'flex';
        setTimeout(() => DOM.navBarStory.style.opacity = 1, 100);
        
        // Resize canvas
        this.resizeCanvas();
        
        // Start with forest scene
        this.switchScene(STORY_SCENES.FOREST);
        
        AppState.isSessionRunning = true;
        AppState.duration = AppState.sessionMinutes;
        AppState.soundType = 'forest';
        
        const sessionIdentifier = generateSessionIdentifier();
        AppState.sessionIdentifier = sessionIdentifier;
        if (DOM.sessionIdEl) {
            DOM.sessionIdEl.textContent = `Session ID: ${sessionIdentifier}`;
        }
        
        // No timer for story mode
        
        // Track session start
        if (typeof trackSessionStart === 'function') {
            trackSessionStart(sessionIdentifier);
        }
    },

    /**
     * End the story session
     */
    end() {
        this.isActive = false;
        StoryState.isActive = false;
        AppState.isSessionRunning = false;
        AppState.entities = [];
        
        // Clear canvas
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Hide timer (though it's already hidden for story)
        DOM.timerDisplay.style.display = 'none';
        
        // Hide story nav bar
        DOM.navBarStory.style.display = 'none';
        DOM.navBarStory.style.opacity = 0;
    },

    /**
     * Resize canvas and redraw
     */
    resizeCanvas() {
        DOM.canvas.width = window.innerWidth; 
        DOM.canvas.height = window.innerHeight; 
        
        // Redraw current scene after resize
        this.redrawCurrentScene();
    },

    /**
     * Redraw current scene (after resize)
     */
    redrawCurrentScene() {
        if (AppState.currentView === STORY_SCENES.FOREST) Forest.redraw();
        else if (AppState.currentView === STORY_SCENES.BEACH) Beach.redraw();
        else if (AppState.currentView === STORY_SCENES.MEADOW) Meadow.redraw();
        else if (AppState.currentView === STORY_SCENES.NIGHT) Night.redraw();
        else if (AppState.currentView === STORY_SCENES.LAKE) Lake.redraw();
    },

    /**
     * Handle window resize
     */
    handleResize() {
        this.resizeCanvas();
    }
};

// Admin scene switching function
window.storySwitchScene = (sceneName) => StoryMode.switchScene(sceneName);

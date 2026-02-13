// =========================================================================
// Mode Manager - Centralized mode routing
// =========================================================================

import { ActivitiesMode } from './activities.js';
import { StoryMode } from './story.js';

let currentMode = null;

export const ModeManager = {
    /**
     * Get current mode
     * @returns {string|null} 'activities', 'story', or null
     */
    getMode() {
        return currentMode;
    },

    /**
     * Set current mode (internal use - prefer start/end)
     * @param {string} mode - 'activities', 'story', or null
     */
    setMode(mode) {
        currentMode = mode;
    },

    /**
     * Handle user input - routes to appropriate mode
     * @param {Event} e - Input event
     * @param {string} type - 'start', 'move', 'end'
     */
    handleInput(e, type) {
        if (currentMode === 'activities') {
            ActivitiesMode.handleInput(e, type);
        }
        // Story mode has no interaction (static scenes)
    },

    /**
     * Update current mode (animation loop)
     */
    update() {
        if (currentMode === 'activities') {
            ActivitiesMode.update();
            ActivitiesMode.checkIdle();
        }
        // Story mode has no animation loop - scenes are static
    },

    /**
     * Switch to a different view/scene
     * @param {string} viewName - View or scene name
     */
    switchView(viewName) {
        if (currentMode === 'activities') {
            ActivitiesMode.switchView(viewName);
        } else if (currentMode === 'story') {
            StoryMode.switchScene(viewName);
        }
    },

    /**
     * Start a mode session
     * @param {string} mode - 'activities' or 'story'
     */
    start(mode) {
        this.setMode(mode);
        if (mode === 'activities') {
            ActivitiesMode.start();
        } else if (mode === 'story') {
            StoryMode.start();
        }
    },

    /**
     * End current mode session
     */
    end() {
        if (currentMode === 'activities') {
            ActivitiesMode.end();
        } else if (currentMode === 'story') {
            StoryMode.end();
        }
        this.setMode(null);
    },

    /**
     * Handle window resize - routes to appropriate mode
     */
    handleResize() {
        if (currentMode === 'activities') {
            ActivitiesMode.handleResize();
        } else if (currentMode === 'story') {
            StoryMode.handleResize();
        }
    }
};

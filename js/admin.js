// =========================================================================
// Admin mode functionality
// =========================================================================

import { AppState, AudioState, DOM } from './state.js';
import { VIEWS } from './config.js';
import { StoryMode } from './modes/story.js';
import { getCurrentMode } from './systems.js';

/** Admin mode state */
const AdminMode = {
    updateInterval: null
};

/**
 * Initialize keyboard shortcut listener for admin mode
 */
export function initAdminMode() {
    document.addEventListener('keydown', handleAdminKey);
}

/**
 * Handle keyboard shortcut (Ctrl+Shift+D) to toggle admin overlay
 */
function handleAdminKey(e) {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleAdminOverlay();
    }
}

/**
 * Toggle admin overlay visibility
 */
export function toggleAdminOverlay() {
    const isVisible = DOM.adminOverlay.style.display === 'block';
    if (isVisible) {
        DOM.adminOverlay.style.display = 'none';
        if (AdminMode.updateInterval) {
            clearInterval(AdminMode.updateInterval);
            AdminMode.updateInterval = null;
        }
    } else {
        DOM.adminOverlay.style.display = 'block';
        updateAdminDebugInfo();
        AdminMode.updateInterval = setInterval(updateAdminDebugInfo, 1000);
    }
}

/**
 * Update admin debug info display
 */
function updateAdminDebugInfo() {
    document.getElementById('admin-session-status').textContent = AppState.isSessionRunning ? 'Yes' : 'No';
    document.getElementById('admin-current-mode').textContent = getCurrentMode() || 'None';
    document.getElementById('admin-current-view').textContent = AppState.currentView || '-';
    document.getElementById('admin-paused-status').textContent = AppState.isPaused ? 'Yes' : 'No';
    document.getElementById('admin-audio-status').textContent = AudioState.context ? AudioState.context.state : 'Not Initialized';
    document.getElementById('admin-entities-count').textContent = AppState.entities.length;
}

/**
 * Admin action: Switch between story scenes (Forest/Beach/Meadow/Night/Lake)
 * Only works in story mode
 */
export function adminSwitchScene() {
    // Only works in story mode
    if (!StoryMode || !StoryMode.isActive) {
        alert('Scene switching is only available in story mode');
        return;
    }
    
    const nextScene = StoryMode.getNextScene();
    StoryMode.switchScene(nextScene);
    
    // Update admin display
    let sceneName;
    let buttonText;
    if (nextScene === VIEWS.FOREST) {
        sceneName = 'Forest';
        buttonText = 'Switch to Beach';
    } else if (nextScene === VIEWS.BEACH) {
        sceneName = 'Beach';
        buttonText = 'Switch to Meadow';
    } else if (nextScene === VIEWS.MEADOW) {
        sceneName = 'Meadow';
        buttonText = 'Switch to Night';
    } else if (nextScene === VIEWS.NIGHT) {
        sceneName = 'Night';
        buttonText = 'Switch to Lake';
    } else {
        sceneName = 'Lake';
        buttonText = 'Switch to Forest';
    }
    
    document.getElementById('admin-current-scene').textContent = sceneName;
    
    const btn = document.querySelector('#admin-overlay .admin-btn[onclick="adminSwitchScene()"]');
    if (btn) {
        btn.textContent = buttonText;
    }
}

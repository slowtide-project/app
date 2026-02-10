// =========================================================================
// Admin mode functionality
// =========================================================================

import { AppState, AudioState, DOM } from './state.js';

/** Admin mode state */
const AdminMode = {
    sunsetForced: false,
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
    document.getElementById('admin-current-view').textContent = AppState.currentView;
    document.getElementById('admin-paused-status').textContent = AppState.isPaused ? 'Yes' : 'No';
    document.getElementById('admin-audio-status').textContent = AudioState.context ? AudioState.context.state : 'Not Initialized';
    document.getElementById('admin-entities-count').textContent = AppState.entities.length;
}

/**
 * Admin action: Toggle sunset overlay on/off
 */
export function adminForceSunset() {
    AdminMode.sunsetForced = !AdminMode.sunsetForced;
    DOM.sunsetOverlay.style.opacity = AdminMode.sunsetForced ? 1 : 0;

    const btn = document.querySelector('#admin-overlay .admin-btn[onclick="adminForceSunset()"]');
    if (btn) {
        btn.textContent = AdminMode.sunsetForced ? 'Sunset ON' : 'Sunset OFF';
        btn.classList.toggle('active', AdminMode.sunsetForced);
    }
}

// =========================================================================
// Local storage for user preferences
// =========================================================================

const STORAGE_KEY = 'slowtide_preferences';

/**
 * Save preferences to localStorage
 * @param {Object} prefs - Preferences object
 * @param {number} prefs.duration - Session duration in minutes
 * @param {string} prefs.sound - Sound type
 * @param {string} prefs.behaviorPattern - Behavior pattern ('chaos', 'rhythm', 'mix')
 * @param {string} prefs.autoSwitchMode - Auto switch mode ('on', 'off', 'long')
 * @param {string} prefs.visualDensity - Visual density ('minimal', 'standard', 'rich')
 * @param {string} prefs.emergentEvents - Emergent events ('off', 'rare', 'common')
 * @param {string} prefs.sensoryDimmerMode - Sensory dimmer mode ('auto', 'off')
 */
export function savePreferences(prefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
        console.warn('Failed to save preferences:', e);
    }
}

/**
 * Load preferences from localStorage
 * @returns {Object|null} Saved preferences or null
 */
export function loadPreferences() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.warn('Failed to load preferences:', e);
        return null;
    }
}

/**
 * Clear saved preferences
 */
export function clearPreferences() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.warn('Failed to clear preferences:', e);
    }
}

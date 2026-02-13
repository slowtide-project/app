// =========================================================================
// Local storage for user preferences
// =========================================================================

const STORAGE_KEY = 'slowtide_preferences';

/**
 * Save preferences to localStorage
 * @param {Object} prefs - Preferences object
 * @param {number} prefs.duration - Session duration in minutes
 * @param {string} prefs.sound - Sound type
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

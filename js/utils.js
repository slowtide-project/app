// =========================================================================
// Shared utility functions
// =========================================================================

/**
 * Trigger haptic feedback on mobile devices
 * @param {number} ms - Duration in milliseconds
 */
export function pulse(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}

/**
 * Analytics utility for Slowtide app
 * Tracks anonymized usage patterns without collecting PII
 */

import { AppState } from './state.js';
import { CONFIG } from './config.js';

/**
 * Track session start with selected settings
 */
export function trackSessionStart() {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'session_start', {
        duration_selected: AppState.duration.toString(),
        atmosphere: AppState.soundType,
        sfx_enabled: AppState.sfxEnabled.toString(),
        device_type: isMobile() ? 'mobile' : 'desktop',
        behavior_pattern: AppState.behaviorPattern || 'chaos',
        auto_switch_mode: AppState.autoSwitchMode || 'on',
        visual_density: AppState.visualDensity || 'standard'
    });
    
    AppState.sessionStartTime = Date.now();
}

/**
 * Track session end with completion status
 */
export function trackSessionEnd(completed = false) {
    if (typeof gtag === 'undefined') return;
    
    const actualDuration = AppState.sessionStartTime 
        ? Math.round((Date.now() - AppState.sessionStartTime) / 1000 / 60) // minutes
        : 0;
    
    gtag('event', 'session_end', {
        duration_selected: AppState.duration.toString(),
        actual_duration: actualDuration.toString(),
        completed: completed.toString(),
        atmosphere: AppState.soundType,
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track atmosphere/soundscape changes
 */
export function trackAtmosphereChange(oldAtmosphere, newAtmosphere) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'atmosphere_change', {
        from: oldAtmosphere,
        to: newAtmosphere,
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track activity/view switches
 */
export function trackActivitySwitch(activityName) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'activity_switch', {
        activity: activityName,
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track parent setting changes
 */
export function trackParentSettingChange(setting, oldValue, newValue) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'parent_setting_change', {
        setting: setting,
        from: oldValue,
        to: newValue
    });
}

/**
 * Track session duration changes
 */
export function trackDurationChange(oldDuration, newDuration) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'duration_change', {
        from: oldDuration.toString(),
        to: newDuration.toString(),
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track SFX toggle
 */
export function trackSFXChange(enabled) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'sfx_toggle', {
        enabled: enabled.toString(),
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track app updates
 */
export function trackAppUpdate() {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'app_update', {
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Track page view for PWA support
 */
export function trackPageView() {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'page_view', {
        page_title: 'Slowtide App',
        page_location: window.location.href,
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track user engagement to keep session active
 */
export function trackEngagement(activity = 'app_open') {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'user_engagement', {
        activity: activity,
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Setup engagement tracking interval
 */
export function setupEngagementTracking() {
    // Send engagement event every 30 seconds to keep session active
    setInterval(() => {
        if (AppState.isSessionRunning) {
            trackEngagement('session_active');
        }
    }, 30000);
    
    // Track initial app load
    setTimeout(() => trackEngagement('app_loaded'), 1000);
}

/**
 * Track errors (non-PII only)
 */
export function trackError(errorType, context = '') {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'app_error', {
        error_type: errorType,
        context: context.substring(0, 100), // Limit context length
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}
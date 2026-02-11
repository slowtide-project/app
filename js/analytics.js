/**
 * Analytics utility for Slowtide
 * Tracks anonymized usage patterns without collecting PII
 */

import { AppState } from './state.js';
import { CONFIG } from './config.js';

/**
 * Track session start with comprehensive device and settings data
 * @param {string} sessionIdentifier - Unique identifier for this session
 */
export async function trackSessionStart(sessionIdentifier = null) {
    if (typeof gtag === 'undefined') return;
    
    const deviceInfo = getDeviceInfo();
    
    // If we have a session identifier, set user_id for this session
    if (sessionIdentifier) {
        gtag('config', 'G-TJX61DSDD8', {
            user_id: sessionIdentifier,
            anonymize_ip: true,
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        });
    }
    
    gtag('event', 'session_start', {
        session_identifier: sessionIdentifier,
        duration_selected: AppState.duration.toString(),
        atmosphere: AppState.soundType,
        sfx_enabled: AppState.sfxEnabled.toString(),
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        browser: deviceInfo.browser,
        screen_orientation: deviceInfo.screen_orientation,
        input_type: deviceInfo.input_type,
        connection_type: deviceInfo.connection_type,
        battery_level: deviceInfo.battery_level,
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
    const deviceInfo = getDeviceInfo();
    
    gtag('event', 'session_end', {
        duration_selected: AppState.duration.toString(),
        actual_duration: actualDuration.toString(),
        completed: completed.toString(),
        atmosphere: AppState.soundType,
        device_type: deviceInfo.device_type,
        time_of_day: getTimeOfDay(),
        day_of_week: getDayOfWeek(),
        completion_rate: actualDuration >= AppState.duration ? 'completed' : 'early_exit',
        session_efficiency: Math.round((actualDuration / AppState.duration) * 100) + '%'
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
    
    const activityTitles = {
        'particles': 'Particles Activity',
        'sorting': 'Sorting Activity', 
        'bubbles': 'Bubbles Activity',
        'liquid': 'Liquid Activity',
        'marbles': 'Marbles Activity'
    };
    
    const activityTitle = activityTitles[activityName] || activityName;
    
    // Track as virtual page view
    trackVirtualPageView(activityTitle, {
        activity_name: activityName,
        transition_type: 'user_switch'
    });
    
    // Also keep event tracking for compatibility
    gtag('event', 'activity_switch', {
        activity: activityName,
        activity_title: activityTitle,
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
 * Get detailed device information
 */
function getDeviceInfo() {
    return {
        device_type: isMobile() ? 'mobile' : 'desktop',
        operating_system: getOperatingSystem(),
        browser: getBrowser(),
        screen_orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        input_type: 'ontouchstart' in window ? 'touch' : 'mouse',
        connection_type: getConnectionType(),
        battery_level: getBatteryLevel()
    };
}

/**
 * Get operating system
 */
function getOperatingSystem() {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Windows/.test(userAgent)) return 'Windows';
    if (/Mac/.test(userAgent)) return 'macOS';
    if (/Linux/.test(userAgent)) return 'Linux';
    return 'Unknown';
}

/**
 * Get browser name
 */
function getBrowser() {
    const userAgent = navigator.userAgent;
    if (/Chrome/.test(userAgent)) return 'Chrome';
    if (/Safari/.test(userAgent)) return 'Safari';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Edge/.test(userAgent)) return 'Edge';
    return 'Unknown';
}

/**
 * Get network connection type
 */
function getConnectionType() {
    if (!navigator.connection) return 'unknown';
    return navigator.connection.effectiveType || 'unknown';
}

/**
 * Get battery level if available
 */
async function getBatteryLevel() {
    if (!navigator.getBattery) return 'unknown';
    try {
        const battery = await navigator.getBattery();
        return Math.round(battery.level * 100) + '%';
    } catch (e) {
        return 'permission_denied';
    }
}

/**
 * Track page view for PWA support
 */
export function trackPageView(pageTitle = 'Start Screen') {
    if (typeof gtag === 'undefined') return;
    
    const deviceInfo = getDeviceInfo();
    const virtualUrl = '/view/' + pageTitle.toLowerCase().replace(/\s+/g, '-');
    
    gtag('config', 'G-TJX61DSDD8', {
        page_title: pageTitle,
        page_location: window.location.origin + virtualUrl,
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        browser: deviceInfo.browser,
        screen_orientation: deviceInfo.screen_orientation,
        input_type: deviceInfo.input_type,
        connection_type: deviceInfo.connection_type
    });
    
    // Also track as custom event for backup
    gtag('event', 'page_view', {
        page_title: pageTitle,
        virtual_page: virtualUrl,
        device_type: deviceInfo.device_type
    });
}

/**
 * Track virtual page view for different app screens
 */
export function trackVirtualPageView(screenName, additionalData = {}) {
    if (typeof gtag === 'undefined') return;
    
    const deviceInfo = getDeviceInfo();
    const virtualUrl = '/screen/' + screenName.toLowerCase().replace(/\s+/g, '-');
    
    // Update page configuration for proper page view tracking
    gtag('config', 'G-TJX61DSDD8', {
        page_title: screenName,
        page_location: window.location.origin + virtualUrl,
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
    });
    
    // Also track as custom event for additional context
    gtag('event', 'virtual_page_view', {
        page_title: screenName,
        virtual_page: virtualUrl,
        screen_type: screenName,
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        ...additionalData
    });
}

/**
 * Track user engagement to keep session active
 */
export function trackEngagement(activity = 'app_open') {
    if (typeof gtag === 'undefined') return;
    
    const deviceInfo = getDeviceInfo();
    
    gtag('event', 'user_engagement', {
        activity: activity,
        device_type: deviceInfo.device_type,
        operating_system: deviceInfo.operating_system,
        screen_orientation: deviceInfo.screen_orientation,
        input_type: deviceInfo.input_type
    });
}

/**
 * Setup engagement tracking interval
 */
export function setupEngagementTracking() {
    let interactionCount = 0;
    let pauseStartTime = null;
    
    // Send engagement event every 30 seconds to keep session active
    setInterval(() => {
        if (AppState.isSessionRunning) {
            trackEngagement('session_active');
        }
    }, 30000);
    
    // Track interaction frequency
    setInterval(() => {
        if (AppState.isSessionRunning && interactionCount > 0) {
            trackInteractionDepth(interactionCount);
        }
    }, 60000); // Track every minute
    
    // Track initial app load
    setTimeout(() => {
        trackEngagement('app_loaded');
        trackPageView('Start Screen');
        
        // Track initial load performance
        if (window.performance && window.performance.timing) {
            const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
            trackPerformance('page_load_time', loadTime);
        }
    }, 1000);
    
    // Expose interaction counter
    window.trackInteraction = () => {
        interactionCount++;
    };
    
    // Expose pause tracking
    window.trackPause = (isPaused) => {
        if (isPaused && !pauseStartTime) {
            pauseStartTime = Date.now();
        } else if (!isPaused && pauseStartTime) {
            trackSessionPause(Date.now() - pauseStartTime);
            pauseStartTime = null;
        }
    };
}

/**
 * Get time of day for usage patterns
 */
function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night_early';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night_late';
}

/**
 * Get day of week for weekly patterns
 */
function getDayOfWeek() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

/**
 * Track interaction frequency for engagement depth
 */
export function trackInteractionDepth(interactionCount) {
    if (typeof gtag === 'undefined') return;
    
    const depth = interactionCount < 10 ? 'low' : 
                 interactionCount < 25 ? 'medium' : 
                 interactionCount < 50 ? 'high' : 'very_high';
    
    gtag('event', 'interaction_depth', {
        depth_level: depth,
        total_interactions: interactionCount.toString(),
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track pause/resume behavior for session analytics
 */
export function trackSessionPause(duration) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'session_pause', {
        pause_duration: Math.round(duration / 1000).toString(), // seconds
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track app performance metrics
 */
export function trackPerformance(metric, value) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'app_performance', {
        metric_name: metric,
        metric_value: value.toString(),
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Track atmosphere effectiveness
 */
export function trackAtmosphereEffectiveness(atmosphere, sessionDuration, completed) {
    if (typeof gtag === 'undefined') return;
    
    gtag('event', 'atmosphere_effectiveness', {
        atmosphere_type: atmosphere,
        avg_session_length: sessionDuration.toString(),
        completion_rate: completed ? 'high' : 'lower',
        device_type: isMobile() ? 'mobile' : 'desktop'
    });
}

/**
 * Generate a three-word identifier for session tracking with date anchor
 * @returns {string} Three random words joined by hyphens with date suffix
 */
export function generateSessionIdentifier() {
    const words = [
        'apple', 'ocean', 'mountain', 'river', 'forest', 'sunset', 'moon', 'star', 
        'cloud', 'wind', 'rain', 'snow', 'fire', 'earth', 'stone', 'crystal',
        'dream', 'whisper', 'echo', 'shadow', 'light', 'dawn', 'dusk', 'night',
        'morning', 'spring', 'summer', 'autumn', 'winter', 'breeze', 'thunder',
        'lightning', 'rainbow', 'mist', 'fog', 'valley', 'meadow', 'garden',
        'cottage', 'bridge', 'path', 'journey', 'adventure', 'wonder', 'magic'
    ];
    
    const getRandomWord = () => words[Math.floor(Math.random() * words.length)];
    
    // Add simple date/time anchor (MMdd-HHMM format)
    const now = new Date();
    const monthDay = String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    const hourMin = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0');
    const dateAnchor = monthDay + '-' + hourMin;
    
    return `${getRandomWord()}-${getRandomWord()}-${getRandomWord()}-${dateAnchor}`;
}

/**
 * Setup analytics configuration
 */
export function setupAnalytics() {
    if (typeof gtag === 'undefined') return;
    
    gtag('config', 'G-TJX61DSDD8', {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
    });
    
    trackPageView('Start Screen');
}

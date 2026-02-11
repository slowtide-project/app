// =========================================================================
// Sensory dimmer system for progressive engagement
// =========================================================================

import { AppState } from './state.js';
import { CONFIG, ENGAGEMENT_PHASES, SENSORY_DIMMER_MODES } from './config.js';

/** Sensory dimmer management */
export const SensoryDimmer = {
    /**
     * Initialize the sensory dimmer system
     */
    init() {
        if (AppState.sensoryDimmerMode !== SENSORY_DIMMER_MODES.OFF) {
            AppState.currentEngagementPhase = ENGAGEMENT_PHASES.HIGH;
            AppState.phaseStartTime = Date.now();
        }
    },

    /**
     * Get phase durations based on current session length
     * @returns {Object} Duration in milliseconds for each phase
     */
    getPhaseDurations() {
        const totalSessionMs = AppState.sessionMinutes * 60 * 1000;
        return {
            high: totalSessionMs * CONFIG.HIGH_ENGAGEMENT_RATIO,
            medium: totalSessionMs * CONFIG.MEDIUM_ENGAGEMENT_RATIO,
            low: totalSessionMs * CONFIG.LOW_ENGAGEMENT_RATIO
        };
    },

    /**
     * Check and update engagement phase based on elapsed time
     */
    updatePhase() {
        if (AppState.sensoryDimmerMode !== SENSORY_DIMMER_MODES.AUTO) return;

        const currentTime = Date.now();
        const sessionStart = AppState.startTime;
        const elapsedInSession = currentTime - sessionStart;
        
        const phaseDurations = this.getPhaseDurations();
        let newPhase = AppState.currentEngagementPhase;
        
        if (elapsedInSession <= phaseDurations.high) {
            newPhase = ENGAGEMENT_PHASES.HIGH;
        } else if (elapsedInSession <= phaseDurations.high + phaseDurations.medium) {
            newPhase = ENGAGEMENT_PHASES.MEDIUM;
        } else {
            newPhase = ENGAGEMENT_PHASES.LOW;
        }
        
        if (newPhase !== AppState.currentEngagementPhase) {
            this.transitionToPhase(newPhase);
        }
    },

    /**
     * Transition to a new engagement phase
     * @param {string} newPhase - New phase from ENGAGEMENT_PHASES
     */
    transitionToPhase(newPhase) {
        AppState.currentEngagementPhase = newPhase;
        AppState.phaseStartTime = Date.now();
        
        // Update behavior pattern based on phase
        if (newPhase === ENGAGEMENT_PHASES.HIGH) {
            AppState.behaviorPattern = 'chaos';
            AppState.emergentEvents = 'common';
        } else if (newPhase === ENGAGEMENT_PHASES.MEDIUM) {
            AppState.behaviorPattern = 'rhythm';
            AppState.emergentEvents = 'rare';
        } else if (newPhase === ENGAGEMENT_PHASES.LOW) {
            AppState.behaviorPattern = 'calm';
            AppState.emergentEvents = 'off';
        }
        
        // Update UI to reflect current behavior pattern
        this.updateBehaviorPatternUI();
    },

    /**
     * Update behavior pattern UI buttons to match current phase
     */
    updateBehaviorPatternUI() {
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-pattern') === AppState.behaviorPattern) {
                btn.classList.add('selected');
            }
        });
        
        document.querySelectorAll('.emergent-btn').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.getAttribute('data-emergent') === AppState.emergentEvents) {
                btn.classList.add('selected');
            }
        });
    },

    /**
     * Get current phase multipliers for intensity adjustment
     * @returns {Object} Multipliers for volume, speed, and spawn rate
     */
    getPhaseMultipliers() {
        switch (AppState.currentEngagementPhase) {
            case ENGAGEMENT_PHASES.HIGH:
                return {
                    volume: CONFIG.HIGH_PHASE_VOLUME_MULTIPLIER,
                    speed: CONFIG.HIGH_PHASE_SPEED_MULTIPLIER,
                    spawn: CONFIG.HIGH_PHASE_SPAWN_MULTIPLIER
                };
            case ENGAGEMENT_PHASES.MEDIUM:
                return {
                    volume: CONFIG.MEDIUM_PHASE_VOLUME_MULTIPLIER,
                    speed: CONFIG.MEDIUM_PHASE_SPEED_MULTIPLIER,
                    spawn: CONFIG.MEDIUM_PHASE_SPAWN_MULTIPLIER
                };
            case ENGAGEMENT_PHASES.LOW:
                return {
                    volume: CONFIG.LOW_PHASE_VOLUME_MULTIPLIER,
                    speed: CONFIG.LOW_PHASE_SPEED_MULTIPLIER,
                    spawn: CONFIG.LOW_PHASE_SPAWN_MULTIPLIER
                };
            default:
                return { volume: 1, speed: 1, spawn: 1 };
        }
    },

    /**
     * Force transition to specific phase
     * @param {string} phase - Target phase
     */
    setPhase(phase) {
        if (Object.values(ENGAGEMENT_PHASES).includes(phase)) {
            this.transitionToPhase(phase);
        }
    },

    /**
     * Reset dimmer system
     */
    reset() {
        AppState.currentEngagementPhase = ENGAGEMENT_PHASES.HIGH;
        AppState.phaseStartTime = Date.now();
    },

    /**
     * Get current phase progress (0-1)
     * @returns {number} Progress through current phase
     */
    getPhaseProgress() {
        if (AppState.sensoryDimmerMode === SENSORY_DIMMER_MODES.OFF) return 0;
        
        const currentTime = Date.now();
        const sessionStart = AppState.startTime;
        const elapsedInSession = currentTime - sessionStart;
        const phaseDurations = this.getPhaseDurations();
        
        if (AppState.currentEngagementPhase === ENGAGEMENT_PHASES.HIGH) {
            return Math.min(elapsedInSession / phaseDurations.high, 1);
        } else if (AppState.currentEngagementPhase === ENGAGEMENT_PHASES.MEDIUM) {
            const elapsedInMedium = elapsedInSession - phaseDurations.high;
            return Math.min(elapsedInMedium / phaseDurations.medium, 1);
        } else {
            const elapsedInLow = elapsedInSession - phaseDurations.high - phaseDurations.medium;
            return Math.min(elapsedInLow / phaseDurations.low, 1);
        }
    }
};
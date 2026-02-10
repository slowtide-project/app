// =========================================================================
// Configuration & constants
// =========================================================================

/** Application configuration and constants */
export const CONFIG = {
    DEFAULT_SESSION_MINUTES: 90,
    SUNSET_FADE_START_RATIO: 0.5,
    IDLE_INTERACTION_CHANCE: 0.05,
    IDLE_VIEW_SWITCH_TIME: 30000,
    GHOST_INTERACTION_TIME: 2000,
    SFX_DEBOUNCE_TIME: 80,
    CANVAS_FADE_ALPHA: 0.2,
    PARTICLE_HUE_RANGE: { MIN: 200, MAX: 260 },
    BUBBLE_MAX_COUNT: 80,
    BUBBLE_MIN_COUNT: 25,
    BUBBLE_DESPAWN_MARGIN: 60,
    BUBBLE_SPAWN_CHANCE: 0.05,
    POP_PARTICLE_DECAY: 0.04,
    POP_PARTICLE_SIZE: 3,
    MARBLE_COUNT: 50,
    MARBLE_DAMPING: 0.98,
    MARBLE_BOUNCE_DAMPING: 0.9,
    MARBLE_INTERACTION_RADIUS: 200,
    MARBLE_INTERACTION_FORCE: 2.5,
    SORTING_BLOCK_COUNT: 20,
    SORTING_DAMPING: 0.95,
    SORTING_FLOAT_AMPLITUDE: 2,
    SYNTH_FREQUENCY_RANGE: { MIN: 200, MAX: 800 },
    LIQUID_FADE_ALPHA: 0.08,
    HAPTIC_FEEDBACK_DURATION: 10,
    CANVAS_AREA_DIVISOR: 8000
};

export const SOUND_TYPES = {
    DEEP: 'deep',
    RAIN: 'rain', 
    STATIC: 'static',
    WAVES: 'waves',
    OFF: 'off'
};

export const VIEWS = {
    PARTICLES: 'particles',
    SORTING: 'sorting',
    BUBBLES: 'bubbles',
    LIQUID: 'liquid',
    MARBLES: 'marbles'
};
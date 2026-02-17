// =========================================================================
// Configuration & constants
// =========================================================================

/** Application version following Semantic Versioning (SemVer) */
export const APP_VERSION = '1.0.0';

/** Application configuration and constants */
export const CONFIG = {
    DEFAULT_SESSION_MINUTES: 90,
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
    SORTING_COLORS: ['#5D6D7E', '#A9DFBF', '#F5B7B1', '#D7BDE2', '#F9E79F'],
    SORTING_ANGULAR_VELOCITY_FACTOR: 0.005,
    SORTING_LERP_FACTOR: 0.05,
    SORTING_MIN_DISTANCE: 5,
    HEADER_HEIGHT: 80,
    GHOST_IMPULSE_SORTING: 50,
    GHOST_IMPULSE_MARBLES: 15,
    GHOST_ANGLE_IMPULSE: 0.1,
    MARBLE_COLLISION_RESOLUTION: 0.05,
    SYNTH_FREQUENCY_RANGE: { MIN: 200, MAX: 800 },
    LIQUID_FADE_ALPHA: 0.08,
    HAPTIC_FEEDBACK_DURATION: 10,
    CANVAS_AREA_DIVISOR: 8000,
    // Timing for different modes
    IDLE_VIEW_SWITCH_TIME_LONG: 120000, // 2 minutes for long mode
    // Density multipliers
    DENSITY_RICH_MULTIPLIER: 1.8,
    // Emergent event chances (per frame)
    EMERGENT_EVENT_CHANCE_COMMON: 0.01,
    // Chaos mode settings
    CHAOS_AMPLITUDE_MULTIPLIER: 1.5, // Chaos is more intense than rhythm
    CHAOS_SPEED_MULTIPLIER: 2.0, // Chaos moves faster
    // Liquid view enhancements
    LIQUID_MAX_DROPS: 12, // Increased for more visible activity
    LIQUID_DROP_LIFETIME: 8000,
    LIQUID_RIPPLE_SPEED: 2,
    LIQUID_RIPPLE_LIFETIME: 3000,
    // LIQUID_GRAVITY_STRENGTH: 0.3, // Removed - no gravity
    // LIQUID_POOL_Y_FACTOR: 0.8,    // Removed - no pooling
    // Particle view enhancements
    PARTICLE_TYPES: {
        NORMAL: 'normal',
        GOLDEN: 'golden',
        RAINBOW: 'rainbow',
        STAR: 'star'
    },
    PARTICLE_GOLDEN_CHANCE: 0.15,
    PARTICLE_RAINBOW_CHANCE: 0.1,
    PARTICLE_STAR_CHANCE: 0.05,
    PARTICLE_TRAIL_LENGTH: 8,
    PARTICLE_CONNECTION_DISTANCE: 80,
    PARTICLE_BURST_COUNT: 6,
    PARTICLE_GLOW_RADIUS: 20,
    // Audio settings
    ATMOSPHERE_VOLUME: 0.25
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

export const STORY_SCENES = {
    FOREST: 'forest',
    BEACH: 'beach',
    MEADOW: 'meadow',
    NIGHT: 'night',
    LAKE: 'lake'
};

export const BEHAVIOR_PATTERNS = {
    CHAOS: 'chaos',
    RHYTHM: 'rhythm',
    MIX: 'mix',
    CALM: 'calm'
};

export const AUTO_SWITCH_MODES = {
    ON: 'on',
    OFF: 'off',
    LONG: 'long'
};

export const VISUAL_DENSITY = {
    MINIMAL: 'minimal',
    STANDARD: 'standard',
    RICH: 'rich'
};

export const SCROLL_SETTINGS = {
    SENSITIVITY: 0.002,
    FRICTION: 0.95,
    ARROW_STEP: 3,
    TOUCH_STEP: 3,
    WALK_SPEED: 3,
    WALK_SMOOTHING: 0.15,
    PARALLAX_FACTORS: {
        SKY: 0.1,
        FAR_TREES: 1.0,
        MID_TREES: 1.0,
        GROUND: 1.0
    }
};

export const EMERGENT_EVENTS = {
    OFF: 'off',
    RARE: 'rare',
    COMMON: 'common'
};
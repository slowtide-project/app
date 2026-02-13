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
    // Default parent settings
    DEFAULT_BEHAVIOR_PATTERN: 'chaos',
    DEFAULT_AUTO_SWITCH_MODE: 'on',
    DEFAULT_VISUAL_DENSITY: 'standard',
    DEFAULT_EMERGENT_EVENTS: 'off',
    // Timing for different modes
    IDLE_VIEW_SWITCH_TIME_LONG: 120000, // 2 minutes for long mode
    // Density multipliers
    DENSITY_MINIMAL_MULTIPLIER: 0.4,
    DENSITY_STANDARD_MULTIPLIER: 1.0,
    DENSITY_RICH_MULTIPLIER: 1.8,
    // Emergent event chances (per frame)
    EMERGENT_EVENT_CHANCE_RARE: 0.003,
    EMERGENT_EVENT_CHANCE_COMMON: 0.01,
    // Rhythm mode settings
    RHYTHM_MODE_AMPLITUDE: 0.5,
    RHYTHM_MODE_SPEED: 0.001,
    // Mix mode settings
    MIX_PATTERN_CYCLE_TIME: 5000, // Time to alternate between rhythm and calm
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
    // High-intensity mode settings
    HIGH_INTENSITY_PARTICLE_GOLDEN_CHANCE: 0.4,
    HIGH_INTENSITY_PARTICLE_RAINBOW_CHANCE: 0.3,
    HIGH_INTENSITY_PARTICLE_STAR_CHANCE: 0.2,
    HIGH_INTENSITY_PARTICLE_BURST_CHANCE: 0.3,
    HIGH_INTENSITY_CONNECTION_CHANCE: 0.05,
    HIGH_INTENSITY_FLASH_CHANCE: 0.02,
    PARTICLE_TRAIL_LENGTH: 8,
    PARTICLE_CONNECTION_DISTANCE: 80,
    PARTICLE_BURST_COUNT: 6,
    PARTICLE_GLOW_RADIUS: 20,
    // Audio settings
    ATMOSPHERE_VOLUME: 0.25,
    HIGH_INTENSITY_VOLUME: 0.8,
    HIGH_INTENSITY_SFX_FREQUENCY: 0.3,
    // High-intensity bubble settings
    HIGH_INTENSITY_BUBBLE_MAX_COUNT: 120,
    HIGH_INTENSITY_BUBBLE_SPAWN_CHANCE: 0.15,
    HIGH_INTENSITY_BUBBLE_SPEED_MULTIPLIER: 2.5,
    HIGH_INTENSITY_BUBBLE_COLOR_VARIANCE: 120,
    HIGH_INTENSITY_BUBBLE_GLOW_CHANCE: 0.1,
    // High-intensity liquid settings
    HIGH_INTENSITY_LIQUID_RIPPLE_COUNT: 8,
    HIGH_INTENSITY_LIQUID_SPONTANEOUS_CHANCE: 0.02,
    HIGH_INTENSITY_LIQUID_RAINBOW_SPEED: 3,
    HIGH_INTENSITY_LIQUID_NEARBY_DROPS: 6,
    HIGH_INTENSITY_LIQUID_ORBIT_COUNT: 8,
    HIGH_INTENSITY_LIQUID_ORBIT_SPEED: 0.05,
    HIGH_INTENSITY_LIQUID_FLASH_CHANCE: 0.03,
    HIGH_INTENSITY_LIQUID_TRAIL_LENGTH: 20,
    // High-intensity sorting settings
    HIGH_INTENSITY_SORTING_BLOCK_COUNT: 30,
    HIGH_INTENSITY_SORTING_SPEED_MULTIPLIER: 2.5,
    HIGH_INTENSITY_SORTING_COLOR_COUNT: 8,
    HIGH_INTENSITY_SORTING_GLOW_CHANCE: 0.15,
    // High-intensity marbles settings
    HIGH_INTENSITY_MARBLE_COUNT: 80,
    HIGH_INTENSITY_MARBLE_SPEED_MULTIPLIER: 2.0,
    HIGH_INTENSITY_MARBLE_FORCE_MULTIPLIER: 2.5,
    HIGH_INTENSITY_MARBLE_RAINBOW_CHANCE: 0.3,
    // Sensory dimmer settings
    DEFAULT_SENSORY_DIMMER_MODE: 'auto',
    // Phase duration ratios (percentage of total session)
    HIGH_ENGAGEMENT_RATIO: 0.33, // First 33% of session
    MEDIUM_ENGAGEMENT_RATIO: 0.33, // Next 33% of session
    LOW_ENGAGEMENT_RATIO: 0.34, // Final 34% of session
    // Phase-specific multipliers
    HIGH_PHASE_VOLUME_MULTIPLIER: 2.5,
    HIGH_PHASE_SPEED_MULTIPLIER: 3.0,
    HIGH_PHASE_SPAWN_MULTIPLIER: 4.0,
    MEDIUM_PHASE_VOLUME_MULTIPLIER: 0.8,
    MEDIUM_PHASE_SPEED_MULTIPLIER: 1.0,
    MEDIUM_PHASE_SPAWN_MULTIPLIER: 1.0,
    LOW_PHASE_VOLUME_MULTIPLIER: 0.4,
    LOW_PHASE_SPEED_MULTIPLIER: 0.6,
    LOW_PHASE_SPAWN_MULTIPLIER: 0.5
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
    MARBLES: 'marbles',
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

export const EMERGENT_EVENTS = {
    OFF: 'off',
    RARE: 'rare',
    COMMON: 'common'
};

export const ENGAGEMENT_PHASES = {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

export const SENSORY_DIMMER_MODES = {
    OFF: 'off',
    AUTO: 'auto',
    CUSTOM: 'custom'
};
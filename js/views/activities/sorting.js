import { AppState, DOM } from '../../state.js';
import { CONFIG, VIEWS } from '../../config.js';
import { ContinuousSynth } from '../../audio.js';
import { pulse } from '../../utils.js';

// Helper function to get density multiplier
function getDensityMultiplier() {
    switch(AppState.visualDensity) {
        case 'minimal': return CONFIG.DENSITY_MINIMAL_MULTIPLIER;
        case 'rich': return CONFIG.DENSITY_RICH_MULTIPLIER;
        default: return CONFIG.DENSITY_STANDARD_MULTIPLIER;
    }
}

// 2. SORTING VIEW
export const Sorting = {
    dragBlock: null, offsetX: 0, offsetY: 0,

    /**
     * Initialize sorting blocks
     */
    init() {
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        
        const baseBlockCount = isHighIntensity ? CONFIG.HIGH_INTENSITY_SORTING_BLOCK_COUNT : CONFIG.SORTING_BLOCK_COUNT;
        let blockCount = Math.floor(baseBlockCount * getDensityMultiplier());
        for (let i = 0; i < blockCount; i++) {
            const hasGlow = isHighIntensity && Math.random() < CONFIG.HIGH_INTENSITY_SORTING_GLOW_CHANCE;
            const colorCount = isHighIntensity ? CONFIG.HIGH_INTENSITY_SORTING_COLOR_COUNT : CONFIG.SORTING_COLORS.length;
            
            // Create expanded color palette for high intensity
            const colors = isHighIntensity ? 
                [...CONFIG.SORTING_COLORS, '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'] : 
                CONFIG.SORTING_COLORS;
            
            AppState.entities.push({
                x: Math.random() * (DOM.canvas.width - 100) + 50,
                y: Math.random() * (DOM.canvas.height - 200) + 100,
                w: Math.random() * 60 + 40,
                h: Math.random() * 40 + 30,
                c: colors[Math.floor(Math.random() * colorCount)],
                angle: Math.random() * Math.PI,
                vAngle: (Math.random() - 0.5) * 0.02,
                dx: Math.random() * 100,
                dy: Math.random() * 100,
                scale: 1.0,
                targetX: null,
                prevX: 0,
                phase: Math.random() * Math.PI * 2, // For rhythm mode
                glow: hasGlow
            });
        }
    },

    /**
     * Handle mouse/touch start on sorting blocks
     */
    handleStart(x, y) {
        for (let i = AppState.entities.length - 1; i >= 0; i--) {
            let s = AppState.entities[i];
            if (x > s.x - s.w / 2 - 20 && x < s.x + s.w / 2 + 20 && 
                y > s.y - s.h / 2 - 20 && y < s.y + s.h / 2 + 20) {
                this.dragBlock = s; 
                this.offsetX = x - s.x; 
                this.offsetY = y - s.y;
                AppState.entities.splice(i, 1); 
                AppState.entities.push(this.dragBlock);
                s.targetX = null; s.prevX = x;
                pulse(CONFIG.HAPTIC_FEEDBACK_DURATION);
                ContinuousSynth.start(VIEWS.SORTING, 0.5);
                break;
            }
        }
    },

    /**
     * Handle mouse/touch move on sorting blocks
     */
    handleMove(x, y) {
        if (this.dragBlock) { 
            let speedX = x - this.dragBlock.prevX; 
            this.dragBlock.vAngle = speedX * CONFIG.SORTING_ANGULAR_VELOCITY_FACTOR; 
            this.dragBlock.prevX = x; 
            this.dragBlock.x = x - this.offsetX; 
            this.dragBlock.y = y - this.offsetY; 
        }
    },

    /**
     * Handle mouse/touch end on sorting blocks
     */
    handleEnd() { this.dragBlock = null; },

    /**
     * Check for and handle block attraction (emergent event)
     */
    checkAttraction() {
        if (AppState.emergentEvents === 'off') return;
        let chance = AppState.emergentEvents === 'rare' ? 
            CONFIG.EMERGENT_EVENT_CHANCE_RARE : CONFIG.EMERGENT_EVENT_CHANCE_COMMON;
        
        if (Math.random() >= chance) return;
        
        // Find two nearby blocks and attract them
        for (let i = 0; i < AppState.entities.length; i++) {
            for (let j = i + 1; j < AppState.entities.length; j++) {
                let b1 = AppState.entities[i], b2 = AppState.entities[j];
                if (this.dragBlock === b1 || this.dragBlock === b2) continue;
                
                let dx = b2.x - b1.x, dy = b2.y - b1.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150 && dist > 20) {
                    // Attract toward each other - increased force for visible effect
                    let force = 3.0;
                    b1.dx += (dx / dist) * force;
                    b1.dy += (dy / dist) * force;
                    b2.dx -= (dx / dist) * force;
                    b2.dy -= (dy / dist) * force;
                    return;
                }
            }
        }
    },

    /**
     * Update and render sorting blocks
     */
    update() {
        DOM.ctx.fillStyle = 'rgba(5,5,5,0.3)'; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Check for emergent events
        this.checkAttraction();
        
        // Calculate time-based rhythm phase if needed
        let timePhase = (AppState.behaviorPattern === 'rhythm' || AppState.behaviorPattern === 'mix') ? 
            Date.now() * CONFIG.RHYTHM_MODE_SPEED : null;
        
        const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
            AppState.currentEngagementPhase === 'high';
        const speedMultiplier = isHighIntensity ? CONFIG.HIGH_INTENSITY_SORTING_SPEED_MULTIPLIER : 1;
        
        AppState.entities.forEach(s => {
            if (s.targetX !== null) { 
                s.x += (s.targetX - s.x) * CONFIG.SORTING_LERP_FACTOR; 
                s.y += (s.targetY - s.y) * CONFIG.SORTING_LERP_FACTOR; 
                if (Math.abs(s.x - s.targetX) < CONFIG.SORTING_MIN_DISTANCE) s.targetX = null; 
            }
            if (s.y < CONFIG.HEADER_HEIGHT + 20 && this.dragBlock !== s) { s.y += 1; }
            s.angle += s.vAngle; s.vAngle *= CONFIG.SORTING_DAMPING;
            
            let fx = s.x, fy = s.y;
            if (this.dragBlock !== s) { 
                // Apply behavior pattern to floating
                if (AppState.behaviorPattern === 'chaos') {
                    // Chaotic floating - unpredictable, erratic movement
                    let chaosPhase = Date.now() * 0.002 * CONFIG.CHAOS_SPEED_MULTIPLIER * speedMultiplier;
                    let randomOffset = Math.sin(Date.now() * 0.003 + s.phase) * 0.5 + 0.5; // 0-1 variation
                    fx += Math.sin(chaosPhase + s.dx + randomOffset * Math.PI) * CONFIG.SORTING_FLOAT_AMPLITUDE * CONFIG.CHAOS_AMPLITUDE_MULTIPLIER * speedMultiplier;
                    fy += Math.cos(chaosPhase * 1.3 + s.dy + randomOffset * Math.PI * 0.7) * CONFIG.SORTING_FLOAT_AMPLITUDE * CONFIG.CHAOS_AMPLITUDE_MULTIPLIER * speedMultiplier;
                } else if (AppState.behaviorPattern === 'rhythm') {
                    // Rhythmic, predictable floating
                    if (timePhase !== null) {
                        fx += Math.sin(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE * speedMultiplier;
                        fy += Math.cos(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE * speedMultiplier;
                    }
                } else if (AppState.behaviorPattern === 'mix') {
                    // Alternate smoothly between rhythm and calm based on time
                    let cycleProgress = (Date.now() % CONFIG.MIX_PATTERN_CYCLE_TIME) / CONFIG.MIX_PATTERN_CYCLE_TIME;
                    if (cycleProgress < 0.6 && timePhase !== null) {
                        // Rhythmic period (60% of time)
                        fx += Math.sin(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE * speedMultiplier;
                        fy += Math.cos(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE * speedMultiplier;
                    } else {
                        // Calm period (40% of time)
                        let calmPhase = Date.now() * 0.0005;
                        fx += Math.sin(calmPhase + s.dx) * CONFIG.SORTING_FLOAT_AMPLITUDE * 0.3 * speedMultiplier;
                        fy += Math.cos(calmPhase + s.dy) * CONFIG.SORTING_FLOAT_AMPLITUDE * 0.3 * speedMultiplier;
                    }
                } else {
                    // Default calm floating
                    let calmPhase = Date.now() * 0.0005;
                    fx += Math.sin(calmPhase + s.dx) * CONFIG.SORTING_FLOAT_AMPLITUDE * 0.3 * speedMultiplier;
                    fy += Math.cos(calmPhase + s.dy) * CONFIG.SORTING_FLOAT_AMPLITUDE * 0.3 * speedMultiplier;
                }
                s.scale += (1.0 - s.scale) * 0.2; 
            } else { 
                s.scale += (1.2 - s.scale) * 0.2; 
            }
            
            DOM.ctx.save(); 
            DOM.ctx.translate(fx, fy); 
            DOM.ctx.rotate(s.angle); 
            DOM.ctx.scale(s.scale, s.scale);
            
            let dw = s.w, dh = s.h;
            DOM.ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
            DOM.ctx.beginPath(); 
            DOM.ctx.roundRect(-dw / 2 + 4, -dh / 2 + 4, dw, dh, 15); 
            DOM.ctx.fill();
            DOM.ctx.fillStyle = s.c; 
            DOM.ctx.beginPath(); 
            DOM.ctx.roundRect(-dw / 2, -dh / 2, dw, dh, 15); 
            DOM.ctx.fill();
            
            // Add glow effect for high intensity blocks
            if (s.glow) {
                DOM.ctx.shadowBlur = 15;
                DOM.ctx.shadowColor = s.c;
                DOM.ctx.fill();
                DOM.ctx.shadowBlur = 0;
            }
            DOM.ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
            DOM.ctx.beginPath(); 
            DOM.ctx.roundRect(-dw / 2 + 5, -dh / 2 + 2, dw - 10, dh / 2, 10); 
            DOM.ctx.fill();
            
            DOM.ctx.restore();
        });
    }
};
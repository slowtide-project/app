import { AppState, DOM } from '../state.js';
import { CONFIG, VIEWS } from '../config.js';
import { ContinuousSynth } from '../audio.js';
import { pulse } from '../utils.js';

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
        let blockCount = Math.floor(CONFIG.SORTING_BLOCK_COUNT * getDensityMultiplier());
        for (let i = 0; i < blockCount; i++) {
            AppState.entities.push({
                x: Math.random() * (DOM.canvas.width - 100) + 50,
                y: Math.random() * (DOM.canvas.height - 200) + 100,
                w: Math.random() * 60 + 40,
                h: Math.random() * 40 + 30,
                c: CONFIG.SORTING_COLORS[Math.floor(Math.random() * CONFIG.SORTING_COLORS.length)],
                angle: Math.random() * Math.PI,
                vAngle: (Math.random() - 0.5) * 0.02,
                dx: Math.random() * 100,
                dy: Math.random() * 100,
                scale: 1.0,
                targetX: null,
                prevX: 0,
                phase: Math.random() * Math.PI * 2 // For rhythm mode
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
                    // Attract toward each other
                    let force = 0.5;
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
                let isRhythm = AppState.behaviorPattern === 'rhythm' || 
                    (AppState.behaviorPattern === 'mix' && Math.random() > 0.3);
                
                if (isRhythm && timePhase !== null) {
                    // Rhythmic, predictable floating
                    fx += Math.sin(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE;
                    fy += Math.cos(timePhase + s.phase) * CONFIG.SORTING_FLOAT_AMPLITUDE;
                } else {
                    // Chaotic floating
                    fx += Math.sin(Date.now() * 0.001 + s.dx) * CONFIG.SORTING_FLOAT_AMPLITUDE; 
                    fy += Math.cos(Date.now() * 0.001 + s.dy) * CONFIG.SORTING_FLOAT_AMPLITUDE;
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
            DOM.ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
            DOM.ctx.beginPath(); 
            DOM.ctx.roundRect(-dw / 2 + 5, -dh / 2 + 2, dw - 10, dh / 2, 10); 
            DOM.ctx.fill();
            
            DOM.ctx.restore();
        });
    }
};
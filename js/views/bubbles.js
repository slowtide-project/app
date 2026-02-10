import { AppState, DOM } from '../state.js';
import { CONFIG } from '../config.js';
import { SFX } from '../audio.js';
import { pulse } from '../utils.js';

// 3. BUBBLES VIEW
export const Bubbles = {
    /**
     * Initialize bubble system
     */
    init() {
        let maxB = Math.min(CONFIG.BUBBLE_MAX_COUNT, 
            Math.max(CONFIG.BUBBLE_MIN_COUNT, 
            Math.floor((DOM.canvas.width * DOM.canvas.height) / CONFIG.CANVAS_AREA_DIVISOR)));
        for (let i = 0; i < maxB; i++) {
            AppState.entities.push({
                type: 'b', 
                x: Math.random() * DOM.canvas.width, 
                y: Math.random() * DOM.canvas.height, 
                s: Math.random() * 40 + 15, 
                scale: 1.0, 
                sp: Math.random() * 1.5 + 0.5, 
                w: Math.random() * Math.PI * 2, 
                c: `hsla(${Math.random() * 40 + 180},70%,70%,0.3)`
            });
        }
    },

    /**
     * Spawn a new bubble
     */
    spawn() { 
        AppState.entities.push({
            type: 'b', 
            x: Math.random() * DOM.canvas.width, 
            y: Math.random() * DOM.canvas.height + 50, 
            s: Math.random() * 40 + 15, 
            scale: 0.1, 
            sp: Math.random() * 1.5 + 0.5, 
            w: Math.random() * Math.PI * 2, 
            c: `hsla(${Math.random() * 40 + 180},70%,70%,0.3)`
        }); 
    },

    /**
     * Handle bubble popping
     */
    handleStart(x, y) {
        for (let i = AppState.entities.length - 1; i >= 0; i--) {
            let b = AppState.entities[i];
            if (b.type === 'b' && Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2) < b.s + 20) { 
                this.createPop(b.x, b.y, b.c); 
                AppState.entities.splice(i, 1); 
                pulse(CONFIG.HAPTIC_FEEDBACK_DURATION); 
                SFX.play('pop'); 
                break;
            }
        }
    },

    /**
     * Create particle pop effect
     */
    createPop(x, y, c) { 
        for (let i = 0; i < 8; i++) {
            AppState.entities.push({
                type: 'p', x, y, 
                vx: Math.cos(Math.PI * 2 * i / 8) * 3, 
                vy: Math.sin(Math.PI * 2 * i / 8) * 3, 
                l: 1, 
                c: c.replace('0.3', '0.8')
            });
        }
    },

    /**
     * Update and render bubbles
     */
    update() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        let maxB = Math.min(CONFIG.BUBBLE_MAX_COUNT, 
            Math.max(CONFIG.BUBBLE_MIN_COUNT, 
            Math.floor((DOM.canvas.width * DOM.canvas.height) / CONFIG.CANVAS_AREA_DIVISOR)));
            
        if (AppState.entities.filter(e => e.type === 'b').length < maxB && Math.random() < CONFIG.BUBBLE_SPAWN_CHANCE) {
            this.spawn();
        }
        
        for (let i = 0; i < AppState.entities.length; i++) {
            let e = AppState.entities[i];
            if (e.type === 'b') {
                if (e.scale < 1.0) e.scale += 0.05;
                e.y -= e.sp; 
                e.x += Math.sin(e.y * 0.01 + e.w) * 0.5;
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(e.x, e.y, e.s * e.scale, 0, Math.PI * 2); 
                DOM.ctx.fillStyle = e.c; 
                DOM.ctx.fill(); 
                DOM.ctx.strokeStyle = "rgba(255,255,255,0.4)"; 
                DOM.ctx.lineWidth = 2; 
                DOM.ctx.stroke();
                if (e.y < -CONFIG.BUBBLE_DESPAWN_MARGIN) { AppState.entities.splice(i, 1); i--; }
            } else {
                e.l -= CONFIG.POP_PARTICLE_DECAY; e.x += e.vx; e.y += e.vy;
                if (e.l <= 0) { AppState.entities.splice(i, 1); i--; continue; }
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(e.x, e.y, CONFIG.POP_PARTICLE_SIZE, 0, Math.PI * 2); 
                DOM.ctx.fillStyle = e.c; 
                DOM.ctx.globalAlpha = e.l; 
                DOM.ctx.fill(); 
                DOM.ctx.globalAlpha = 1;
            }
        }
    }
};
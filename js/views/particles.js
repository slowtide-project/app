import { AppState, DOM } from '../state.js';
import { CONFIG, VIEWS } from '../config.js';

// 1. PARTICLES VIEW
export const Particles = {
    /**
     * Spawn a new particle at position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    spawn(x, y) { 
        AppState.entities.push({ 
            x, y, 
            vx: (Math.random() - .5) * 2, 
            vy: (Math.random() - .5) * 2, 
            life: 1, 
            hue: CONFIG.PARTICLE_HUE_RANGE.MIN + Math.random() * 
                (CONFIG.PARTICLE_HUE_RANGE.MAX - CONFIG.PARTICLE_HUE_RANGE.MIN)
        }); 
    },

    /**
     * Update and render particles
     */
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.CANVAS_FADE_ALPHA})`; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        for (let i = 0; i < AppState.entities.length; i++) {
            let p = AppState.entities[i]; 
            p.x += p.vx; p.y += p.vy; p.life -= 0.01;
            
            if (p.life > 0) { 
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(p.x, p.y, Math.random() * 15 + 5, 0, Math.PI * 2); 
                DOM.ctx.fillStyle = `hsla(${p.hue},80%,60%,${p.life})`; 
                DOM.ctx.fill(); 
            } else { 
                AppState.entities.splice(i, 1); i--; 
            }
        }
    }
};
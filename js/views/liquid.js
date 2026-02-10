import { DOM } from '../state.js';
import { CONFIG } from '../config.js';

// 4. LIQUID VIEW
export const Liquid = {
    /**
     * Spawn liquid effect at position
     */
    spawn(x, y) { 
        DOM.ctx.beginPath(); 
        DOM.ctx.arc(x, y, 30, 0, Math.PI * 2); 
        DOM.ctx.fillStyle = `hsl(${Date.now() % 360},70%,60%)`; 
        DOM.ctx.shadowBlur = 40; 
        DOM.ctx.shadowColor = DOM.ctx.fillStyle; 
        DOM.ctx.fill(); 
        DOM.ctx.shadowBlur = 0; 
    },

    /**
     * Update liquid animation
     */
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.LIQUID_FADE_ALPHA})`; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        let t = Date.now() * 0.002; 
        this.spawn(DOM.canvas.width / 2 + Math.sin(t) * (DOM.canvas.width / 3), 
                  DOM.canvas.height / 2 + Math.cos(t * 1.3) * (DOM.canvas.height / 4));
    }
};
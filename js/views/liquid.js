import { DOM } from '../state.js';
import { CONFIG } from '../config.js';

// 4. LIQUID VIEW - Simple elegant version
export const Liquid = {
    orbitPhase: 0,
    
    /**
     * Spawn liquid effect at position
     */
    spawn(x, y) { 
        // Create simple expanding circle
        for (let r = 5; r <= 30; r += 5) {
            setTimeout(() => {
                DOM.ctx.beginPath(); 
                DOM.ctx.arc(x, y, r, 0, Math.PI * 2); 
                DOM.ctx.strokeStyle = `hsla(${(Date.now() + r * 10) % 360},70%,60%,${1 - r/30})`; 
                DOM.ctx.lineWidth = 2;
                DOM.ctx.stroke();
            }, (r - 5) * 30);
        }
    },

    /**
     * Handle touch/click interaction
     */
    handleStart(x, y) {
        // Create multiple expanding rings
        this.spawn(x, y);
        
        // Add some random nearby drops for variety
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                let offsetX = (Math.random() - 0.5) * 100;
                let offsetY = (Math.random() - 0.5) * 100;
                this.spawn(x + offsetX, y + offsetY);
            }, i * 100);
        }
    },

    /**
     * Update liquid animation
     */
    update() {
        DOM.ctx.fillStyle = `rgba(5,5,5,${CONFIG.LIQUID_FADE_ALPHA})`; 
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Simple orbiting drops - much like original but more engaging
        this.orbitPhase += 0.01;
        
        // Create main orbiting drop
        let mainX = DOM.canvas.width / 2 + Math.sin(this.orbitPhase) * (DOM.canvas.width / 3);
        let mainY = DOM.canvas.height / 2 + Math.cos(this.orbitPhase * 1.3) * (DOM.canvas.height / 4);
        
        DOM.ctx.beginPath(); 
        DOM.ctx.arc(mainX, mainY, 25, 0, Math.PI * 2); 
        DOM.ctx.fillStyle = `hsl(${Date.now() % 360},70%,60%)`; 
        DOM.ctx.shadowBlur = 30; 
        DOM.ctx.shadowColor = DOM.ctx.fillStyle; 
        DOM.ctx.fill(); 
        DOM.ctx.shadowBlur = 0;
        
        // Add a couple smaller companion drops
        for (let i = 0; i < 2; i++) {
            let offsetPhase = this.orbitPhase + (i + 1) * Math.PI / 3;
            let companionX = DOM.canvas.width / 2 + Math.sin(offsetPhase) * (DOM.canvas.width / 4);
            let companionY = DOM.canvas.height / 2 + Math.cos(offsetPhase * 1.5) * (DOM.canvas.height / 5);
            
            DOM.ctx.beginPath(); 
            DOM.ctx.arc(companionX, companionY, 15, 0, Math.PI * 2); 
            DOM.ctx.fillStyle = `hsl(${(Date.now() + 100 * (i + 1)) % 360},60%,50%)`; 
            DOM.ctx.shadowBlur = 20; 
            DOM.ctx.shadowColor = DOM.ctx.fillStyle; 
            DOM.ctx.fill(); 
            DOM.ctx.shadowBlur = 0;
        }
    }
};
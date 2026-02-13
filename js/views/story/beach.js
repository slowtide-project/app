// =========================================================================
// Beach view - Simple calming beach scene for story mode
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Beach = {
    init() {
        this.drawBeach();
    },
    
    handleStart(x, y) {
        return;
    },
    
    handleMove(x, y) {
        return;
    },
    
    update() {
        // Static scene - no updates needed
    },
    
    redraw() {
        this.drawBeach();
    },
    
    drawBeach() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawOcean();
        this.drawBeachGround();
    },
    
    drawSky() {
        // Soft muted sky gradient
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#8BA5B5');
        gradient.addColorStop(0.4, '#9FB5C5');
        gradient.addColorStop(0.7, '#B0C5CF');
        gradient.addColorStop(1, '#C5D5DF');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Subtle warm glow
        const glow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.6
        );
        glow.addColorStop(0, 'rgba(180, 160, 140, 0.06)');
        glow.addColorStop(0.5, 'rgba(170, 150, 130, 0.03)');
        glow.addColorStop(1, 'rgba(160, 140, 120, 0)');
        
        DOM.ctx.fillStyle = glow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },
    
    drawOcean() {
        // Calm ocean water
        const oceanTop = DOM.canvas.height * 0.45;
        
        const oceanGrad = DOM.ctx.createLinearGradient(0, oceanTop, 0, DOM.canvas.height * 0.6);
        oceanGrad.addColorStop(0, '#5D8A9A');
        oceanGrad.addColorStop(0.3, '#4A7A8A');
        oceanGrad.addColorStop(0.7, '#3D6A7A');
        oceanGrad.addColorStop(1, '#305A6A');
        
        DOM.ctx.fillStyle = oceanGrad;
        DOM.ctx.fillRect(0, oceanTop, DOM.canvas.width, DOM.canvas.height * 0.15);
        
        // Simple wave line
        DOM.ctx.fillStyle = '#4D7A8A';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, oceanTop + 15);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = oceanTop + 15 + Math.sin(x * 0.02) * 3 + Math.sin(x * 0.05) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, oceanTop);
        DOM.ctx.lineTo(0, oceanTop);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawBeachGround() {
        // Sand beach
        const beachTop = DOM.canvas.height * 0.55;
        
        const sandGrad = DOM.ctx.createLinearGradient(0, beachTop, 0, DOM.canvas.height);
        sandGrad.addColorStop(0, '#C4B59D');
        sandGrad.addColorStop(0.3, '#B5A58D');
        sandGrad.addColorStop(0.7, '#A6957D');
        sandGrad.addColorStop(1, '#978568');
        
        DOM.ctx.fillStyle = sandGrad;
        DOM.ctx.fillRect(0, beachTop, DOM.canvas.width, DOM.canvas.height - beachTop);
        
        // Subtle sand line at top
        DOM.ctx.fillStyle = '#B5A58D';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, beachTop);
        
        for (let x = 0; x <= DOM.canvas.width; x += 30) {
            const y = beachTop + Math.sin(x * 0.015) * 4 + Math.sin(x * 0.03) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, beachTop);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    }
};

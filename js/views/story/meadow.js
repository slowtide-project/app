// =========================================================================
// Meadow view - Simple calming meadow scene for story mode
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Meadow = {
    init() {
        this.drawMeadow();
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
        this.drawMeadow();
    },
    
    drawMeadow() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawHills();
        this.drawMeadowGround();
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
    
    drawHills() {
        // Far hills - back layer
        const farHills = DOM.canvas.height * 0.35;
        
        const hillGrad1 = DOM.ctx.createLinearGradient(0, farHills - 50, 0, farHills + 50);
        hillGrad1.addColorStop(0, '#5D7050');
        hillGrad1.addColorStop(1, '#4D5A42');
        
        DOM.ctx.fillStyle = hillGrad1;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, farHills);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = farHills + Math.sin(x * 0.008) * 30 + Math.sin(x * 0.015) * 15;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, DOM.canvas.height * 0.5);
        DOM.ctx.lineTo(0, DOM.canvas.height * 0.5);
        DOM.ctx.closePath();
        DOM.ctx.fill();
        
        // Mid hills - middle layer
        const midHills = DOM.canvas.height * 0.42;
        
        const hillGrad2 = DOM.ctx.createLinearGradient(0, midHills - 40, 0, midHills + 40);
        hillGrad2.addColorStop(0, '#506048');
        hillGrad2.addColorStop(1, '#405038');
        
        DOM.ctx.fillStyle = hillGrad2;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, midHills);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = midHills + Math.sin(x * 0.01 + 1) * 25 + Math.sin(x * 0.02) * 12;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, DOM.canvas.height * 0.55);
        DOM.ctx.lineTo(0, DOM.canvas.height * 0.55);
        DOM.ctx.closePath();
        DOM.ctx.fill();
        
        // Near hills - front layer
        const nearHills = DOM.canvas.height * 0.5;
        
        const hillGrad3 = DOM.ctx.createLinearGradient(0, nearHills - 30, 0, nearHills + 30);
        hillGrad3.addColorStop(0, '#455040');
        hillGrad3.addColorStop(1, '#354030');
        
        DOM.ctx.fillStyle = hillGrad3;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, nearHills);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = nearHills + Math.sin(x * 0.012 + 2) * 20 + Math.sin(x * 0.025) * 10;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, DOM.canvas.height * 0.6);
        DOM.ctx.lineTo(0, DOM.canvas.height * 0.6);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawMeadowGround() {
        // Main meadow area
        const meadowTop = DOM.canvas.height * 0.55;
        
        const meadowGrad = DOM.ctx.createLinearGradient(0, meadowTop, 0, DOM.canvas.height);
        meadowGrad.addColorStop(0, '#4D5A42');
        meadowGrad.addColorStop(0.3, '#3D4A35');
        meadowGrad.addColorStop(0.7, '#2D3A28');
        meadowGrad.addColorStop(1, '#1D2A1B');
        
        DOM.ctx.fillStyle = meadowGrad;
        DOM.ctx.fillRect(0, meadowTop, DOM.canvas.width, DOM.canvas.height - meadowTop);
        
        // Add grass tufts
        this.drawGrassTufts(meadowTop);
    },
    
    drawGrassTufts(meadowTop) {
        const count = 80 + Math.floor(Math.random() * 40); // 80-120 tufts
        
        for (let i = 0; i < count; i++) {
            const x = Math.random() * DOM.canvas.width;
            const y = meadowTop + 20 + Math.random() * (DOM.canvas.height - meadowTop - 40);
            const height = 10 + Math.random() * 20;
            
            // Varying muted greens
            const hue = 80 + Math.random() * 20;
            const sat = 20 + Math.random() * 15;
            const light = 20 + Math.random() * 15;
            
            DOM.ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
            DOM.ctx.lineWidth = 1.5;
            
            // Draw grass blade
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, y);
            DOM.ctx.quadraticCurveTo(
                x + (Math.random() - 0.5) * 8,
                y - height * 0.5,
                x + (Math.random() - 0.5) * 5,
                y - height
            );
            DOM.ctx.stroke();
            
            // Second blade
            if (Math.random() > 0.3) {
                DOM.ctx.beginPath();
                DOM.ctx.moveTo(x + 2, y);
                DOM.ctx.quadraticCurveTo(
                    x + 2 + (Math.random() - 0.5) * 6,
                    y - height * 0.6,
                    x + 2 + (Math.random() - 0.5) * 4,
                    y - height * 0.8
                );
                DOM.ctx.stroke();
            }
        }
    }
};

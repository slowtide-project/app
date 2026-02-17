// =========================================================================
// Meadow view - Calming meadow scene for story mode with walking
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';
import { BaseScene, seededRandom } from './base-scene.js';

export const Meadow = {
    ...BaseScene,
    
    grassTufts: [],

    generateElements() {
        const worldWidth = DOM.canvas.width * 3;
        const horizonY = DOM.canvas.height * 0.55;
        
        this.grassTufts = [];
        for (let i = 0; i < 150; i++) {
            const seed = i * 100 + 1;
            this.grassTufts.push({
                baseX: seededRandom(seed) * worldWidth,
                yOffset: seededRandom(seed + 1) * (DOM.canvas.height - horizonY - 40),
                height: 10 + seededRandom(seed + 2) * 20,
                hue: 80 + seededRandom(seed + 3) * 20,
                sat: 20 + seededRandom(seed + 4) * 15,
                light: 20 + seededRandom(seed + 5) * 15,
                curve1: (seededRandom(seed + 6) - 0.5) * 8,
                curve2: (seededRandom(seed + 7) - 0.5) * 5
            });
        }
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

    drawSceneWithOffset(scrollOffset) {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        const p = SCROLL_SETTINGS.PARALLAX_FACTORS;
        
        this.drawSky();
        this.drawFarHillsWithOffset(scrollOffset * 0.3);
        this.drawMidHillsWithOffset(scrollOffset * 0.5);
        this.drawNearHillsWithOffset(scrollOffset * 0.7);
        this.drawGroundWithOffset(scrollOffset * p.GROUND);
        this.drawGrassWithOffset(scrollOffset * p.GROUND);
    },
    
    drawSky() {
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#8BA5B5');
        gradient.addColorStop(0.4, '#9FB5C5');
        gradient.addColorStop(0.7, '#B0C5CF');
        gradient.addColorStop(1, '#C5D5DF');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
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
    
    drawFarHillsWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        const farHills = DOM.canvas.height * 0.35;
        
        const hillGrad1 = DOM.ctx.createLinearGradient(0, farHills - 50, 0, farHills + 50);
        hillGrad1.addColorStop(0, '#5D7050');
        hillGrad1.addColorStop(1, '#4D5A42');
        
        DOM.ctx.fillStyle = hillGrad1;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, farHills);
        
        const step = 20;
        for (let x = 0; x <= DOM.canvas.width + step; x += step) {
            const worldX = x + offset;
            const wrappedWorldX = this.wrapX(worldX, worldWidth);
            const y = farHills + Math.sin(wrappedWorldX * 0.008) * 30 + Math.sin(wrappedWorldX * 0.015) * 15;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width + step, DOM.canvas.height * 0.5);
        DOM.ctx.lineTo(0, DOM.canvas.height * 0.5);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawMidHillsWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        const midHills = DOM.canvas.height * 0.42;
        
        const hillGrad2 = DOM.ctx.createLinearGradient(0, midHills - 40, 0, midHills + 40);
        hillGrad2.addColorStop(0, '#506048');
        hillGrad2.addColorStop(1, '#405038');
        
        DOM.ctx.fillStyle = hillGrad2;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, midHills);
        
        const step = 20;
        for (let x = 0; x <= DOM.canvas.width + step; x += step) {
            const worldX = x + offset;
            const wrappedWorldX = this.wrapX(worldX, worldWidth);
            const y = midHills + Math.sin(wrappedWorldX * 0.01 + 1) * 25 + Math.sin(wrappedWorldX * 0.02) * 12;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width + step, DOM.canvas.height * 0.6);
        DOM.ctx.lineTo(0, DOM.canvas.height * 0.6);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawNearHillsWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        const nearHills = DOM.canvas.height * 0.5;
        
        const hillGrad3 = DOM.ctx.createLinearGradient(0, nearHills - 30, 0, nearHills + 30);
        hillGrad3.addColorStop(0, '#455040');
        hillGrad3.addColorStop(1, '#354030');
        
        DOM.ctx.fillStyle = hillGrad3;
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, nearHills);
        
        const step = 20;
        for (let x = 0; x <= DOM.canvas.width + step; x += step) {
            const worldX = x + offset;
            const wrappedWorldX = this.wrapX(worldX, worldWidth);
            const y = nearHills + Math.sin(wrappedWorldX * 0.012 + 2) * 20 + Math.sin(wrappedWorldX * 0.025) * 10;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width + step, DOM.canvas.height);
        DOM.ctx.lineTo(0, DOM.canvas.height);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawGroundWithOffset(offset) {
        const meadowTop = DOM.canvas.height * 0.55;
        
        const meadowGrad = DOM.ctx.createLinearGradient(0, meadowTop, 0, DOM.canvas.height);
        meadowGrad.addColorStop(0, '#4D5A42');
        meadowGrad.addColorStop(0.3, '#3D4A35');
        meadowGrad.addColorStop(0.7, '#2D3A28');
        meadowGrad.addColorStop(1, '#1D2A1B');
        
        DOM.ctx.fillStyle = meadowGrad;
        DOM.ctx.fillRect(0, meadowTop, DOM.canvas.width, DOM.canvas.height - meadowTop);
    },
    
    drawGrassWithOffset(offset) {
        const worldWidth = DOM.canvas.width * 3;
        const horizonY = DOM.canvas.height * 0.55;
        
        for (const tuft of this.grassTufts) {
            const wrappedX = this.wrapX(tuft.baseX - offset, worldWidth);
            
            if (wrappedX > -50 && wrappedX < DOM.canvas.width + 50) {
                const y = horizonY + 20 + tuft.yOffset;
                
                DOM.ctx.strokeStyle = `hsl(${tuft.hue}, ${tuft.sat}%, ${tuft.light}%)`;
                DOM.ctx.lineWidth = 1.5;
                
                DOM.ctx.beginPath();
                DOM.ctx.moveTo(wrappedX, y);
                DOM.ctx.quadraticCurveTo(
                    wrappedX + tuft.curve1,
                    y - tuft.height * 0.5,
                    wrappedX + tuft.curve2,
                    y - tuft.height
                );
                DOM.ctx.stroke();
                
                DOM.ctx.beginPath();
                DOM.ctx.moveTo(wrappedX + 2, y);
                DOM.ctx.quadraticCurveTo(
                    wrappedX + 2 + tuft.curve1 * 0.7,
                    y - tuft.height * 0.6,
                    wrappedX + 2 + tuft.curve2 * 0.8,
                    y - tuft.height * 0.8
                );
                DOM.ctx.stroke();
            }
        }
    }
};

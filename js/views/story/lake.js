// =========================================================================
// Lake view - Calming lake scene for story mode with walking
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';
import { BaseScene, seededRandom } from './base-scene.js';

export const Lake = {
    ...BaseScene,
    
    trees: [],

    generateElements() {
        const worldWidth = DOM.canvas.width * 3;
        
        // Trees along the shore - edge-weighted distribution
        this.trees = [];
        
        // Left edge trees (first 20% of world)
        for (let i = 0; i < 15; i++) {
            const seed = i * 100 + 1;
            this.trees.push({
                baseX: seededRandom(seed) * worldWidth * 0.2,
                height: 80 + seededRandom(seed + 1) * 60,
                width: 50 + seededRandom(seed + 2) * 35,
                shade: '#0A0A0A'
            });
        }
        
        // Right edge trees (last 20% of world)
        for (let i = 15; i < 30; i++) {
            const seed = i * 100 + 1;
            this.trees.push({
                baseX: worldWidth * 0.8 + seededRandom(seed) * worldWidth * 0.2,
                height: 80 + seededRandom(seed + 1) * 60,
                width: 50 + seededRandom(seed + 2) * 35,
                shade: '#0A0A0A'
            });
        }
        
        // Middle trees (sparse, between 30-70% of world)
        for (let i = 30; i < 40; i++) {
            const seed = i * 100 + 1;
            this.trees.push({
                baseX: worldWidth * 0.3 + seededRandom(seed) * worldWidth * 0.4,
                height: 80 + seededRandom(seed + 1) * 60,
                width: 50 + seededRandom(seed + 2) * 35,
                shade: '#0A0A0A'
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
        this.drawWaterWithOffset(scrollOffset * p.GROUND);
        this.drawTreesWithOffset(scrollOffset * 0.5);
        this.drawGroundWithOffset(scrollOffset * p.GROUND);
    },
    
    drawSky() {
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#5A4A6A');
        gradient.addColorStop(0.4, '#8A6A7A');
        gradient.addColorStop(0.7, '#C4856A');
        gradient.addColorStop(1, '#E8A080');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        // Warm sunset glow
        const glow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.6
        );
        glow.addColorStop(0, 'rgba(220, 160, 120, 0.15)');
        glow.addColorStop(0.4, 'rgba(200, 140, 100, 0.08)');
        glow.addColorStop(0.7, 'rgba(180, 120, 80, 0.04)');
        glow.addColorStop(1, 'rgba(160, 100, 60, 0)');
        
        DOM.ctx.fillStyle = glow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },
    
    drawWaterWithOffset(offset) {
        const lakeTop = DOM.canvas.height * 0.42;
        
        const waterGrad = DOM.ctx.createLinearGradient(0, lakeTop, 0, DOM.canvas.height * 0.55);
        waterGrad.addColorStop(0, '#5A6A75');
        waterGrad.addColorStop(0.3, '#4A5A65');
        waterGrad.addColorStop(0.7, '#3A4A55');
        waterGrad.addColorStop(1, '#2A3A45');
        
        DOM.ctx.fillStyle = waterGrad;
        DOM.ctx.fillRect(0, lakeTop, DOM.canvas.width, DOM.canvas.height * 0.13);
        
        // Reflection
        const reflectionGrad = DOM.ctx.createLinearGradient(0, lakeTop, 0, lakeTop + 50);
        reflectionGrad.addColorStop(0, 'rgba(180, 110, 80, 0.2)');
        reflectionGrad.addColorStop(0.5, 'rgba(140, 90, 70, 0.08)');
        reflectionGrad.addColorStop(1, 'rgba(100, 70, 60, 0)');
        
        DOM.ctx.fillStyle = reflectionGrad;
        DOM.ctx.fillRect(0, lakeTop, DOM.canvas.width, 50);
        
        // Water line with offset
        const worldWidth = DOM.canvas.width * 3;
        
        DOM.ctx.fillStyle = '#4A5A65';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, lakeTop);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const worldX = x + offset;
            const wrappedX = this.wrapX(worldX, worldWidth);
            const y = lakeTop + Math.sin(wrappedX * 0.015) * 3 + Math.sin(wrappedX * 0.03) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, lakeTop + 15);
        DOM.ctx.lineTo(0, lakeTop + 15);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawTreesWithOffset(offset) {
        const edgeY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        for (const tree of this.trees) {
            const wrappedX = this.wrapX(tree.baseX - offset, worldWidth);
            
            if (wrappedX > -100 && wrappedX < DOM.canvas.width + 100) {
                DOM.ctx.fillStyle = tree.shade;
                this.drawTreeSilhouette(wrappedX, edgeY, tree.width, tree.height);
            }
        }
    },
    
    drawTreeSilhouette(x, baseY, width, height) {
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = baseY - (i * height * 0.22);
            const layerWidth = width * (1 - i * 0.22);
            const layerHeight = height * 0.35;
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },
    
    drawGroundWithOffset(offset) {
        const groundY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#3A4530');
        groundGrad.addColorStop(0.3, '#2A3525');
        groundGrad.addColorStop(0.7, '#1A2518');
        groundGrad.addColorStop(1, '#0A1508');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Shore line with offset
        DOM.ctx.fillStyle = '#3A4535';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 30) {
            const worldX = x + offset;
            const wrappedX = this.wrapX(worldX, worldWidth);
            const y = groundY + Math.sin(wrappedX * 0.01) * 4 + Math.sin(wrappedX * 0.025) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    }
};

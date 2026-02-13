// =========================================================================
// Lake view - Simple calming lake scene for story mode
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG } from '../../config.js';

export const Lake = {
    init() {
        this.drawLake();
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
        this.drawLake();
    },
    
    drawLake() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawLakeWater();
        this.drawNearTrees();
        this.drawGround();
    },
    
    drawSky() {
        // Dusk sky gradient - purple to warm orange
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
    
    drawLakeWater() {
        // Calm lake water
        const lakeTop = DOM.canvas.height * 0.42;
        
        const waterGrad = DOM.ctx.createLinearGradient(0, lakeTop, 0, DOM.canvas.height * 0.55);
        waterGrad.addColorStop(0, '#5A6A75');
        waterGrad.addColorStop(0.3, '#4A5A65');
        waterGrad.addColorStop(0.7, '#3A4A55');
        waterGrad.addColorStop(1, '#2A3A45');
        
        DOM.ctx.fillStyle = waterGrad;
        DOM.ctx.fillRect(0, lakeTop, DOM.canvas.width, DOM.canvas.height * 0.13);
        
        // Dusk sky reflection on water
        const reflectionGrad = DOM.ctx.createLinearGradient(0, lakeTop, 0, lakeTop + 50);
        reflectionGrad.addColorStop(0, 'rgba(180, 110, 80, 0.2)');
        reflectionGrad.addColorStop(0.5, 'rgba(140, 90, 70, 0.08)');
        reflectionGrad.addColorStop(1, 'rgba(100, 70, 60, 0)');
        
        DOM.ctx.fillStyle = reflectionGrad;
        DOM.ctx.fillRect(0, lakeTop, DOM.canvas.width, 50);
        
        // Water line
        DOM.ctx.fillStyle = '#4A5A65';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, lakeTop);
        
        for (let x = 0; x <= DOM.canvas.width; x += 20) {
            const y = lakeTop + Math.sin(x * 0.015) * 3 + Math.sin(x * 0.03) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, lakeTop + 15);
        DOM.ctx.lineTo(0, lakeTop + 15);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawNearTrees() {
        // Near trees at water's edge
        const edgeY = DOM.canvas.height * 0.55;
        
        // Left side trees
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * DOM.canvas.width * 0.25;
            const height = 80 + Math.random() * 60;
            const width = 50 + Math.random() * 35;
            
            DOM.ctx.fillStyle = '#0A0A0A';
            this.drawTreeSilhouette(x, edgeY, width, height);
        }
        
        // Right side trees
        for (let i = 0; i < 10; i++) {
            const x = DOM.canvas.width * 0.75 + Math.random() * DOM.canvas.width * 0.25;
            const height = 80 + Math.random() * 60;
            const width = 50 + Math.random() * 35;
            
            DOM.ctx.fillStyle = '#0A0A0A';
            this.drawTreeSilhouette(x, edgeY, width, height);
        }
        
        // Closer trees on edges
        for (let i = 0; i < 5; i++) {
            const x = DOM.canvas.width * 0.05 + Math.random() * DOM.canvas.width * 0.1;
            const height = 120 + Math.random() * 80;
            const width = 70 + Math.random() * 40;
            
            DOM.ctx.fillStyle = '#050505';
            this.drawTreeSilhouette(x, edgeY, width, height);
        }
        
        for (let i = 0; i < 5; i++) {
            const x = DOM.canvas.width * 0.85 + Math.random() * DOM.canvas.width * 0.1;
            const height = 120 + Math.random() * 80;
            const width = 70 + Math.random() * 40;
            
            DOM.ctx.fillStyle = '#050505';
            this.drawTreeSilhouette(x, edgeY, width, height);
        }
    },
    
    drawTreeSilhouette(x, baseY, width, height) {
        // Simple triangular pine silhouette
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
    
    drawGround() {
        // Grassy shore
        const groundY = DOM.canvas.height * 0.55;
        
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#3A4530');
        groundGrad.addColorStop(0.3, '#2A3525');
        groundGrad.addColorStop(0.7, '#1A2518');
        groundGrad.addColorStop(1, '#0A1508');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Subtle shore line
        DOM.ctx.fillStyle = '#3A4535';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 30) {
            const y = groundY + Math.sin(x * 0.01) * 4 + Math.sin(x * 0.025) * 2;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    }
};

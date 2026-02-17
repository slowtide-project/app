// =========================================================================
// Night Sky view - Calming night scene for story mode with walking
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';
import { BaseScene, seededRandom } from './base-scene.js';

export const Night = {
    ...BaseScene,
    
    stars: [],
    farTrees: [],
    nearTrees: [],

    generateElements() {
        const worldWidth = DOM.canvas.width * 3;
        
        // Stars - static positions across the sky
        this.stars = [];
        for (let i = 0; i < 145; i++) {
            const seed = i * 100 + 1;
            this.stars.push({
                x: seededRandom(seed) * DOM.canvas.width,
                y: seededRandom(seed + 1) * DOM.canvas.height * 0.6,
                size: 0.5 + seededRandom(seed + 2) * 1.5,
                brightness: 0.5 + seededRandom(seed + 3) * 0.5,
                isBright: seededRandom(seed + 4) > 0.8
            });
        }
        
        // Far trees - horizon silhouettes
        this.farTrees = [];
        for (let i = 0; i < 50; i++) {
            const seed = i * 100 + 1000;
            this.farTrees.push({
                baseX: (i / 50) * worldWidth * 1.1,
                height: 40 + seededRandom(seed + 1) * 40,
                width: 25 + seededRandom(seed + 2) * 20,
                shade: seededRandom(seed + 3) > 0.5 ? '#1A1A28' : '#161622'
            });
        }
        
        // Near trees - closer silhouettes
        this.nearTrees = [];
        for (let i = 0; i < 30; i++) {
            const seed = i * 100 + 2000;
            this.nearTrees.push({
                baseX: (i / 30) * worldWidth * 1.08,
                height: 70 + seededRandom(seed + 1) * 50,
                width: 45 + seededRandom(seed + 2) * 30,
                yOffset: seededRandom(seed + 3) * 20
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
        this.drawStars();
        this.drawMoon();
        this.drawTreesWithOffset(scrollOffset * 0.5);
        this.drawGroundWithOffset(scrollOffset * p.GROUND);
    },
    
    drawSky() {
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.7);
        gradient.addColorStop(0, '#1E1E38');
        gradient.addColorStop(0.3, '#16162C');
        gradient.addColorStop(0.6, '#1A1A30');
        gradient.addColorStop(1, '#222240');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },
    
    drawStars() {
        for (const star of this.stars) {
            DOM.ctx.fillStyle = `rgba(255, 255, 240, ${star.brightness})`;
            DOM.ctx.beginPath();
            DOM.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            DOM.ctx.fill();
        }
        
        // Bright stars with glow
        for (const star of this.stars) {
            if (star.isBright) {
                const glowGrad = DOM.ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 5);
                glowGrad.addColorStop(0, 'rgba(255, 255, 250, 0.6)');
                glowGrad.addColorStop(0.5, 'rgba(255, 255, 240, 0.2)');
                glowGrad.addColorStop(1, 'rgba(255, 255, 230, 0)');
                
                DOM.ctx.fillStyle = glowGrad;
                DOM.ctx.fillRect(star.x - star.size * 5, star.y - star.size * 5, star.size * 10, star.size * 10);
                
                DOM.ctx.fillStyle = 'rgba(255, 255, 250, 0.95)';
                DOM.ctx.beginPath();
                DOM.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                DOM.ctx.fill();
            }
        }
    },
    
    drawMoon() {
        const moonX = DOM.canvas.width * 0.78;
        const moonY = DOM.canvas.height * 0.18;
        const moonRadius = 50;
        
        // Outer glow
        const outerGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 6);
        outerGlow.addColorStop(0, 'rgba(255, 250, 230, 0.7)');
        outerGlow.addColorStop(0.3, 'rgba(255, 245, 220, 0.4)');
        outerGlow.addColorStop(0.6, 'rgba(255, 240, 210, 0.2)');
        outerGlow.addColorStop(1, 'rgba(255, 235, 200, 0)');
        
        DOM.ctx.fillStyle = outerGlow;
        DOM.ctx.fillRect(moonX - moonRadius * 6, moonY - moonRadius * 6, moonRadius * 12, moonRadius * 12);
        
        // Inner glow
        const innerGlow = DOM.ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 3);
        innerGlow.addColorStop(0, 'rgba(255, 252, 245, 0.85)');
        innerGlow.addColorStop(0.5, 'rgba(255, 248, 235, 0.5)');
        innerGlow.addColorStop(1, 'rgba(255, 245, 225, 0)');
        
        DOM.ctx.fillStyle = innerGlow;
        DOM.ctx.fillRect(moonX - moonRadius * 3, moonY - moonRadius * 3, moonRadius * 6, moonRadius * 6);
        
        // Moon body
        DOM.ctx.fillStyle = 'rgba(255, 252, 245, 0.95)';
        DOM.ctx.beginPath();
        DOM.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        // Surface glow
        const surfaceGlow = DOM.ctx.createRadialGradient(
            moonX - moonRadius * 0.3, moonY - moonRadius * 0.3, 0,
            moonX, moonY, moonRadius
        );
        surfaceGlow.addColorStop(0, 'rgba(255, 252, 245, 0.4)');
        surfaceGlow.addColorStop(1, 'rgba(255, 250, 240, 0)');
        
        DOM.ctx.fillStyle = surfaceGlow;
        DOM.ctx.beginPath();
        DOM.ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        DOM.ctx.fill();
        
        // Craters
        DOM.ctx.fillStyle = 'rgba(230, 220, 200, 0.2)';
        const craters = [
            { x: -10, y: -8, r: 6 },
            { x: 15, y: 10, r: 5 },
            { x: -8, y: 15, r: 4 },
            { x: 10, y: -12, r: 4 },
            { x: 18, y: 5, r: 3 }
        ];
        
        craters.forEach(crater => {
            DOM.ctx.beginPath();
            DOM.ctx.arc(moonX + crater.x, moonY + crater.y, crater.r, 0, Math.PI * 2);
            DOM.ctx.fill();
        });
    },
    
    drawTreesWithOffset(offset) {
        const horizonY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        // Far trees
        for (const tree of this.farTrees) {
            const wrappedX = this.wrapX(tree.baseX - offset, worldWidth);
            
            if (wrappedX > -100 && wrappedX < DOM.canvas.width + 100) {
                DOM.ctx.fillStyle = tree.shade;
                this.drawTreeSilhouette(wrappedX, horizonY, tree.width, tree.height);
            }
        }
        
        // Near trees
        for (const tree of this.nearTrees) {
            const wrappedX = this.wrapX(tree.baseX - offset, worldWidth);
            
            if (wrappedX > -150 && wrappedX < DOM.canvas.width + 150) {
                DOM.ctx.fillStyle = '#1E1E2C';
                this.drawTreeSilhouette(wrappedX, horizonY + tree.yOffset, tree.width, tree.height);
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
        
        // Moon glow on ground
        const moonX = DOM.canvas.width * 0.78;
        
        const moonGlow = DOM.ctx.createRadialGradient(
            moonX, DOM.canvas.height * 0.3, 0,
            moonX, DOM.canvas.height * 0.3, DOM.canvas.width * 1.5
        );
        moonGlow.addColorStop(0, 'rgba(100, 100, 120, 0.5)');
        moonGlow.addColorStop(0.25, 'rgba(80, 80, 100, 0.35)');
        moonGlow.addColorStop(0.5, 'rgba(60, 60, 80, 0.25)');
        moonGlow.addColorStop(0.75, 'rgba(45, 45, 60, 0.12)');
        moonGlow.addColorStop(1, 'rgba(30, 30, 45, 0.05)');
        
        DOM.ctx.fillStyle = moonGlow;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Base ground gradient
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#222235');
        groundGrad.addColorStop(0.3, '#1A1A28');
        groundGrad.addColorStop(1, '#141420');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        // Ground variation with sine wave
        DOM.ctx.fillStyle = '#1E1E30';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 40) {
            const worldX = x + offset;
            const y = groundY + Math.sin(this.wrapX(worldX, worldWidth) * 0.01) * 5;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    }
};

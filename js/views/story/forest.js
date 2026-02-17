// =========================================================================
// Forest view - Woodland scene with walking parallax effect
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';
import { BaseScene, seededRandom } from './base-scene.js';

export const Forest = {
    ...BaseScene,
    
    farTrees: [],
    midTrees: [],
    sideTreesLeft: [],
    sideTreesRight: [],
    grassPatches: [],

    generateElements() {
        const horizonY = DOM.canvas.height * 0.55;
        const screenWidth = DOM.canvas.width;
        const worldWidth = screenWidth * 3;

        this.farTrees = [];
        for (let i = 0; i < 80; i++) {
            const seed = i * 100 + 1;
            this.farTrees.push({
                baseX: seededRandom(seed) * worldWidth,
                height: 40 + seededRandom(seed + 1) * 40,
                width: 25 + seededRandom(seed + 2) * 20,
                yOffset: 0
            });
        }

        this.midTrees = [];
        for (let i = 0; i < 50; i++) {
            const seed = i * 100 + 1000;
            this.midTrees.push({
                baseX: seededRandom(seed) * worldWidth,
                height: 60 + seededRandom(seed + 1) * 50,
                width: 35 + seededRandom(seed + 2) * 30,
                yOffset: 0
            });
        }

        this.sideTreesLeft = [];
        for (let i = 0; i < 15; i++) {
            const seed = i * 100 + 2000;
            this.sideTreesLeft.push({
                baseX: seededRandom(seed) * screenWidth * 0.3,
                baseY: horizonY,
                scale: 0.4 + seededRandom(seed + 2) * 0.6
            });
        }

        this.sideTreesRight = [];
        for (let i = 0; i < 15; i++) {
            const seed = i * 100 + 3000;
            this.sideTreesRight.push({
                baseX: screenWidth * 0.7 + seededRandom(seed) * screenWidth * 0.3,
                baseY: horizonY,
                scale: 0.4 + seededRandom(seed + 2) * 0.6
            });
        }

        this.grassPatches = [];
        const groundHeight = DOM.canvas.height - horizonY;
        for (let i = 0; i < 300; i++) {
            const seed = i * 100 + 4000;
            this.grassPatches.push({
                baseX: seededRandom(seed) * worldWidth,
                yOffset: seededRandom(seed + 1) * groundHeight,
                height: 8 + seededRandom(seed + 2) * 15,
                hue: 85 + seededRandom(seed + 3) * 20,
                sat: 15 + seededRandom(seed + 4) * 15,
                light: 30 + seededRandom(seed + 5) * 15,
                curve1: (seededRandom(seed + 6) - 0.5) * 6,
                curve2: (seededRandom(seed + 7) - 0.5) * 3
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
        this.drawGroundWithOffset(scrollOffset * p.GROUND);
        this.drawFarTreesWithOffset(scrollOffset * p.FAR_TREES);
        this.drawMidTreesWithOffset(scrollOffset * p.MID_TREES);
        this.drawGrassWithOffset(scrollOffset * p.GROUND);
        this.drawSideTreesWithOffset(scrollOffset * p.MID_TREES);
    },

    drawScene() {
        DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        this.drawSky();
        this.drawGround();
        this.drawFarTrees();
        this.drawMidTrees();
        this.drawGrass();
        this.drawSideTrees();
    },

    drawSky() {
        const gradient = DOM.ctx.createLinearGradient(0, 0, 0, DOM.canvas.height * 0.5);
        gradient.addColorStop(0, '#7BA3B8');
        gradient.addColorStop(0.4, '#8FB5C4');
        gradient.addColorStop(0.7, '#A8C4CE');
        gradient.addColorStop(1, '#B8CDD4');
        
        DOM.ctx.fillStyle = gradient;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
        
        const glow = DOM.ctx.createRadialGradient(
            DOM.canvas.width * 0.5, DOM.canvas.height, 0,
            DOM.canvas.width * 0.5, DOM.canvas.height, DOM.canvas.width * 0.6
        );
        glow.addColorStop(0, 'rgba(180, 160, 140, 0.08)');
        glow.addColorStop(0.5, 'rgba(170, 150, 130, 0.04)');
        glow.addColorStop(1, 'rgba(160, 140, 120, 0)');
        
        DOM.ctx.fillStyle = glow;
        DOM.ctx.fillRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    },

    drawGround() {
        const groundY = DOM.canvas.height * 0.55;
        
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#6B7D5E');
        groundGrad.addColorStop(0.3, '#5D7050');
        groundGrad.addColorStop(0.7, '#4D5A42');
        groundGrad.addColorStop(1, '#3D4A35');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        DOM.ctx.fillStyle = '#5D7050';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 40) {
            const y = groundY + Math.sin(x * 0.01) * 5;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },

    drawGroundWithOffset(offset) {
        const groundY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        const offsetX = this.wrapX(-offset, worldWidth);
        
        const groundGrad = DOM.ctx.createLinearGradient(0, groundY, 0, DOM.canvas.height);
        groundGrad.addColorStop(0, '#6B7D5E');
        groundGrad.addColorStop(0.3, '#5D7050');
        groundGrad.addColorStop(0.7, '#4D5A42');
        groundGrad.addColorStop(1, '#3D4A35');
        
        DOM.ctx.fillStyle = groundGrad;
        DOM.ctx.fillRect(0, groundY, DOM.canvas.width, DOM.canvas.height - groundY);
        
        DOM.ctx.fillStyle = '#5D7050';
        DOM.ctx.beginPath();
        DOM.ctx.moveTo(0, groundY);
        
        for (let x = 0; x <= DOM.canvas.width; x += 40) {
            const worldX = x + offsetX;
            const y = groundY + Math.sin(worldX * 0.01) * 5;
            DOM.ctx.lineTo(x, y);
        }
        
        DOM.ctx.lineTo(DOM.canvas.width, groundY);
        DOM.ctx.closePath();
        DOM.ctx.fill();
    },
    
    drawFarTrees() {
        const horizonY = DOM.canvas.height * 0.55;
        
        for (let i = 0; i < this.farTrees.length; i++) {
            const tree = this.farTrees[i];
            this.drawTreeSilhouette(tree.baseX, horizonY + tree.yOffset, tree.width, tree.height, '#3A4A35');
        }
    },

    drawFarTreesWithOffset(offset) {
        const horizonY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        for (let i = 0; i < this.farTrees.length; i++) {
            const tree = this.farTrees[i];
            const wrappedX = this.wrapX(tree.baseX - offset, worldWidth);
            
            if (wrappedX > -100 && wrappedX < DOM.canvas.width + 100) {
                this.drawTreeSilhouette(wrappedX, horizonY + tree.yOffset, tree.width, tree.height, '#3A4A35');
            }
        }
    },

    drawMidTrees() {
        const horizonY = DOM.canvas.height * 0.55;
        
        for (let i = 0; i < this.midTrees.length; i++) {
            const tree = this.midTrees[i];
            this.drawTreeSilhouette(tree.baseX, horizonY + tree.yOffset, tree.width, tree.height, '#1E2A18');
        }
    },

    drawMidTreesWithOffset(offset) {
        const horizonY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        for (let i = 0; i < this.midTrees.length; i++) {
            const tree = this.midTrees[i];
            const wrappedX = this.wrapX(tree.baseX - offset, worldWidth);
            
            if (wrappedX > -150 && wrappedX < DOM.canvas.width + 150) {
                this.drawTreeSilhouette(wrappedX, horizonY + tree.yOffset, tree.width, tree.height, '#1E2A18');
            }
        }
    },
    
    drawTreeSilhouette(x, baseY, width, height, color = '#1A2515') {
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = baseY - (i * height * 0.22);
            const layerWidth = width * (1 - i * 0.22);
            const layerHeight = height * 0.35;
            
            DOM.ctx.fillStyle = color;
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    },

    drawGrass() {
        const horizonY = DOM.canvas.height * 0.55;
        
        for (let i = 0; i < this.grassPatches.length; i++) {
            const patch = this.grassPatches[i];
            const x = patch.baseX;
            const y = horizonY + patch.yOffset;
            
            DOM.ctx.strokeStyle = `hsl(${patch.hue}, ${patch.sat}%, ${patch.light}%)`;
            DOM.ctx.lineWidth = 1.5;
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, y);
            DOM.ctx.quadraticCurveTo(
                x + patch.curve1,
                y - patch.height * 0.5,
                x + patch.curve2,
                y - patch.height
            );
            DOM.ctx.stroke();
        }
    },

    drawGrassWithOffset(offset) {
        const horizonY = DOM.canvas.height * 0.55;
        const worldWidth = DOM.canvas.width * 3;
        
        for (let i = 0; i < this.grassPatches.length; i++) {
            const patch = this.grassPatches[i];
            const wrappedX = this.wrapX(patch.baseX - offset, worldWidth);
            
            if (wrappedX > -50 && wrappedX < DOM.canvas.width + 50) {
                const y = horizonY + patch.yOffset;
                
                DOM.ctx.strokeStyle = `hsl(${patch.hue}, ${patch.sat}%, ${patch.light}%)`;
                DOM.ctx.lineWidth = 1.5;
                
                DOM.ctx.beginPath();
                DOM.ctx.moveTo(wrappedX, y);
                DOM.ctx.quadraticCurveTo(
                    wrappedX + patch.curve1,
                    y - patch.height * 0.5,
                    wrappedX + patch.curve2,
                    y - patch.height
                );
                DOM.ctx.stroke();
            }
        }
    },

    drawSideTrees() {
        const horizonY = DOM.canvas.height * 0.55;
        
        for (let i = 0; i < this.sideTreesLeft.length; i++) {
            const tree = this.sideTreesLeft[i];
            this.drawSideTree(tree.baseX, tree.baseY, tree.scale);
        }
        
        for (let i = 0; i < this.sideTreesRight.length; i++) {
            const tree = this.sideTreesRight[i];
            this.drawSideTree(tree.baseX, tree.baseY, tree.scale);
        }
    },

    drawSideTreesWithOffset(offset) {
        for (let i = 0; i < this.sideTreesLeft.length; i++) {
            const tree = this.sideTreesLeft[i];
            const wrappedX = this.wrapX(tree.baseX - offset * 0.5, DOM.canvas.width);
            this.drawSideTree(wrappedX, tree.baseY, tree.scale);
        }
        
        for (let i = 0; i < this.sideTreesRight.length; i++) {
            const tree = this.sideTreesRight[i];
            const wrappedX = this.wrapX(tree.baseX - offset * 0.5, DOM.canvas.width);
            this.drawSideTree(wrappedX, tree.baseY, tree.scale);
        }
    },
    
    drawSideTree(x, baseY, scale) {
        const width = 80 * scale;
        const height = 180 * scale;
        
        const trunkWidth = width * 0.12;
        const trunkHeight = height * 0.35;
        
        DOM.ctx.fillStyle = '#4A3D2E';
        DOM.ctx.fillRect(x - trunkWidth / 2, baseY - trunkHeight, trunkWidth, trunkHeight);
        
        const canopyBaseY = baseY - trunkHeight * 0.8;
        const layers = 5;
        
        for (let i = 0; i < layers; i++) {
            const layerY = canopyBaseY - (i * height * 0.14);
            const layerWidth = width * (1 - i * 0.18);
            const layerHeight = height * 0.25;
            
            const lightness = 22 + i * 2;
            DOM.ctx.fillStyle = `hsl(95, 18%, ${lightness}%)`;
            
            DOM.ctx.beginPath();
            DOM.ctx.moveTo(x, layerY - layerHeight);
            DOM.ctx.lineTo(x - layerWidth / 2, layerY);
            DOM.ctx.lineTo(x + layerWidth / 2, layerY);
            DOM.ctx.closePath();
            DOM.ctx.fill();
        }
    }
};

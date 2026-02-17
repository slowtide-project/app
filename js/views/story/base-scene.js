// =========================================================================
// Base Scene - Common methods for all story scenes with walking
// =========================================================================

import { AppState, DOM } from '../../state.js';
import { CONFIG, SCROLL_SETTINGS } from '../../config.js';

export function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

export const BaseScene = {
    init() {
        this.generateElements();
        this.drawSceneWithOffset(0);
    },
    
    redraw() {
        this.generateElements();
        this.drawSceneWithOffset(0);
    },
    
    renderWithScroll(scrollOffset) {
        this.drawSceneWithOffset(scrollOffset);
    },
    
    wrapX(x, worldWidth) {
        return ((x % worldWidth) + worldWidth) % worldWidth;
    }
};

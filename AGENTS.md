# Development Agents for Slowtide

## Development Commands

This document outlines common development tasks and the recommended approach for implementing them in the refactored Slowtide codebase.

---

## 🎯 Adding New Activities/Views

**When to use**: Adding a new interactive activity to the app

**Agent**: General Purpose
**Files to modify**:
- Create `js/views/[new-view].js` (follow existing pattern)
- Update `js/config.js` - add new view to `VIEWS` enum
- Update `js/systems.js` - import new view from `./views/[new-view].js`
- Update `js/app.js` - import new view from `./views/[new-view].js`
- Update `index.html` - add navigation button

**Pattern to follow**:
```javascript
import { AppState, DOM } from '../state.js';
import { CONFIG } from '../config.js';

export const NewView = {
    init() {
        // Initialize entities and setup
    },
    
    handleStart(x, y) {
        // Handle mouse/touch start
    },
    
    handleMove(x, y) {
        // Handle mouse/touch move  
    },
    
    update() {
        // Main render loop
    }
};
```

---

## 🎵 Audio System Modifications

**When to use**: Adding new sound types or audio effects

**Agent**: General Purpose
**Files to modify**:
- `js/config.js` - add to `SOUND_TYPES` enum
- `js/audio.js` - update `AudioEngine.generateSoundBuffer()`
- `index.html` - add UI controls if needed

**Pattern to follow**:
```javascript
} else if (type === SOUND_TYPES.YOUR_SOUND) {
    // Generate your sound buffer here
    for (let i = 0; i < bufferSize; i++) {
        data[i] = /* your sound generation logic */;
    }
}
```

---

## 🎨 Styling & UI Changes

**When to use**: Visual updates, layout changes, responsive design

**Agent**: General Purpose
**Files to modify**:
- `css/styles.css` - All styling changes
- `index.html` - HTML structure changes

**CSS Organization**:
- Use the established section comments
- Follow mobile-first responsive approach
- Maintain consistent color palette and animations

---

## ⚙️ Configuration & Constants

**When to use**: Tuning app behavior, timers, visual effects

**Agent**: General Purpose
**Files to modify**:
- `js/config.js` - All configuration values

**Pattern to follow**:
```javascript
export const CONFIG = {
    YOUR_NEW_SETTING: 42,
    // Keep settings grouped by function
    AUDIO_SETTINGS: {
        VOLUME: 0.8,
        FADE_TIME: 1000
    }
};
```

---

## 🔧 Adding Parent-Configurable Settings

**When to use**: Adding new parent-controlled options (behavior patterns, visual settings, engagement options)

**Agent**: General Purpose
**Files to modify**:
- `js/config.js` - Add enum and default values
- `js/state.js` - Add to AppState
- `js/storage.js` - Update JSDoc for preferences
- `js/app.js` - Add change handlers and save functions
- `js/views/[view].js` - Implement setting in relevant views
- `index.html` - Add UI controls (typically in Advanced Options modal)

**Pattern to follow**:

**1. Add enum to config.js:**
```javascript
export const YOUR_SETTING = {
    OPTION1: 'option1',
    OPTION2: 'option2'
};

export const CONFIG = {
    DEFAULT_YOUR_SETTING: 'option1',
    // ... other settings
};
```

**2. Add to AppState in state.js:**
```javascript
export const AppState = {
    // ... existing state
    yourSetting: 'option1'
};
```

**3. Add change handler in app.js:**
```javascript
function changeYourSetting(value) {
    AppState.yourSetting = value;
    document.querySelectorAll('.your-btn').forEach(b => {
        b.classList.remove('selected');
        if (b.getAttribute('data-your') === value) b.classList.add('selected');
    });
    saveAllPreferences();
}
```

**4. Use in view files:**
```javascript
// In update() or init() methods
if (AppState.yourSetting === 'option1') {
    // Apply option 1 behavior
}
```

**Parent Access Pattern:**
- Simple settings: Start screen or Settings modal
- Advanced settings: "Advanced Options" modal accessible from both Start screen and Settings
- All settings saved to localStorage automatically
- Child never sees these UI controls during play

---

## 🔧 Sensory Dimmer System

**When to use**: Modifying progressive engagement phases or intensity settings

**Agent**: General Purpose
**Files to modify**:
- `js/config.js` - Add new phase ratios or intensity multipliers
- `js/sensory-dimmer.js` - Core dimmer logic and phase transitions
- `js/views/[view].js` - Add high-intensity mode support to views
- `js/audio.js` - Adjust volume and SFX for different phases
- `index.html` - Add UI controls if needed

**Pattern to follow**:

**1. Add high-intensity settings to config.js:**
```javascript
// High-intensity mode settings
HIGH_INTENSITY_PARTICLE_GOLDEN_CHANCE: 0.4,
HIGH_INTENSITY_VOLUME: 0.8,
HIGH_INTENSITY_SPEED_MULTIPLIER: 3.0,
```

**2. Check for high-intensity mode in views:**
```javascript
const isHighIntensity = AppState.sensoryDimmerMode !== 'off' && 
    AppState.currentEngagementPhase === 'high';

// Apply high-intensity behavior
if (isHighIntensity) {
    // Use enhanced settings
    const chance = CONFIG.HIGH_INTENSITY_PARTICLE_GOLDEN_CHANCE;
    const speed = baseSpeed * CONFIG.HIGH_INTENSITY_SPEED_MULTIPLIER;
}
```

**3. Phase-based behavior:**
```javascript
// Get current phase multipliers
const multipliers = SensoryDimmer.getPhaseMultipliers();
const volume = baseVolume * multipliers.volume;
const speed = baseSpeed * multipliers.speed;
```

**Phase System:**
- **High Phase** (33% of session): Maximum stimulation, chaos mode, bright effects
- **Medium Phase** (33% of session): Moderate stimulation, rhythm mode, fewer effects  
- **Low Phase** (34% of session): Calm stimulation, calm mode, minimal effects

**High-Intensity Features by View:**
- **Particles**: 4x spawn rate, rainbow/golden particles, screen flashes, connections
- **Bubbles**: 120 bubbles, 2.5x speed, glow effects, 16 particle explosions
- **Liquid**: 8 orbiting drops, rainbow trails, flash effects, constant ripples
- **Sorting**: 30 blocks, 2.5x speed, glow effects, expanded color palette
- **Marbles**: 80 marbles, 2x speed, rainbow marbles, enhanced collisions

**Parent Configuration:**
- Sensory Dimmer setting in Advanced Options (Auto/Off)
- Auto mode: Progressive phase transitions based on session duration
- Off mode: Manual control through existing behavior pattern settings

---

## 🐛 Debugging Issues

**When to use**: Runtime errors, unexpected behavior

**Agent**: General Purpose
**Debugging approach**:
1. Check browser console for specific errors
2. Verify imports/exports in affected modules
3. Check global function exposure in `js/app.js`
4. Ensure `index.html` references correct files

**Common issues**:
- **ReferenceError**: Missing global function or import
- **SyntaxError**: Invalid comment syntax or hidden characters
- **Module not found**: Incorrect file path in import statements

---

## 🧪 Testing New Features

**When to use**: Validating functionality after changes

**Agent**: General Purpose
**Test approach**:
1. Test on mobile devices (touch interactions)
2. Verify audio system works on different browsers
3. Check responsive behavior
4. Test session timer and sunset fade
5. Validate idle switching

**Browser testing**:
- Chrome/Safari (Desktop & Mobile)
- Firefox compatibility
- Edge compatibility

---

## 📦 Deployment & GitHub Pages

**When to use**: Publishing changes, production deployment

**Agent**: General Purpose
**Deployment process**:
1. Commit all changes to git
2. Push to main branch
3. GitHub Pages auto-deploys from `/docs` or `main` branch
4. Test live deployment

**File structure requirements**:
- All files must be in repository root or subdirectories
- No build process required
- ES6 modules supported by modern browsers

---

## 🔧 Performance Optimization

**When to use**: Slow animations, memory issues, battery drain

**Agent**: General Purpose
**Areas to optimize**:
1. **Canvas rendering**: Optimize `update()` loops
2. **Audio**: Buffer size and gain management
3. **Memory**: Proper cleanup in `resetApp()`
4. **Mobile**: Touch event throttling

**Optimization pattern**:
```javascript
// Example: Efficient entity management
update() {
    // Process visible entities only
    AppState.entities = AppState.entities.filter(entity => {
        return entity.life > 0 || entity.type === 'b';
    });
    
    // Batch DOM operations
    DOM.ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    // ... all drawing operations
}
```

---

## 📝 Code Quality Standards

**When to use**: All development tasks

**Agent**: General Purpose
**Standards**:
- ES6 modules with named exports
- JSDoc comments for public functions
- Consistent naming patterns (init, handle, update, spawn)
- No inline styles or scripts in HTML
- Modern JavaScript (no var, use const/let)

**File organization**:
- Single responsibility per file
- Clear import/export structure
- Logical grouping in `config.js`

---

## 🚨 Troubleshooting Checklist

**Before asking for help**:
1. ✅ Check browser console for specific errors
2. ✅ Verify all files saved and committed
3. ✅ Test in fresh browser tab (no cache)
4. ✅ Check import paths are correct
5. ✅ Verify global functions are exposed in `app.js`

**Information to provide**:
- Exact error message and line number
- What action triggered the error
- Browser/device being used
- Recent changes made

---

## 🔄 Migration from Single File

**When to use**: Converting old single-file approach

**Agent**: General Purpose
**Migration pattern**:
1. Extract CSS to `css/styles.css`
2. Split JavaScript into logical modules
3. Update HTML to use external files
4. Add proper imports/exports
5. Test thoroughly after each step

**Current directory structure**:
```
├── js/             # JavaScript modules
│   ├── app.js          # Main application entry point
│   ├── config.js       # Configuration constants and enums
│   ├── state.js        # Global state management
│   ├── storage.js      # LocalStorage utilities
│   ├── audio.js        # Audio engine and sound effects
│   ├── systems.js      # Timer, idle manager, view manager
│   ├── sensory-dimmer.js # Sensory dimmer system
│   ├── admin.js        # Admin/debug overlay
│   ├── utils.js        # Shared utility functions
│   └── views/          # Activity view modules
│       ├── particles.js
│       ├── bubbles.js
│       ├── sorting.js
│       ├── liquid.js
│       ├── marbles.js
│       └── [new views go here]
├── css/            # Stylesheets
│   └── styles.css       # All application styling
├── assets/         # Static assets
│   └── icon.png         # PWA icon
├── index.html      # Main HTML file
├── manifest.json   # PWA manifest
└── sw.js          # Service worker for offline support
```

**Benefits of current structure**:
- Easier code navigation
- Better team collaboration
- Cleaner git history
- Reduced merge conflicts
- Modern JavaScript practices
- Scalable organization for adding new activities
- **PWA-ready** with offline support

---

## 📱 PWA Features & Updates

**When to use**: Modifying PWA functionality, updating service worker, or adding new assets

**Agent**: General Purpose
**Files to modify**:
- `manifest.json` - PWA configuration, icons, display settings
- `sw.js` - Service worker for caching and offline behavior
- `index.html` - Service worker registration and manifest links

**Current PWA features**:
- ✅ Installable on Android/Chrome
- ✅ Add to Home Screen on iOS
- ✅ Offline functionality (all assets cached)
- ✅ Standalone display mode
- ✅ Custom theme colors

**Service Worker Cache Management**:
- All static assets are cached on install
- Network requests fall back to cache
- Navigate requests fallback to index.html
- Update cache by changing `CACHE_NAME` in `sw.js`

**Adding new files to cache**:
1. Add file paths to `STATIC_ASSETS` array in `sw.js`
2. Increment `CACHE_NAME` version to force cache update
3. Test offline functionality

---

This file should be updated as new patterns emerge or the codebase evolves. All development should follow these established patterns for consistency and maintainability.
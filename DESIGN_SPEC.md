# Parking Game - UI/UX Design Specification

## Visual Design System

### Color Palette
```css
/* Primary Colors */
--primary-blue: #3B82F6;      /* Main brand color */
--primary-dark: #1E40AF;      /* Hover states */
--primary-light: #60A5FA;     /* Active elements */

/* Game Colors */
--road-gray: #374151;          /* Road surface */
--parking-yellow: #FCD34D;     /* Parking lines */
--target-green: #10B981;       /* Target parking spot */
--danger-red: #EF4444;         /* Collision/danger */
--warning-orange: #F59E0B;     /* Close to collision */

/* UI Colors */
--background: #111827;         /* Dark background */
--surface: #1F2937;            /* Card backgrounds */
--surface-light: #374151;      /* Elevated surfaces */
--border: #4B5563;             /* Borders */

/* Text Colors */
--text-primary: #F9FAFB;       /* Main text */
--text-secondary: #D1D5DB;     /* Secondary text */
--text-muted: #9CA3AF;         /* Muted text */

/* Status Colors */
--success: #10B981;            /* Success states */
--error: #EF4444;              /* Error states */
--info: #3B82F6;               /* Info states */
```

### Typography Scale
```css
/* Font Family */
--font-display: 'Orbitron', monospace;  /* Game titles, scores */
--font-ui: 'Inter', sans-serif;         /* UI elements */
--font-mono: 'JetBrains Mono', monospace; /* Numbers, timers */

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Screen Designs

### 1. Main Menu Screen
```
┌─────────────────────────────────────┐
│                                     │
│         🚗 PARKING MASTER           │
│                                     │
│      ┌─────────────────────┐       │
│      │    START GAME       │       │
│      └─────────────────────┘       │
│                                     │
│      ┌─────────────────────┐       │
│      │    TUTORIAL         │       │
│      └─────────────────────┘       │
│                                     │
│      ┌─────────────────────┐       │
│      │    LEADERBOARD      │       │
│      └─────────────────────┘       │
│                                     │
│      ┌─────────────────────┐       │
│      │    SETTINGS         │       │
│      └─────────────────────┘       │
│                                     │
│         🔊  🎵  ℹ️                 │
└─────────────────────────────────────┘
```

**Components:**
- Animated title with car icon
- Large, touch-friendly buttons (min 48px height)
- Bottom toolbar with quick access icons
- Background: Subtle animated parking lot pattern
- GSAP animations: Staggered button entrance, hover scales

### 2. Level Selection Screen
```
┌─────────────────────────────────────┐
│  ← Back        LEVELS          ⚙️   │
├─────────────────────────────────────┤
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  01  │ │  02  │ │  03  │       │
│  │  ⭐⭐⭐ │ │  ⭐⭐☆ │ │  ⭐☆☆ │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  04  │ │  05  │ │  🔒  │       │
│  │  ⭐☆☆ │ │  ☆☆☆ │ │  06  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  [Progress Bar: 33% Complete]      │
│                                     │
└─────────────────────────────────────┘
```

**Features:**
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Star rating system for each level
- Locked/unlocked state visualization
- Progress indicator at bottom
- Preview image on hover/tap

### 3. Game Screen Layout
```
┌─────────────────────────────────────┐
│  Level 5  ⏱ 02:45  💯 850  ⏸️      │
├─────────────────────────────────────┤
│                                     │
│         [Game Canvas Area]          │
│                                     │
│      🚗 (Top-down car view)         │
│      ┌─────────────────┐           │
│      │ P A R K I N G   │           │
│      │                 │           │
│      └─────────────────┘           │
│                                     │
├─────────────────────────────────────┤
│     Speed: ▓▓▓░░░░  15 km/h       │
├─────────────────────────────────────┤
│         ↶  ⦿  ↷                    │
│      ┌─────────────┐               │
│      │  REVERSE  ⬇ │               │
│      └─────────────┘               │
│      ┌─────────────┐               │
│      │  FORWARD  ⬆ │               │
│      └─────────────┘               │
└─────────────────────────────────────┘
```

**HUD Elements:**
- Top bar: Level, Timer, Score, Pause button
- Speed indicator with visual bar
- Steering wheel (rotatable)
- Forward/Reverse buttons

### 4. Steering Control Design
```
     ╭───────────╮
    ╱             ╲
   │   ┌───────┐   │
   │   │   ↑   │   │  <- Grip indicator
   │   └───────┘   │
   │       ⦿       │  <- Center pivot
   │   ┌───────┐   │
   │   │   ↓   │   │  <- Grip indicator
   │   └───────┘   │
    ╲             ╱
     ╰───────────╯

Rotation: -180° to +180°
Visual feedback: Glow on touch
Haptic: Vibration at limits
```

### 5. Parking Accuracy Visualization
```
┌─────────────────────────┐
│  ╔═══════════════════╗  │
│  ║                   ║  │  <- Perfect zone (green)
│  ║  ┌─────────────┐  ║  │
│  ║  │    YOUR     │  ║  │  <- Car position
│  ║  │    CAR      │  ║  │
│  ║  └─────────────┘  ║  │
│  ║                   ║  │
│  ╚═══════════════════╝  │
│                         │
│  Accuracy: 92%          │
│  Angle: +3°             │
│  Distance: 0.2m         │
└─────────────────────────┘
```

## Component Hierarchy

### Main App Structure
```
App
├── Router
│   ├── MainMenu
│   ├── LevelSelect
│   ├── GameScreen
│   │   ├── HUD
│   │   ├── GameCanvas
│   │   │   ├── Car
│   │   │   ├── ParkingSpace
│   │   │   └── Obstacles
│   │   └── GameControls
│   │       ├── SteeringWheel
│   │       └── GearControls
│   ├── Tutorial
│   └── Settings
├── PauseMenu (Modal)
├── ResultScreen (Modal)
└── LoadingScreen
```

## Responsive Breakpoints

### Mobile (320px - 767px)
- Single column layouts
- Full-width controls
- Simplified HUD
- Touch-optimized buttons (min 44px)
- Portrait orientation priority

### Tablet (768px - 1023px)
- 2-column grids
- Larger game canvas
- Side-by-side controls possible
- Both orientations supported

### Desktop (1024px+)
- 3-4 column grids
- Maximum game canvas
- Keyboard controls enabled
- Mouse hover states
- Advanced HUD options

## Animation Specifications (GSAP)

### Menu Transitions
```javascript
// Page transition timeline
gsap.timeline()
  .to('.current-page', {
    opacity: 0,
    scale: 0.9,
    duration: 0.3,
    ease: 'power2.in'
  })
  .fromTo('.next-page',
    { opacity: 0, scale: 1.1 },
    { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
  );
```

### Control Feedback
```javascript
// Steering wheel rotation
gsap.to('.steering-wheel', {
  rotation: angle,
  duration: 0.1,
  ease: 'power2.out'
});

// Button press
gsap.to(button, {
  scale: 0.95,
  duration: 0.1,
  yoyo: true,
  repeat: 1
});
```

### Success Animation
```javascript
// Level complete sequence
gsap.timeline()
  .to('.car', {
    scale: 1.1,
    duration: 0.3
  })
  .to('.parking-space', {
    borderColor: '#10B981',
    boxShadow: '0 0 30px #10B981',
    duration: 0.5
  })
  .from('.success-message', {
    scale: 0,
    rotation: -180,
    duration: 0.5,
    ease: 'back.out(1.7)'
  });
```

## Level Progression Design

### Difficulty Parameters
1. **Level 1-3**: Basic Forward Parking
   - Large spaces (3x car width)
   - No obstacles
   - No time limit
   - Straight approach

2. **Level 4-6**: Angled Parking
   - Medium spaces (2x car width)
   - Static obstacles
   - Generous time limit
   - 45° angle parking

3. **Level 7-10**: Parallel Parking
   - Tight spaces (1.5x car length)
   - Cars on both sides
   - Time pressure
   - Parallel parking technique

4. **Level 11-13**: Complex Scenarios
   - Tight spaces (1.2x car size)
   - Multiple obstacles
   - Reverse parking
   - Limited visibility

5. **Level 14-15**: Master Challenges
   - Minimum clearance
   - Moving obstacles
   - Multi-point parking
   - Time trials

## Accessibility Features

### Visual
- High contrast mode option
- Colorblind-friendly palette
- Large text options
- Clear focus indicators

### Motor
- Adjustable control sensitivity
- One-handed mode
- Tap-to-hold options
- Customizable button layout

### Cognitive
- Tutorial mode
- Difficulty adjustment
- Visual parking guides
- No-pressure practice mode

## Performance Optimizations

### Rendering
- Use CSS transforms for animations
- GPU acceleration for canvas
- Lazy load level assets
- Optimize sprite sheets

### Mobile
- Touch event optimization
- Reduced particle effects option
- Battery saver mode
- Offline capability

## Sound Design (Optional)

### Effects
- Engine idle/acceleration
- Tire screech
- Collision bumps
- Success chimes
- UI clicks

### Music
- Menu: Calm, modern
- Gameplay: Minimal, focus-friendly
- Success: Upbeat celebration
- Failure: Gentle encouragement
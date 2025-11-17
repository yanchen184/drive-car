# Drive & Park - Educational Parking Game Planning Document

## Project Overview

**Project Name:** Drive & Park
**Type:** Web-based Educational Parking Game
**Technology Stack:** React + Vite + GSAP + Tailwind CSS
**Target Audience:** Driving learners and casual gamers
**Platform:** Responsive web application

### Core Objectives
- Teach proper parking techniques through gamification
- Provide progressive difficulty across 15 levels
- Create an engaging, physics-based driving experience
- Deploy as a publicly accessible web application

## Technical Architecture

### Frontend Architecture

```
src/
├── components/
│   ├── Game/
│   │   ├── GameCanvas.jsx        # Main game rendering area
│   │   ├── Car.jsx                # Car component with physics
│   │   ├── ParkingSpot.jsx        # Target parking area
│   │   └── Obstacles.jsx          # Environmental obstacles
│   ├── Controls/
│   │   ├── SteeringWheel.jsx      # Steering control component
│   │   ├── GearShift.jsx           # Forward/Reverse/Park controls
│   │   └── Dashboard.jsx           # Speed, angle, distance indicators
│   ├── UI/
│   │   ├── LevelSelector.jsx      # Level selection menu
│   │   ├── ScoreBoard.jsx         # Scoring and progress display
│   │   ├── Tutorial.jsx            # In-game hints and tutorials
│   │   └── Settings.jsx            # Game settings (sound, difficulty)
│   └── Layout/
│       ├── Header.jsx              # Game header with navigation
│       └── Footer.jsx              # Credits and links
├── hooks/
│   ├── useCarPhysics.js           # Car physics calculations
│   ├── useCollisionDetection.js   # Collision detection logic
│   ├── useGameState.js            # Game state management
│   └── useKeyboardControls.js     # Keyboard input handling
├── utils/
│   ├── physics/
│   │   ├── carDynamics.js         # Car movement physics
│   │   ├── collision.js           # Collision algorithms
│   │   └── steering.js            # Steering mechanics
│   ├── levels/
│   │   ├── levelData.js           # Level configurations
│   │   └── levelGenerator.js      # Dynamic level generation
│   └── scoring/
│       ├── scoreCalculator.js     # Score calculation logic
│       └── achievements.js        # Achievement system
├── assets/
│   ├── sprites/                   # Car and obstacle sprites
│   ├── sounds/                    # Sound effects
│   └── backgrounds/               # Level backgrounds
└── styles/
    ├── globals.css                 # Global styles with Tailwind
    └── animations.css              # GSAP animation classes
```

### State Management Strategy

**Context API + useReducer Pattern:**
- **GameContext:** Overall game state (current level, score, unlocked levels)
- **CarContext:** Car position, rotation, speed, gear
- **ControlContext:** User input state (steering angle, throttle)
- **SettingsContext:** User preferences (sound, controls mapping)

### Physics Engine Selection

**Matter.js** (Recommended)
- Lightweight (80kb gzipped)
- Built-in collision detection
- Good performance for 2D physics
- Easy integration with React

**Alternative: Custom Physics Engine**
- Simpler but requires manual collision detection
- Better control over car-specific behaviors
- Lighter weight for basic needs

## Game Mechanics

### Car Controls

#### Primary Controls
1. **Steering Wheel:**
   - Mouse drag or touch drag for rotation
   - Keyboard: A/D or Arrow keys
   - Realistic wheel rotation limits (-540° to +540°)

2. **Gear/Speed:**
   - Forward (W/Up Arrow)
   - Reverse (S/Down Arrow)
   - Brake (Space)
   - Handbrake (Shift) for advanced levels

#### Car Physics Parameters
```javascript
const carPhysics = {
  maxSpeed: 10,           // units per second
  acceleration: 2,        // units per second²
  deceleration: 3,       // natural slowdown
  brakeForce: 5,         // active braking
  turnRadius: 2,         // minimum turn radius
  wheelbase: 1.5,        // affects turning behavior
  friction: 0.95,        // ground friction coefficient
  mass: 1000,           // kg, affects momentum
}
```

### Collision Detection

**Collision Types:**
1. **Soft Collisions:** Minor bumps (score penalty)
2. **Hard Collisions:** Major crashes (level restart)
3. **Perfect Park:** No collisions (bonus points)

**Detection Methods:**
- SAT (Separating Axis Theorem) for polygon collision
- Bounding box pre-check for performance
- Distance-based sensor system for parking guidance

## Level Design

### Level Progression Structure

#### Beginner (Levels 1-5)
1. **Empty Lot Forward Parking** - No obstacles, wide space
2. **Simple Parallel Parking** - Single car, wide gap
3. **Angled Parking** - 45-degree angle slots
4. **Tight Forward Parking** - Narrower space with static cars
5. **Basic Reverse Parking** - Introduction to backing up

#### Intermediate (Levels 6-10)
6. **Parallel Parking Challenge** - Multiple cars, realistic gap
7. **Shopping Mall Parking** - Busy lot with pedestrians
8. **Hill Parking** - Incline/decline physics
9. **Time Trial Parking** - Speed bonus for quick parking
10. **Multi-Point Turn** - Tight space requiring K-turns

#### Advanced (Levels 11-15)
11. **Precision Parallel** - Minimal clearance (< 1.2x car length)
12. **Garage Parking** - Indoor with pillars and low ceiling
13. **Valet Challenge** - Multiple cars to park in sequence
14. **Weather Conditions** - Rain/snow affecting traction
15. **Master Challenge** - Combination of all skills, moving obstacles

### Success Criteria

```javascript
const scoringCriteria = {
  positioning: {
    perfect: 100,      // Within 5cm of center
    good: 70,         // Within 15cm
    acceptable: 40,   // Within 30cm
    poor: 10         // Parked but not centered
  },
  angle: {
    perfect: 50,      // Within 2° of ideal
    good: 30,        // Within 5°
    acceptable: 10   // Within 10°
  },
  collisions: {
    none: 50,        // No collisions
    minor: -10,      // Per soft collision
    major: -50       // Per hard collision
  },
  time: {
    fast: 30,        // Under par time
    normal: 15,      // Within par time
    slow: 0          // Over par time
  }
}
```

## Technology Choices

### Core Libraries

#### Required Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "matter-js": "^0.19.0",
    "gsap": "^3.12.0",
    "react-use": "^17.4.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

### Key Library Justifications

1. **Matter.js** - Physics engine for realistic car movement
2. **GSAP** - Smooth animations for UI transitions and effects
3. **React-use** - Utility hooks for keyboard, mouse, and touch events
4. **Zustand** - Lightweight state management (alternative to Context)
5. **Tailwind CSS** - Rapid UI development with utility classes

## Development Phases

### Phase 1: Foundation (Week 1)
- Set up React + Vite project
- Configure Tailwind CSS
- Implement basic car component
- Create steering wheel control
- Basic forward/reverse movement

### Phase 2: Core Mechanics (Week 2)
- Integrate Matter.js physics
- Implement collision detection
- Add parking spot detection
- Create scoring system
- Build first 3 levels

### Phase 3: Level Development (Week 3)
- Design and implement levels 4-10
- Add progressive difficulty
- Implement level unlock system
- Create level selection UI
- Add sound effects

### Phase 4: Polish & Advanced (Week 4)
- Implement levels 11-15
- Add GSAP animations
- Create tutorial system
- Implement achievements
- Mobile responsiveness optimization

### Phase 5: Testing & Deployment (Week 5)
- Comprehensive testing
- Performance optimization
- GitHub Pages setup
- CI/CD pipeline configuration
- Production deployment

## Key Technical Challenges

### 1. Realistic Car Physics
**Challenge:** Implementing believable car movement with proper weight transfer
**Solution:**
- Use Ackermann steering geometry
- Implement slip angle for realistic drifting
- Add momentum-based collision response

### 2. Smooth Controls on All Devices
**Challenge:** Consistent experience across mouse, touch, and keyboard
**Solution:**
- Unified input abstraction layer
- Touch gesture recognition for steering
- Haptic feedback on mobile devices

### 3. Performance Optimization
**Challenge:** Smooth 60fps gameplay on low-end devices
**Solution:**
- RequestAnimationFrame for render loop
- Object pooling for particles/effects
- Level-of-detail (LOD) system for complex scenes
- Web Workers for physics calculations

### 4. Accurate Collision Detection
**Challenge:** Pixel-perfect collision without performance hit
**Solution:**
- Spatial partitioning (quadtree)
- Broad-phase then narrow-phase detection
- Continuous collision detection for fast movements

## Deployment Strategy

### GitHub Pages Deployment

#### Build Configuration
```javascript
// vite.config.js
export default {
  base: '/drive-car/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
}
```

#### GitHub Actions Workflow
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Performance Targets
- **Lighthouse Score:** > 90 overall
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Bundle Size:** < 500kb gzipped
- **FPS:** Consistent 60fps gameplay

## Design System

### Color Palette
```css
:root {
  --primary: #3B82F6;      /* Blue - main actions */
  --secondary: #10B981;    /* Green - success */
  --danger: #EF4444;       /* Red - collisions */
  --warning: #F59E0B;      /* Yellow - warnings */
  --neutral: #6B7280;      /* Gray - UI elements */
  --background: #F3F4F6;   /* Light gray - game area */
}
```

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Risk Mitigation

### Technical Risks
1. **Physics Engine Performance**
   - Mitigation: Fallback to simpler physics on low-end devices

2. **Cross-browser Compatibility**
   - Mitigation: Progressive enhancement, feature detection

3. **Mobile Control Precision**
   - Mitigation: Adjustable sensitivity, visual guides

### Project Risks
1. **Scope Creep**
   - Mitigation: Strict MVP definition, feature freeze after Phase 3

2. **Level Design Complexity**
   - Mitigation: Procedural generation tools, reusable templates

---

**Document Version:** 1.0.0
**Last Updated:** 2024-11-16
**Next Review:** After Phase 1 completion
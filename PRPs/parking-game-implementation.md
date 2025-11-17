name: "Parking Game - Complete Implementation PRP"
description: |
  Complete implementation of educational parking game with Matter.js physics,
  15 progressive levels, realistic car controls, and comprehensive game mechanics.

---

## Goal
Build a fully functional web-based parking game where players learn proper parking techniques through 15 progressively challenging levels. The game must have realistic 2D car physics using Matter.js, responsive controls (keyboard/mouse/touch), scoring system, level progression, and smooth GSAP animations. The final product should be deployable to GitHub Pages and provide an engaging educational experience.

## Why
- **Educational Value**: Teach real-world parking skills in a safe, gamified environment
- **User Engagement**: Progressive difficulty keeps players motivated and challenged
- **Market Need**: Few browser-based parking games with realistic physics and educational focus
- **Portfolio Showcase**: Demonstrates advanced React patterns, physics integration, and game development skills
- **Accessibility**: Web-based means no downloads, cross-platform compatibility

## What
A complete parking game application with:

### User-Visible Features
- **Main Menu**: Animated menu with start game, tutorial, leaderboard, settings
- **15 Levels**: From basic forward parking (Level 1) to expert parallel parking with obstacles (Level 15)
- **Realistic Controls**:
  - Steering wheel (mouse/touch drag, keyboard arrows)
  - Gear selector (Forward/Reverse/Park)
  - Brake button
- **Game HUD**: Speed, time, score, accuracy meter, level info
- **Scoring System**: Star rating (1-3 stars) based on accuracy, time, collisions
- **Level Progression**: Unlock levels by completing previous ones
- **Visual Feedback**: Collision indicators, parking guides, success/failure animations

### Success Criteria
- [ ] All 15 levels are completable and progressively challenging
- [ ] Car physics feel realistic (steering, acceleration, braking)
- [ ] Game runs at 60 FPS on desktop, 30+ FPS on mobile
- [ ] Touch controls work smoothly on real mobile devices
- [ ] Scoring system accurately reflects parking quality
- [ ] Level progression saves to localStorage
- [ ] All UI animations are smooth and visually appealing
- [ ] Game builds successfully and deploys to GitHub Pages
- [ ] No console errors in production build
- [ ] Responsive design works on 320px to 1920px widths

---

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Core Technologies

- url: https://brm.io/matter-js/docs/
  section: Matter.Engine, Matter.World, Matter.Bodies, Matter.Events
  why: Learn physics engine setup, body creation, collision events
  critical: Matter.js uses fixed timestep - must use Matter.Engine.update() with delta time

- url: https://brm.io/matter-js/demo/
  demo: car
  why: See example car physics implementation with wheel constraints
  critical: Car bodies need compound shapes (chassis + wheels)

- url: https://greensock.com/docs/v3/GSAP
  section: gsap.to(), gsap.fromTo(), timeline(), cleanup
  why: Menu animations, level transitions, UI feedback
  critical: ALWAYS cleanup timelines in useEffect return to prevent memory leaks

- url: https://react.dev/reference/react/useRef
  why: Store Matter.js bodies without causing re-renders
  critical: Never store Matter.js objects in useState - causes performance issues

- url: https://react.dev/reference/react/useEffect
  section: cleanup functions
  why: Proper Matter.js world cleanup on unmount
  critical: Must remove all bodies and clear event listeners

- url: https://developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
  why: Implementing touch controls for mobile devices
  critical: Use preventDefault() to stop page scrolling during gameplay

- url: https://tailwindcss.com/docs/responsive-design
  why: Mobile-first responsive design patterns
  critical: Test on real devices, not just DevTools emulation

# Game Physics & Design

- url: https://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
  section: Steering, Acceleration, Friction
  why: Understand realistic car physics formulas
  critical: Use Ackermann steering geometry for realistic turning

- url: https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop/
  why: Fixed timestep game loop implementation
  critical: 60 FPS = 16.67ms per frame, use accumulator pattern

# Project-Specific Files

- file: parking-game/src/components/ui/MainMenu.jsx
  why: GSAP animation patterns, button click handlers, screen transitions
  pattern: gsap.fromTo with cleanup, staggered animations, refs array

- file: parking-game/src/components/controls/SteeringWheel.jsx
  why: Touch/mouse drag handling, angle calculations, spring-back animations
  pattern: useRef for DOM elements, global event listeners cleanup, GSAP elastic ease
  critical: Calculate center position on resize, normalize angles to -180 to 180

- file: parking-game/src/App.jsx
  why: Screen state management, component composition, game state structure
  pattern: useState for screens, lifted state for game data, conditional rendering

- file: parking-game/src/index.css
  why: CSS custom properties, Tailwind @layer components, design system
  pattern: CSS variables for colors, .btn classes, prevent touch-callout on mobile

# Design Specifications

- file: D:\claude mode\drive-car\DESIGN_SPEC.md
  why: Complete UI/UX specifications, color palette, typography, component layouts
  critical: Follow existing design system, maintain consistency

- file: D:\claude mode\drive-car\PLANNING.md
  why: Technical architecture, file structure, technology choices, project overview
  critical: Follow the defined component hierarchy and folder structure

- file: D:\claude mode\drive-car\TASK.md
  why: Development roadmap, task breakdown, priorities, timeline
  critical: Follow the 5-phase implementation plan

- file: D:\claude mode\drive-car\CLAUDE.md
  why: Development rules, code conventions, testing requirements, gotchas
  critical: Follow all coding standards, component structure, and testing guidelines
```

### Current Codebase Structure
```bash
parking-game/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── MainMenu.jsx          # ✅ Completed
│   │   │   ├── LevelSelect.jsx       # ✅ Completed (basic)
│   │   │   └── HUD.jsx               # ✅ Completed
│   │   ├── controls/
│   │   │   ├── SteeringWheel.jsx     # ✅ Completed
│   │   │   └── GearControls.jsx      # ✅ Completed
│   │   ├── game/                     # ❌ To be created
│   │   └── common/                   # ❌ To be created
│   ├── hooks/                        # ❌ Empty - to be created
│   ├── utils/                        # ❌ Empty - to be created
│   ├── data/                         # ❌ Empty - to be created
│   ├── contexts/                     # ❌ Empty - to be created
│   ├── App.jsx                       # ⚠️ Basic structure, needs game integration
│   ├── index.css                     # ✅ Completed
│   └── main.jsx                      # ✅ Completed
├── package.json                      # ⚠️ Missing Matter.js dependency
├── vite.config.js
└── tailwind.config.js                # ✅ Completed
```

### Desired Codebase Structure (Post-Implementation)
```bash
parking-game/
├── src/
│   ├── components/
│   │   ├── game/
│   │   │   ├── GameCanvas.jsx        # Main canvas with Matter.js renderer
│   │   │   ├── Car.jsx               # Car sprite overlay (visual only)
│   │   │   ├── ParkingSpot.jsx       # Target parking area visualization
│   │   │   ├── Obstacle.jsx          # Obstacle rendering
│   │   │   └── ParkingGuides.jsx     # Visual guides and alignment helpers
│   │   ├── ui/
│   │   │   ├── LevelComplete.jsx     # Level completion modal
│   │   │   ├── LevelFailed.jsx       # Failure screen
│   │   │   ├── PauseMenu.jsx         # Pause overlay
│   │   │   └── Tutorial.jsx          # Tutorial overlay for Level 1
│   │   └── common/
│   │       ├── Button.jsx            # Reusable button component
│   │       ├── Modal.jsx             # Modal wrapper
│   │       └── ProgressBar.jsx       # Progress indicator
│   ├── hooks/
│   │   ├── usePhysicsEngine.js       # Matter.js engine setup and lifecycle
│   │   ├── useCarPhysics.js          # Car body creation and control
│   │   ├── useCollisionDetection.js  # Collision event handling
│   │   ├── useGameLoop.js            # Fixed timestep game loop
│   │   ├── useKeyboardControls.js    # Keyboard input handling
│   │   └── useParkingValidation.js   # Check if car is properly parked
│   ├── utils/
│   │   ├── physics/
│   │   │   ├── carDynamics.js        # Car physics formulas (acceleration, steering)
│   │   │   ├── collisionFilters.js   # Matter.js collision categories
│   │   │   └── bodyFactory.js        # Create Matter.js bodies
│   │   ├── scoring/
│   │   │   ├── scoreCalculator.js    # Calculate score based on performance
│   │   │   └── starRating.js         # Determine 1-3 star rating
│   │   ├── storage/
│   │   │   └── gameStorage.js        # localStorage helpers for progress
│   │   └── helpers/
│   │       ├── math.js               # Math utilities (angle normalization, etc.)
│   │       └── validation.js         # Input validation helpers
│   ├── data/
│   │   ├── levels/
│   │   │   ├── level01.json          # Level 1 configuration
│   │   │   ├── level02.json          # Level 2 configuration
│   │   │   └── ... (up to level15.json)
│   │   ├── levelSchema.js            # Level data structure definition
│   │   └── constants.js              # Game constants (car size, speeds, etc.)
│   ├── contexts/
│   │   ├── GameContext.jsx           # Game state (current level, score, etc.)
│   │   └── SettingsContext.jsx       # User settings (sound, controls)
│   └── assets/
│       ├── sprites/
│       │   └── car.svg               # Simple car sprite
│       └── sounds/                   # (Optional - Phase 3)
│           ├── engine.mp3
│           └── collision.mp3
```

### Known Gotchas & Library Quirks
```javascript
// CRITICAL: Matter.js Body Management in React
// ❌ NEVER do this - causes re-renders and performance issues:
const [carBody, setCarBody] = useState(Bodies.rectangle(...));

// ✅ ALWAYS do this - use refs for Matter.js objects:
const carBodyRef = useRef(null);
useEffect(() => {
  carBodyRef.current = Bodies.rectangle(...);
  World.add(engineRef.current.world, carBodyRef.current);

  return () => {
    World.remove(engineRef.current.world, carBodyRef.current);
  };
}, []);

// CRITICAL: GSAP Timeline Cleanup
// ❌ Memory leak - timeline keeps running after unmount:
useEffect(() => {
  const tl = gsap.timeline();
  tl.to('.element', { x: 100 });
}, []);

// ✅ Proper cleanup:
useEffect(() => {
  const tl = gsap.timeline();
  tl.to('.element', { x: 100 });

  return () => {
    tl.kill(); // Kill timeline on unmount
  };
}, []);

// CRITICAL: Touch Event preventDefault
// Without this, mobile page scrolls during gameplay:
const handleTouchMove = (e) => {
  e.preventDefault(); // MUST prevent default
  // ... handle touch
};
// Must use { passive: false } when adding listener:
element.addEventListener('touchmove', handleTouchMove, { passive: false });

// CRITICAL: Matter.js Fixed Timestep
// ❌ Variable timestep - physics inconsistent across devices:
const gameLoop = () => {
  Engine.update(engine); // Uses real elapsed time
  requestAnimationFrame(gameLoop);
};

// ✅ Fixed timestep - consistent physics:
const FPS = 60;
const TIMESTEP = 1000 / FPS; // 16.67ms
let accumulator = 0;
let lastTime = performance.now();

const gameLoop = (currentTime) => {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  accumulator += deltaTime;

  while (accumulator >= TIMESTEP) {
    Engine.update(engine, TIMESTEP); // Fixed timestep
    accumulator -= TIMESTEP;
  }

  requestAnimationFrame(gameLoop);
};

// CRITICAL: Canvas DPI Scaling
// Without this, canvas looks blurry on high-DPI displays:
const setupCanvas = (canvas) => {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
};

// CRITICAL: Car Body Compound Shape
// Simple rectangle doesn't match car visual well:
const createCar = () => {
  // ✅ Use compound body for better collision:
  const carBody = Body.create({
    parts: [
      Bodies.rectangle(x, y, width, height * 0.6), // Main chassis
      Bodies.rectangle(x, y - height * 0.2, width * 0.7, height * 0.4) // Cabin
    ],
    frictionAir: 0.02, // Important for realistic deceleration
    friction: 0.1,
    restitution: 0.1 // Low bounce
  });
  return carBody;
};

// CRITICAL: localStorage Quota Exceeded
// Always wrap in try-catch:
const saveProgress = (data) => {
  try {
    localStorage.setItem('parkingGame_progress', JSON.stringify(data));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, clearing old data');
      // Clear non-essential data or show user warning
    }
  }
};

// GOTCHA: React 19 Features
// This project uses React 19 (see package.json)
// Be aware of breaking changes from React 18:
// - No need for ReactDOM.render wrapper anymore
// - useEffect cleanup runs more strictly
// - Automatic batching is more aggressive

// GOTCHA: Vite Asset Imports
// ❌ Won't work in Vite:
import carImage from './car.png';

// ✅ Correct way:
import carImage from './car.png?url'; // or
const carImage = new URL('./car.png', import.meta.url).href;

// GOTCHA: Matter.js Collision Categories
// Use proper bit masks for collision filtering:
const CATEGORY = {
  CAR: 0x0001,
  OBSTACLE: 0x0002,
  PARKING_ZONE: 0x0004,
  WALL: 0x0008
};

const carBody = Bodies.rectangle(x, y, w, h, {
  collisionFilter: {
    category: CATEGORY.CAR,
    mask: CATEGORY.OBSTACLE | CATEGORY.WALL // Car collides with these
  }
});

const parkingZone = Bodies.rectangle(x, y, w, h, {
  isSensor: true, // No physical collision, just detect overlap
  collisionFilter: {
    category: CATEGORY.PARKING_ZONE,
    mask: CATEGORY.CAR
  }
});
```

---

## Implementation Blueprint

### Phase 1: Foundation (Week 1) - Core Infrastructure

#### Task 1: Install Dependencies and Setup
```yaml
INSTALL package matter-js:
  command: npm install matter-js
  why: Physics engine for car and collision simulation

UPDATE package.json scripts:
  ADD: "test": "vitest run"
  ADD: "test:watch": "vitest"
  why: Prepare for testing infrastructure (Phase 2)

CREATE .env.example:
  content: |
    VITE_APP_NAME=Parking Master
    VITE_DEBUG_MODE=false
  why: Template for environment configuration
```

#### Task 2: Create Game Constants and Data Structures
```yaml
CREATE src/data/constants.js:
  PATTERN: Export named constants in UPPER_SNAKE_CASE
  INCLUDE:
    - CAR_WIDTH = 40 (pixels)
    - CAR_HEIGHT = 60 (pixels)
    - MAX_SPEED_FORWARD = 30 (pixels/frame)
    - MAX_SPEED_REVERSE = 15
    - ACCELERATION = 0.5
    - BRAKE_FORCE = 1.5
    - STEERING_ANGLE_MAX = 30 (degrees)
    - FRICTION_AIR = 0.02
    - COLLISION_CATEGORIES (bit masks)

CREATE src/data/levelSchema.js:
  DEFINE LevelConfig interface/JSDoc:
    - levelNumber: number
    - title: string
    - difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    - parkingSpot: { x, y, width, height, angle }
    - obstacles: Array<{ type, x, y, width, height, angle }>
    - carStartPosition: { x, y, angle }
    - timeLimit: number (seconds, null = no limit)
    - par: { time: number, accuracy: number, collisions: number }
    - hints: string[]
  INCLUDE: validateLevel(levelConfig) function

CREATE src/data/levels/level01.json:
  EXAMPLE first level config:
    {
      "levelNumber": 1,
      "title": "Empty Lot - Forward Parking",
      "difficulty": "beginner",
      "parkingSpot": { "x": 400, "y": 300, "width": 80, "height": 120, "angle": 0 },
      "obstacles": [],
      "carStartPosition": { "x": 200, "y": 300, "angle": 0 },
      "timeLimit": null,
      "par": { "time": 30, "accuracy": 90, "collisions": 0 },
      "hints": ["Drive forward slowly", "Align with the parking lines", "Stop when centered"]
    }
```

**Pseudocode for Task 2:**
```javascript
// src/data/constants.js
export const CAR = {
  WIDTH: 40,
  HEIGHT: 60,
  MAX_SPEED: {
    FORWARD: 30,
    REVERSE: 15
  },
  ACCELERATION: 0.5,
  BRAKE_FORCE: 1.5,
  FRICTION_AIR: 0.02,
  STEERING_MAX: 30 // degrees
};

export const COLLISION_CATEGORY = {
  CAR: 0x0001,
  OBSTACLE: 0x0002,
  PARKING_ZONE: 0x0004,
  WALL: 0x0008,
  SENSOR: 0x0010
};

export const SCORING = {
  STAR_THRESHOLDS: {
    THREE_STAR: 85, // Total score >= 85
    TWO_STAR: 70,
    ONE_STAR: 50
  },
  WEIGHTS: {
    ACCURACY: 0.5,    // 50% of score
    TIME: 0.3,        // 30% of score
    COLLISIONS: 0.2   // 20% of score
  }
};

// src/data/levelSchema.js
/**
 * Validates level configuration data
 * @param {Object} level - Level configuration object
 * @returns {boolean} True if valid, throws error if invalid
 */
export const validateLevel = (level) => {
  if (!level.levelNumber || level.levelNumber < 1 || level.levelNumber > 15) {
    throw new Error('Invalid level number');
  }

  if (!level.parkingSpot || typeof level.parkingSpot !== 'object') {
    throw new Error('Missing or invalid parkingSpot');
  }

  // PATTERN: Validate all required fields
  const requiredFields = ['x', 'y', 'width', 'height', 'angle'];
  requiredFields.forEach(field => {
    if (!(field in level.parkingSpot)) {
      throw new Error(`parkingSpot missing required field: ${field}`);
    }
  });

  return true;
};
```

#### Task 3: Create Physics Engine Hook
```yaml
CREATE src/hooks/usePhysicsEngine.js:
  MIRROR pattern from: SteeringWheel.jsx useEffect cleanup
  PURPOSE: Initialize Matter.js engine, handle lifecycle
  EXPORTS: { engineRef, worldRef, isRunning, start, stop, cleanup }
  CRITICAL:
    - Use useRef for engine and world (never useState)
    - Set fixed timestep (16.67ms for 60 FPS)
    - Cleanup on unmount (Engine.clear, World.clear)
    - Disable gravity (2D top-down view)
```

**Pseudocode for Task 3:**
```javascript
// src/hooks/usePhysicsEngine.js
import { useRef, useEffect, useState } from 'react';
import { Engine, World, Events } from 'matter-js';

/**
 * Custom hook for Matter.js physics engine lifecycle
 * @param {Object} options - Configuration options
 * @returns {Object} Engine refs and control functions
 */
const usePhysicsEngine = (options = {}) => {
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    // CRITICAL: Create engine with gravity disabled (top-down view)
    engineRef.current = Engine.create({
      gravity: { x: 0, y: 0, scale: 0 },
      enableSleeping: false, // Prevent bodies from sleeping
      ...options
    });

    worldRef.current = engineRef.current.world;

    // PATTERN: Cleanup on unmount
    return () => {
      if (engineRef.current) {
        // Remove all bodies
        World.clear(worldRef.current, false);
        // Clear engine
        Engine.clear(engineRef.current);
        engineRef.current = null;
        worldRef.current = null;
      }
    };
  }, []);

  const start = () => setIsRunning(true);
  const stop = () => setIsRunning(false);

  const cleanup = () => {
    // Manual cleanup if needed before unmount
    if (worldRef.current) {
      World.clear(worldRef.current, false);
    }
  };

  return {
    engineRef,
    worldRef,
    isRunning,
    start,
    stop,
    cleanup
  };
};

export default usePhysicsEngine;
```

#### Task 4: Create Game Loop Hook
```yaml
CREATE src/hooks/useGameLoop.js:
  REFERENCE: https://codeincomplete.com/articles/javascript-game-foundations-the-game-loop/
  PURPOSE: Fixed timestep game loop with Matter.js integration
  PATTERN: Accumulator pattern for consistent physics
  EXPORTS: { startLoop, stopLoop, fps }
  CRITICAL:
    - 60 FPS target (16.67ms timestep)
    - Use requestAnimationFrame
    - Accumulator prevents spiral of death
    - Update physics in while loop with fixed delta
```

**Pseudocode for Task 4:**
```javascript
// src/hooks/useGameLoop.js
import { useEffect, useRef } from 'react';
import { Engine } from 'matter-js';

const FPS = 60;
const TIMESTEP = 1000 / FPS; // 16.67ms

/**
 * Fixed timestep game loop hook
 * @param {Object} engineRef - Matter.js engine ref from usePhysicsEngine
 * @param {Function} onUpdate - Callback for each frame (for rendering)
 * @param {boolean} isActive - Whether loop should be running
 */
const useGameLoop = (engineRef, onUpdate, isActive) => {
  const frameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const accumulatorRef = useRef(0);

  useEffect(() => {
    if (!isActive || !engineRef.current) return;

    const gameLoop = (currentTime) => {
      // Calculate delta time
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Add to accumulator
      accumulatorRef.current += deltaTime;

      // CRITICAL: Fixed timestep updates
      // Update physics in chunks of TIMESTEP
      while (accumulatorRef.current >= TIMESTEP) {
        // Update Matter.js engine with fixed timestep
        Engine.update(engineRef.current, TIMESTEP);
        accumulatorRef.current -= TIMESTEP;
      }

      // Render frame (variable timestep OK for rendering)
      if (onUpdate) {
        onUpdate(deltaTime);
      }

      // Continue loop
      frameIdRef.current = requestAnimationFrame(gameLoop);
    };

    // Start loop
    frameIdRef.current = requestAnimationFrame(gameLoop);

    // PATTERN: Cleanup on unmount or when inactive
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
    };
  }, [isActive, engineRef, onUpdate]);
};

export default useGameLoop;
```

---

### Phase 2: Core Game Mechanics (Week 2)

#### Task 5: Create Car Physics Hook
```yaml
CREATE src/hooks/useCarPhysics.js:
  PURPOSE: Car body creation, steering, acceleration control
  REFERENCE: https://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html
  EXPORTS: { carBodyRef, steer, accelerate, brake, reset }
  PATTERN: Use compound body (see Known Gotchas)
  CRITICAL:
    - Ackermann steering geometry for realistic turning
    - Apply forces at body center of mass
    - Handle forward/reverse gear switching
    - Reset function to restart level
```

**Pseudocode for Task 5:**
```javascript
// src/hooks/useCarPhysics.js
import { useRef, useEffect } from 'react';
import { Bodies, Body, World } from 'matter-js';
import { CAR, COLLISION_CATEGORY } from '../data/constants';

const useCarPhysics = (worldRef, startPosition) => {
  const carBodyRef = useRef(null);
  const currentGearRef = useRef('P'); // P, D, R
  const speedRef = useRef(0);
  const steeringAngleRef = useRef(0);

  useEffect(() => {
    if (!worldRef.current) return;

    // CRITICAL: Compound body for better collision shape
    const { x, y, angle } = startPosition;

    carBodyRef.current = Body.create({
      parts: [
        Bodies.rectangle(x, y, CAR.WIDTH, CAR.HEIGHT * 0.6),
        Bodies.rectangle(x, y - CAR.HEIGHT * 0.2, CAR.WIDTH * 0.7, CAR.HEIGHT * 0.4)
      ],
      frictionAir: CAR.FRICTION_AIR,
      friction: 0.1,
      restitution: 0.1,
      angle: angle * (Math.PI / 180),
      collisionFilter: {
        category: COLLISION_CATEGORY.CAR,
        mask: COLLISION_CATEGORY.OBSTACLE | COLLISION_CATEGORY.WALL
      }
    });

    World.add(worldRef.current, carBodyRef.current);

    return () => {
      if (carBodyRef.current && worldRef.current) {
        World.remove(worldRef.current, carBodyRef.current);
      }
    };
  }, [worldRef, startPosition]);

  /**
   * Steer the car
   * @param {number} normalizedAngle - Steering input from -1 to 1
   */
  const steer = (normalizedAngle) => {
    // PATTERN: Ackermann steering - turning radius based on speed
    steeringAngleRef.current = normalizedAngle * CAR.STEERING_MAX;

    if (!carBodyRef.current) return;

    // Apply angular velocity based on steering and speed
    const turnRate = steeringAngleRef.current * (speedRef.current / CAR.MAX_SPEED.FORWARD);
    Body.setAngularVelocity(carBodyRef.current, turnRate * 0.05);
  };

  /**
   * Accelerate or reverse
   * @param {string} gear - 'D', 'R', or 'P'
   */
  const accelerate = (gear) => {
    currentGearRef.current = gear;

    if (!carBodyRef.current || gear === 'P') {
      speedRef.current = 0;
      return;
    }

    const maxSpeed = gear === 'D' ? CAR.MAX_SPEED.FORWARD : CAR.MAX_SPEED.REVERSE;
    const direction = gear === 'D' ? 1 : -1;

    // Calculate forward direction based on car rotation
    const angle = carBodyRef.current.angle;
    const forceX = Math.sin(angle) * CAR.ACCELERATION * direction;
    const forceY = -Math.cos(angle) * CAR.ACCELERATION * direction;

    // Apply force
    Body.applyForce(carBodyRef.current, carBodyRef.current.position, {
      x: forceX,
      y: forceY
    });

    // Update speed tracking
    const velocity = carBodyRef.current.velocity;
    speedRef.current = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  };

  const brake = () => {
    if (!carBodyRef.current) return;

    // Apply opposite force to slow down
    const velocity = carBodyRef.current.velocity;
    const brakeForceX = -velocity.x * CAR.BRAKE_FORCE;
    const brakeForceY = -velocity.y * CAR.BRAKE_FORCE;

    Body.applyForce(carBodyRef.current, carBodyRef.current.position, {
      x: brakeForceX,
      y: brakeForceY
    });

    speedRef.current = Math.max(0, speedRef.current - CAR.BRAKE_FORCE);
  };

  const reset = () => {
    if (!carBodyRef.current) return;

    Body.setPosition(carBodyRef.current, startPosition);
    Body.setAngle(carBodyRef.current, startPosition.angle * (Math.PI / 180));
    Body.setVelocity(carBodyRef.current, { x: 0, y: 0 });
    Body.setAngularVelocity(carBodyRef.current, 0);

    speedRef.current = 0;
    currentGearRef.current = 'P';
  };

  return {
    carBodyRef,
    steer,
    accelerate,
    brake,
    reset,
    getCurrentSpeed: () => speedRef.current,
    getCurrentGear: () => currentGearRef.current
  };
};

export default useCarPhysics;
```

#### Task 6: Create GameCanvas Component
```yaml
CREATE src/components/game/GameCanvas.jsx:
  PURPOSE: Main game rendering canvas with Matter.js integration
  PATTERN: useRef for canvas element, render loop separate from physics
  INTEGRATE:
    - usePhysicsEngine hook
    - useGameLoop hook
    - useCarPhysics hook
  RENDER:
    - Car body outline
    - Obstacles
    - Parking spot
    - Background grid
  CRITICAL:
    - Canvas DPI scaling (see Known Gotchas)
    - Clear canvas each frame
    - Render visual car sprite overlaid on physics body
```

#### Task 7: Create Collision Detection Hook
```yaml
CREATE src/hooks/useCollisionDetection.js:
  PURPOSE: Listen to Matter.js collision events
  USE: Matter.Events.on(engine, 'collisionStart', handler)
  TRACK:
    - Total collisions count
    - Collision severity (based on impact velocity)
    - Last collision timestamp
  EXPORTS: { collisionCount, lastCollision, resetCollisions }
  CRITICAL:
    - Remove event listeners on cleanup
    - Ignore sensor collisions (parking zone detection)
```

#### Task 8: Create Parking Validation Hook
```yaml
CREATE src/hooks/useParkingValidation.js:
  PURPOSE: Check if car is correctly parked
  VALIDATION CRITERIA:
    - Car position within parking spot bounds (tolerance ±5px)
    - Car angle aligned with parking spot angle (tolerance ±3°)
    - Car speed below threshold (< 1px/frame)
    - Must maintain valid parking for 1 second
  EXPORTS: { isParkingValid, parkingAccuracy, checkParking }
  PATTERN: Use interval to check every 100ms while in zone
```

**Pseudocode for Task 8:**
```javascript
// src/hooks/useParkingValidation.js
import { useState, useCallback, useRef } from 'react';
import { Body } from 'matter-js';

const POSITION_TOLERANCE = 5; // pixels
const ANGLE_TOLERANCE = 3; // degrees
const SPEED_THRESHOLD = 1; // pixels/frame
const VALID_DURATION = 1000; // 1 second in ms

/**
 * Validates if car is properly parked
 */
const useParkingValidation = (carBodyRef, parkingSpot) => {
  const [isParkingValid, setIsParkingValid] = useState(false);
  const [parkingAccuracy, setParkingAccuracy] = useState(0);
  const validStartTimeRef = useRef(null);

  const checkParking = useCallback(() => {
    if (!carBodyRef.current || !parkingSpot) {
      return { isValid: false, accuracy: 0 };
    }

    const car = carBodyRef.current;
    const carPos = car.position;
    const carAngle = car.angle * (180 / Math.PI);
    const carVelocity = car.velocity;
    const carSpeed = Math.sqrt(carVelocity.x ** 2 + carVelocity.y ** 2);

    // Calculate position error
    const posError = Math.sqrt(
      (carPos.x - parkingSpot.x) ** 2 +
      (carPos.y - parkingSpot.y) ** 2
    );

    // Calculate angle error
    let angleError = Math.abs(carAngle - parkingSpot.angle);
    if (angleError > 180) angleError = 360 - angleError;

    // Check all criteria
    const positionValid = posError <= POSITION_TOLERANCE;
    const angleValid = angleError <= ANGLE_TOLERANCE;
    const speedValid = carSpeed < SPEED_THRESHOLD;

    // Calculate accuracy percentage (0-100)
    const posAccuracy = Math.max(0, 100 - (posError / POSITION_TOLERANCE) * 50);
    const angleAccuracy = Math.max(0, 100 - (angleError / ANGLE_TOLERANCE) * 50);
    const accuracy = (posAccuracy + angleAccuracy) / 2;

    const isValid = positionValid && angleValid && speedValid;

    // Track how long parking has been valid
    if (isValid) {
      if (!validStartTimeRef.current) {
        validStartTimeRef.current = Date.now();
      }

      const duration = Date.now() - validStartTimeRef.current;

      if (duration >= VALID_DURATION) {
        setIsParkingValid(true);
        setParkingAccuracy(accuracy);
      }
    } else {
      validStartTimeRef.current = null;
      setIsParkingValid(false);
    }

    return { isValid, accuracy, posError, angleError, carSpeed };
  }, [carBodyRef, parkingSpot]);

  return {
    isParkingValid,
    parkingAccuracy,
    checkParking
  };
};

export default useParkingValidation;
```

---

### Phase 3: Level System & UI (Week 3)

#### Task 9: Create Remaining 14 Level Configurations
```yaml
CREATE src/data/levels/level02.json through level15.json:
  DIFFICULTY PROGRESSION:
    - Levels 1-5: Beginner (large spots, no obstacles, unlimited time)
    - Levels 6-10: Intermediate (angled parking, tight spaces, time limits)
    - Levels 11-15: Advanced (parallel parking, multiple obstacles, weather effects)

  EXAMPLE Level 5 (Reverse Parking):
    {
      "levelNumber": 5,
      "title": "Reverse Bay Parking",
      "difficulty": "beginner",
      "parkingSpot": { "x": 400, "y": 200, "width": 80, "height": 120, "angle": 90 },
      "obstacles": [
        { "type": "wall", "x": 400, "y": 100, "width": 200, "height": 10, "angle": 0 },
        { "type": "car", "x": 480, "y": 200, "width": 70, "height": 110, "angle": 90 }
      ],
      "carStartPosition": { "x": 400, "y": 500, "angle": 0 },
      "timeLimit": 90,
      "par": { "time": 45, "accuracy": 85, "collisions": 0 },
      "hints": ["Align with parking spot", "Use mirrors", "Reverse slowly"]
    }
```

#### Task 10: Create Game Context
```yaml
CREATE src/contexts/GameContext.jsx:
  PURPOSE: Global game state management
  STATE:
    - currentLevel: number
    - levelProgress: Array<{ levelNumber, stars, bestScore, unlocked }>
    - totalScore: number
    - settings: { soundEnabled, musicEnabled }
  ACTIONS:
    - setLevel(levelNumber)
    - completeLevel(levelNumber, score, stars)
    - unlockNextLevel()
    - loadProgress() / saveProgress()
  PATTERN: Context + useReducer for complex state
  CRITICAL: Persist to localStorage on every state change
```

#### Task 11: Create Score Calculator Utility
```yaml
CREATE src/utils/scoring/scoreCalculator.js:
  PURPOSE: Calculate final score based on performance metrics
  FORMULA:
    totalScore = (accuracyScore * 0.5) + (timeScore * 0.3) + (collisionScore * 0.2)
    - accuracyScore: 0-100 based on parking precision
    - timeScore: 0-100 based on time vs par time
    - collisionScore: 0-100 based on collision count (0 = 100, 1 = 75, 2 = 50, 3+ = 0)
  EXPORTS: calculateScore(accuracy, timeTaken, collisions, par)

CREATE src/utils/scoring/starRating.js:
  PURPOSE: Convert total score to 1-3 stars
  THRESHOLDS: 85+ = 3 stars, 70+ = 2 stars, 50+ = 1 star
  EXPORTS: getStarRating(totalScore)
```

#### Task 12: Create LevelComplete and LevelFailed Modals
```yaml
CREATE src/components/ui/LevelComplete.jsx:
  PATTERN: Follow MainMenu.jsx GSAP animation style
  DISPLAY:
    - Star rating (animated reveal)
    - Score breakdown (accuracy, time, collisions)
    - Buttons: Next Level, Retry, Home
  ANIMATIONS:
    - Scale in with bounce
    - Stagger star animations
    - Confetti effect (optional, CSS animation)

CREATE src/components/ui/LevelFailed.jsx:
  DISPLAY:
    - Failure reason (time out, too many collisions)
    - Current stats
    - Buttons: Retry, Home
  ANIMATIONS: Fade in with slight shake
```

#### Task 13: Integrate Game Logic in App.jsx
```yaml
MODIFY src/App.jsx:
  ADD states:
    - gameState: 'menu' | 'playing' | 'paused' | 'complete' | 'failed'
    - currentLevel: from GameContext
    - levelData: loaded from JSON

  MODIFY game screen:
    - Replace placeholder with <GameCanvas />
    - Connect controls to car physics
    - Add timer countdown
    - Show LevelComplete on parking success
    - Show LevelFailed on timeout or 5+ collisions

  PATTERN: Lift state up, pass callbacks down
  CRITICAL:
    - Load level data on mount
    - Cleanup physics engine on level exit
    - Save progress immediately on level complete
```

---

### Phase 4: Polish & Enhancement (Week 4)

#### Task 14: Add Tutorial Overlay for Level 1
```yaml
CREATE src/components/ui/Tutorial.jsx:
  DISPLAY: Step-by-step guide overlay
  STEPS:
    1. "Welcome! Use the steering wheel to turn"
    2. "Press Forward to move the car"
    3. "Park within the yellow lines"
  PATTERN: GSAP fade transitions between steps
  CLOSE: Dismiss button or auto-hide after showing all steps
```

#### Task 15: Add Pause Menu
```yaml
CREATE src/components/ui/PauseMenu.jsx:
  TRIGGER: Pause button in HUD
  DISPLAY:
    - Current level stats
    - Buttons: Resume, Restart, Settings, Home
  CRITICAL: Stop physics engine when paused, resume on unpause
```

#### Task 16: Enhance Visual Feedback
```yaml
MODIFY src/components/game/GameCanvas.jsx:
  ADD visual indicators:
    - Collision flash (red overlay on car when hit)
    - Parking zone color change (yellow → green when valid)
    - Tire tracks (canvas trail effect)
    - Speedometer needle animation

  ANIMATIONS:
    - Car entrance (drive in from off-screen at level start)
    - Success particle burst when parked
    - Failure smoke/sparks on collision
```

#### Task 17: Add Sound Effects (Optional)
```yaml
CREATE src/utils/audio/soundManager.js:
  SOUNDS:
    - engine.mp3 (loop while moving)
    - brake.mp3 (on brake)
    - collision.mp3 (on impact)
    - success.mp3 (on level complete)

  CRITICAL:
    - Respect settings.soundEnabled from context
    - Preload all sounds
    - Web Audio API for better control
```

---

### Phase 5: Testing & Deployment (Week 5)

#### Task 18: Cross-Device Testing
```yaml
TEST on real devices:
  MOBILE:
    - [ ] iPhone (iOS Safari)
    - [ ] Android (Chrome)
    - [ ] Touch controls responsive
    - [ ] No page scroll during gameplay
    - [ ] FPS >= 30

  TABLET:
    - [ ] iPad (Safari)
    - [ ] Android tablet
    - [ ] Hybrid controls work

  DESKTOP:
    - [ ] Chrome, Firefox, Safari, Edge
    - [ ] Keyboard controls responsive
    - [ ] FPS = 60
    - [ ] Mouse drag works
```

#### Task 19: Performance Optimization
```yaml
OPTIMIZE bundle size:
  - [ ] Run `npm run build`
  - [ ] Check dist/ size (target < 500KB gzipped)
  - [ ] Use Vite build analyzer: npm install -D rollup-plugin-visualizer
  - [ ] Lazy load level JSON files
  - [ ] Tree-shake unused Matter.js modules

OPTIMIZE runtime:
  - [ ] Profile with React DevTools Profiler
  - [ ] Memoize expensive calculations
  - [ ] Use useMemo for level data parsing
  - [ ] Debounce resize events
```

#### Task 20: Setup GitHub Actions Deployment
```yaml
CREATE .github/workflows/deploy.yml:
  CONTENT:
    name: Deploy to GitHub Pages
    on:
      push:
        branches: [ main ]
    jobs:
      build-deploy:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - uses: actions/setup-node@v3
            with:
              node-version: '18'
          - name: Install and Build
            working-directory: ./parking-game
            run: |
              npm ci
              npm run build
          - name: Deploy
            uses: peaceiris/actions-gh-pages@v3
            with:
              github_token: ${{ secrets.GITHUB_TOKEN }}
              publish_dir: ./parking-game/dist

MODIFY parking-game/vite.config.js:
  ADD:
    export default defineConfig({
      base: '/drive-car/', // Match your repo name
      plugins: [react()],
      build: {
        outDir: 'dist',
        sourcemap: false
      }
    });

CREATE parking-game/dist/404.html:
  CONTENT: Copy of index.html for SPA routing
```

---

## Validation Loop

### Level 1: Syntax & Build
```bash
# Run from parking-game/ directory

# Lint check
npm run lint

# Expected: No errors

# Build production bundle
npm run build

# Expected:
# ✓ dist/ created
# ✓ No build errors
# ✓ Total bundle size < 500KB gzipped

# Preview production build
npm run preview

# Expected: Game loads and runs smoothly
```

### Level 2: Manual Testing Checklist
```yaml
FUNCTIONALITY:
  - [ ] Main menu loads and animates smoothly
  - [ ] Start Game button transitions to game screen
  - [ ] Steering wheel responds to mouse drag
  - [ ] Touch controls work on mobile device
  - [ ] Gear controls change car speed
  - [ ] Brake reduces speed
  - [ ] Car physics feel realistic (not too fast/slow)
  - [ ] Collision detection works (car bounces off obstacles)
  - [ ] Parking validation triggers level complete
  - [ ] Level complete modal shows correct score
  - [ ] Next level button unlocks and loads level 2
  - [ ] All 15 levels are completable
  - [ ] Progress saves to localStorage
  - [ ] Refresh page maintains progress

PERFORMANCE:
  - [ ] No console errors in production
  - [ ] FPS counter shows 60 FPS on desktop
  - [ ] FPS counter shows 30+ FPS on mobile
  - [ ] No memory leaks (test by playing 5+ levels)
  - [ ] Page load time < 3 seconds on 4G

VISUAL:
  - [ ] No layout shifts during load
  - [ ] Responsive on 320px width (mobile)
  - [ ] Responsive on 1920px width (desktop)
  - [ ] Animations smooth (no jank)
  - [ ] Colors match design spec
```

### Level 3: Integration Testing
```bash
# Test localStorage persistence
# 1. Open game in browser
# 2. Complete Level 1
# 3. Open DevTools → Application → Local Storage
# Expected: See 'parkingGame_progress' with level data

# Test physics engine cleanup
# 1. Open DevTools → Performance
# 2. Start recording
# 3. Play level, go back to menu, start new level
# 4. Stop recording
# Expected: No memory growth pattern, Matter.js objects cleaned up

# Test mobile touch events
# 1. Open on real mobile device (NOT DevTools emulation)
# 2. Drag steering wheel
# 3. Hold Forward button
# Expected:
#   - Page doesn't scroll
#   - Controls feel responsive
#   - No accidental zooms
```

---

## Final Validation Checklist
- [ ] All 15 levels playable and beatable
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run lint` shows no warnings
- [ ] Production build < 500KB gzipped
- [ ] Game runs at 60 FPS on desktop
- [ ] Touch controls tested on real iOS and Android devices
- [ ] localStorage persists progress correctly
- [ ] No console errors in production mode
- [ ] Responsive design works from 320px to 1920px
- [ ] GitHub Actions deployment workflow configured
- [ ] Game successfully deployed to GitHub Pages
- [ ] README.md updated with deployment URL

---

## Anti-Patterns to Avoid
- ❌ Don't store Matter.js bodies in useState - use useRef
- ❌ Don't forget GSAP timeline cleanup - causes memory leaks
- ❌ Don't skip preventDefault on touch events - page will scroll
- ❌ Don't use variable timestep for physics - causes inconsistency
- ❌ Don't hardcode level data in components - use JSON files
- ❌ Don't test only in DevTools mobile mode - test on real devices
- ❌ Don't ignore DPI scaling on canvas - looks blurry on retina displays
- ❌ Don't create new patterns - follow existing component structure
- ❌ Don't skip localStorage error handling - quota can be exceeded
- ❌ Don't deploy without testing production build locally first

---

## Confidence Score: 8/10

**Reasoning:**
- ✅ **Strong foundation**: Existing UI components and GSAP patterns are solid
- ✅ **Clear architecture**: Well-defined hooks and component structure
- ✅ **Comprehensive documentation**: Matter.js and React best practices covered
- ✅ **Realistic scope**: 5-week timeline aligns with task complexity
- ⚠️ **Physics complexity**: Car physics tuning may require iteration to feel "right"
- ⚠️ **Mobile performance**: Matter.js can be heavy on low-end devices - may need optimization
- ⚠️ **Testing burden**: 15 levels × multiple devices = significant manual testing time

**To increase to 9/10:**
- Add automated E2E tests with Playwright for critical user flows
- Include performance budgets in CI/CD (Lighthouse CI)
- Create a physics tuning UI for easier parameter adjustment

**Success factors:**
1. Follow the existing code patterns strictly (SteeringWheel.jsx is excellent reference)
2. Test on real mobile devices early and often (NOT just DevTools)
3. Implement Phase 1 and 2 completely before moving to Phase 3
4. Use the validation loops - don't skip ahead if tests fail
5. Refer to CLAUDE.md constantly for development rules

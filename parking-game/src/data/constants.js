/**
 * Game Constants for Parking Master
 * All physics, scoring, and collision configuration
 */

// Car Physics Constants
export const CAR = {
  WIDTH: 40,        // pixels
  HEIGHT: 60,       // pixels
  MAX_SPEED: {
    FORWARD: 30,    // pixels/frame
    REVERSE: 15     // pixels/frame (slower in reverse)
  },
  ACCELERATION: 0.5,      // Force applied when accelerating
  BRAKE_FORCE: 1.5,       // Force applied when braking
  FRICTION_AIR: 0.02,     // Air resistance (realistic deceleration)
  FRICTION: 0.1,          // Ground friction
  RESTITUTION: 0.1,       // Bounce factor (low = minimal bounce)
  STEERING_MAX: 30,       // Maximum steering angle in degrees
  TURN_RATE: 0.05         // Angular velocity multiplier
};

// Matter.js Collision Categories (bit masks)
export const COLLISION_CATEGORY = {
  CAR: 0x0001,           // 0000 0001
  OBSTACLE: 0x0002,      // 0000 0010
  PARKING_ZONE: 0x0004,  // 0000 0100
  WALL: 0x0008,          // 0000 1000
  SENSOR: 0x0010         // 0001 0000
};

// Scoring System Configuration
export const SCORING = {
  // Star rating thresholds (total score 0-100)
  STAR_THRESHOLDS: {
    THREE_STAR: 85,    // 85+ = 3 stars
    TWO_STAR: 70,      // 70-84 = 2 stars
    ONE_STAR: 50       // 50-69 = 1 star, <50 = 0 stars (fail)
  },

  // Score component weights (must sum to 1.0)
  WEIGHTS: {
    ACCURACY: 0.5,     // 50% of total score from parking accuracy
    TIME: 0.3,         // 30% of total score from time performance
    COLLISIONS: 0.2    // 20% of total score from collision penalty
  },

  // Collision penalty per hit
  COLLISION_PENALTY: {
    FIRST: 0,          // First collision: no penalty (warning)
    SECOND: 25,        // Second: -25 points
    THIRD: 50,         // Third: -50 points
    FOURTH_PLUS: 100   // Fourth+: -100 points (auto-fail)
  }
};

// Parking Validation Constants
export const PARKING = {
  POSITION_TOLERANCE: 5,    // pixels - how close to center is acceptable
  ANGLE_TOLERANCE: 3,       // degrees - how aligned angle must be
  SPEED_THRESHOLD: 1,       // pixels/frame - max speed to be "stopped"
  VALID_DURATION: 1000      // milliseconds - must be parked for this long
};

// Game Loop Configuration
export const GAME = {
  FPS: 60,                           // Target frames per second
  TIMESTEP: 1000 / 60,              // Fixed timestep in ms (16.67ms)
  MAX_COLLISION_COUNT: 5,            // Auto-fail after this many collisions
  CANVAS: {
    DEFAULT_WIDTH: 800,              // Default canvas width
    DEFAULT_HEIGHT: 600,             // Default canvas height
    BACKGROUND_COLOR: '#1F2937',     // Gray-800 from design spec
    GRID_COLOR: '#374151',           // Gray-700 for background grid
    GRID_SIZE: 50                    // Grid cell size in pixels
  }
};

// Level Difficulty Settings
export const DIFFICULTY = {
  BEGINNER: {
    name: 'beginner',
    timeMultiplier: 1.5,       // 50% more time than par
    accuracyRequired: 80,      // 80% accuracy for 3 stars
    maxCollisions: 3
  },
  INTERMEDIATE: {
    name: 'intermediate',
    timeMultiplier: 1.2,       // 20% more time than par
    accuracyRequired: 85,      // 85% accuracy for 3 stars
    maxCollisions: 2
  },
  ADVANCED: {
    name: 'advanced',
    timeMultiplier: 1.0,       // Exact par time
    accuracyRequired: 90,      // 90% accuracy for 3 stars
    maxCollisions: 1
  },
  EXPERT: {
    name: 'expert',
    timeMultiplier: 0.9,       // Less than par time
    accuracyRequired: 95,      // 95% accuracy for 3 stars
    maxCollisions: 0           // No collisions allowed
  }
};

// Obstacle Types Configuration
export const OBSTACLES = {
  WALL: {
    type: 'wall',
    color: '#6B7280',          // Gray-500
    friction: 0.8,
    restitution: 0.3
  },
  CAR: {
    type: 'car',
    color: '#3B82F6',          // Blue-500
    width: 40,
    height: 60,
    friction: 0.1,
    restitution: 0.1
  },
  CONE: {
    type: 'cone',
    color: '#F59E0B',          // Orange-500
    width: 10,
    height: 10,
    friction: 0.1,
    restitution: 0.5           // Cones bounce more
  },
  BARRIER: {
    type: 'barrier',
    color: '#EF4444',          // Red-500
    friction: 0.8,
    restitution: 0.2
  }
};

// Visual Feedback Colors
export const COLORS = {
  PARKING_ZONE: {
    DEFAULT: '#FCD34D',        // Yellow-300 (parking lines)
    VALID: '#10B981',          // Green-500 (correct parking)
    INVALID: '#EF4444'         // Red-500 (wrong position)
  },
  CAR: {
    NORMAL: '#60A5FA',         // Blue-400
    COLLISION: '#EF4444',      // Red-500 (flash on collision)
    SUCCESS: '#10B981'         // Green-500 (parked successfully)
  },
  SPEED: {
    SLOW: '#10B981',           // Green (safe speed)
    MEDIUM: '#F59E0B',         // Orange (moderate speed)
    FAST: '#EF4444'            // Red (too fast)
  }
};

// Keyboard Controls Mapping
export const CONTROLS = {
  KEYBOARD: {
    FORWARD: ['KeyW', 'ArrowUp'],
    REVERSE: ['KeyS', 'ArrowDown'],
    STEER_LEFT: ['KeyA', 'ArrowLeft'],
    STEER_RIGHT: ['KeyD', 'ArrowRight'],
    BRAKE: ['Space'],
    PAUSE: ['Escape', 'KeyP'],
    RESTART: ['KeyR']
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  PROGRESS: 'parkingMaster_progress',
  SETTINGS: 'parkingMaster_settings',
  HIGH_SCORES: 'parkingMaster_highScores'
};

export default {
  CAR,
  COLLISION_CATEGORY,
  SCORING,
  PARKING,
  GAME,
  DIFFICULTY,
  OBSTACLES,
  COLORS,
  CONTROLS,
  STORAGE_KEYS
};

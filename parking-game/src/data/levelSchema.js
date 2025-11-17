/**
 * Level Configuration Schema and Validation
 * Defines the structure for level JSON files and validates them
 */

/**
 * Level Configuration Schema
 * @typedef {Object} LevelConfig
 * @property {number} levelNumber - Level number (1-15)
 * @property {string} title - Level title/name
 * @property {'beginner'|'intermediate'|'advanced'|'expert'} difficulty - Difficulty level
 * @property {ParkingSpot} parkingSpot - Target parking area
 * @property {Obstacle[]} obstacles - Array of obstacles
 * @property {CarStartPosition} carStartPosition - Initial car position
 * @property {number|null} timeLimit - Time limit in seconds (null = unlimited)
 * @property {ParMetrics} par - Par metrics for scoring
 * @property {string[]} hints - Helpful hints for the player
 */

/**
 * Parking Spot Definition
 * @typedef {Object} ParkingSpot
 * @property {number} x - X coordinate (center)
 * @property {number} y - Y coordinate (center)
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 * @property {number} angle - Rotation angle in degrees (0 = horizontal)
 */

/**
 * Obstacle Definition
 * @typedef {Object} Obstacle
 * @property {'wall'|'car'|'cone'|'barrier'} type - Obstacle type
 * @property {number} x - X coordinate (center)
 * @property {number} y - Y coordinate (center)
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 * @property {number} angle - Rotation angle in degrees
 */

/**
 * Car Start Position
 * @typedef {Object} CarStartPosition
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} angle - Initial rotation in degrees
 */

/**
 * Par Metrics for Scoring
 * @typedef {Object} ParMetrics
 * @property {number} time - Par time in seconds
 * @property {number} accuracy - Par accuracy percentage (0-100)
 * @property {number} collisions - Par collision count
 */

/**
 * Validates a level configuration object
 * @param {Object} level - Level configuration to validate
 * @returns {boolean} True if valid
 * @throws {Error} If validation fails with specific error message
 */
export const validateLevel = (level) => {
  // Validate level number
  if (!level.levelNumber || typeof level.levelNumber !== 'number') {
    throw new Error('Level must have a valid levelNumber');
  }

  if (level.levelNumber < 1 || level.levelNumber > 15) {
    throw new Error(`Invalid level number: ${level.levelNumber}. Must be between 1 and 15`);
  }

  // Validate title
  if (!level.title || typeof level.title !== 'string') {
    throw new Error('Level must have a valid title string');
  }

  // Validate difficulty
  const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
  if (!validDifficulties.includes(level.difficulty)) {
    throw new Error(`Invalid difficulty: ${level.difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
  }

  // Validate parking spot
  if (!level.parkingSpot || typeof level.parkingSpot !== 'object') {
    throw new Error('Level must have a valid parkingSpot object');
  }

  const parkingSpotFields = ['x', 'y', 'width', 'height', 'angle'];
  parkingSpotFields.forEach(field => {
    if (!(field in level.parkingSpot)) {
      throw new Error(`parkingSpot missing required field: ${field}`);
    }
    if (typeof level.parkingSpot[field] !== 'number') {
      throw new Error(`parkingSpot.${field} must be a number`);
    }
  });

  // Validate parking spot dimensions
  if (level.parkingSpot.width <= 0 || level.parkingSpot.height <= 0) {
    throw new Error('parkingSpot dimensions must be positive');
  }

  // Validate obstacles array
  if (!Array.isArray(level.obstacles)) {
    throw new Error('obstacles must be an array');
  }

  level.obstacles.forEach((obstacle, index) => {
    const obstacleFields = ['type', 'x', 'y', 'width', 'height', 'angle'];
    obstacleFields.forEach(field => {
      if (!(field in obstacle)) {
        throw new Error(`obstacles[${index}] missing required field: ${field}`);
      }
    });

    const validObstacleTypes = ['wall', 'car', 'cone', 'barrier'];
    if (!validObstacleTypes.includes(obstacle.type)) {
      throw new Error(`obstacles[${index}] invalid type: ${obstacle.type}`);
    }

    if (obstacle.width <= 0 || obstacle.height <= 0) {
      throw new Error(`obstacles[${index}] dimensions must be positive`);
    }
  });

  // Validate car start position
  if (!level.carStartPosition || typeof level.carStartPosition !== 'object') {
    throw new Error('Level must have a valid carStartPosition object');
  }

  const carPosFields = ['x', 'y', 'angle'];
  carPosFields.forEach(field => {
    if (!(field in level.carStartPosition)) {
      throw new Error(`carStartPosition missing required field: ${field}`);
    }
    if (typeof level.carStartPosition[field] !== 'number') {
      throw new Error(`carStartPosition.${field} must be a number`);
    }
  });

  // Validate time limit (can be null)
  if (level.timeLimit !== null && typeof level.timeLimit !== 'number') {
    throw new Error('timeLimit must be a number or null');
  }

  if (level.timeLimit !== null && level.timeLimit <= 0) {
    throw new Error('timeLimit must be positive');
  }

  // Validate par metrics
  if (!level.par || typeof level.par !== 'object') {
    throw new Error('Level must have a valid par object');
  }

  const parFields = ['time', 'accuracy', 'collisions'];
  parFields.forEach(field => {
    if (!(field in level.par)) {
      throw new Error(`par missing required field: ${field}`);
    }
    if (typeof level.par[field] !== 'number') {
      throw new Error(`par.${field} must be a number`);
    }
  });

  if (level.par.time <= 0) {
    throw new Error('par.time must be positive');
  }

  if (level.par.accuracy < 0 || level.par.accuracy > 100) {
    throw new Error('par.accuracy must be between 0 and 100');
  }

  if (level.par.collisions < 0) {
    throw new Error('par.collisions must be non-negative');
  }

  // Validate hints array
  if (!Array.isArray(level.hints)) {
    throw new Error('hints must be an array');
  }

  level.hints.forEach((hint, index) => {
    if (typeof hint !== 'string') {
      throw new Error(`hints[${index}] must be a string`);
    }
  });

  return true;
};

/**
 * Creates a default level template
 * @param {number} levelNumber - Level number
 * @returns {LevelConfig} Default level configuration
 */
export const createDefaultLevel = (levelNumber) => {
  return {
    levelNumber,
    title: `Level ${levelNumber}`,
    difficulty: 'beginner',
    parkingSpot: {
      x: 400,
      y: 300,
      width: 80,
      height: 120,
      angle: 0
    },
    obstacles: [],
    carStartPosition: {
      x: 200,
      y: 300,
      angle: 0
    },
    timeLimit: null,
    par: {
      time: 60,
      accuracy: 85,
      collisions: 0
    },
    hints: []
  };
};

export default {
  validateLevel,
  createDefaultLevel
};

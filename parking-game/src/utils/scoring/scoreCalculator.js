import { SCORING } from '../../data/constants';

/**
 * Calculate final score based on performance metrics
 *
 * Formula:
 * totalScore = (accuracyScore * 0.5) + (timeScore * 0.3) + (collisionScore * 0.2)
 *
 * Components:
 * - Accuracy: 0-100 based on parking precision
 * - Time: 0-100 based on time vs par time
 * - Collisions: 0-100 based on collision count (0 = 100, 1 = 75, 2 = 50, 3+ = 0)
 *
 * @param {number} accuracy - Parking accuracy percentage (0-100)
 * @param {number} timeTaken - Time taken in seconds
 * @param {number} collisions - Number of collisions
 * @param {Object} par - Par metrics {time, accuracy, collisions}
 * @returns {Object} Score breakdown and total
 */
export const calculateScore = (accuracy, timeTaken, collisions, par) => {
  // Accuracy score (0-100)
  // Direct use of parking accuracy
  const accuracyScore = Math.max(0, Math.min(100, accuracy));

  // Time score (0-100)
  // Based on comparison to par time
  // Par time or better = 100
  // 2x par time = 50
  // 3x par time or worse = 0
  let timeScore = 0;
  if (timeTaken <= par.time) {
    timeScore = 100;
  } else if (timeTaken <= par.time * 2) {
    // Linear interpolation between 100 and 50
    timeScore = 100 - ((timeTaken - par.time) / par.time) * 50;
  } else if (timeTaken <= par.time * 3) {
    // Linear interpolation between 50 and 0
    timeScore = 50 - ((timeTaken - par.time * 2) / par.time) * 50;
  } else {
    timeScore = 0;
  }

  timeScore = Math.max(0, Math.min(100, timeScore));

  // Collision score (0-100)
  // 0 collisions = 100
  // 1 collision = 75
  // 2 collisions = 50
  // 3 collisions = 25
  // 4+ collisions = 0
  let collisionScore = 0;
  if (collisions === 0) {
    collisionScore = 100;
  } else if (collisions === 1) {
    collisionScore = 75;
  } else if (collisions === 2) {
    collisionScore = 50;
  } else if (collisions === 3) {
    collisionScore = 25;
  } else {
    collisionScore = 0;
  }

  // Calculate weighted total score
  const totalScore = Math.round(
    accuracyScore * SCORING.WEIGHTS.ACCURACY +
    timeScore * SCORING.WEIGHTS.TIME +
    collisionScore * SCORING.WEIGHTS.COLLISIONS
  );

  // Return detailed breakdown
  return {
    totalScore: Math.max(0, Math.min(100, totalScore)),
    breakdown: {
      accuracy: {
        score: Math.round(accuracyScore),
        weight: SCORING.WEIGHTS.ACCURACY,
        contribution: Math.round(accuracyScore * SCORING.WEIGHTS.ACCURACY)
      },
      time: {
        score: Math.round(timeScore),
        weight: SCORING.WEIGHTS.TIME,
        contribution: Math.round(timeScore * SCORING.WEIGHTS.TIME)
      },
      collisions: {
        score: Math.round(collisionScore),
        weight: SCORING.WEIGHTS.COLLISIONS,
        contribution: Math.round(collisionScore * SCORING.WEIGHTS.COLLISIONS)
      }
    },
    metrics: {
      accuracy,
      timeTaken,
      collisions,
      parTime: par.time,
      parAccuracy: par.accuracy,
      parCollisions: par.collisions
    }
  };
};

/**
 * Determine if performance beats par
 * @param {number} accuracy - Parking accuracy
 * @param {number} timeTaken - Time taken
 * @param {number} collisions - Collision count
 * @param {Object} par - Par metrics
 * @returns {boolean} True if all metrics beat or equal par
 */
export const beatsPar = (accuracy, timeTaken, collisions, par) => {
  return (
    accuracy >= par.accuracy &&
    timeTaken <= par.time &&
    collisions <= par.collisions
  );
};

/**
 * Get performance grade (S, A, B, C, D, F)
 * @param {number} totalScore - Total score (0-100)
 * @returns {string} Grade letter
 */
export const getGrade = (totalScore) => {
  if (totalScore >= 95) return 'S';  // Perfect or near-perfect
  if (totalScore >= 85) return 'A';  // Excellent
  if (totalScore >= 70) return 'B';  // Good
  if (totalScore >= 60) return 'C';  // Average
  if (totalScore >= 50) return 'D';  // Below average
  return 'F';                        // Fail
};

export default {
  calculateScore,
  beatsPar,
  getGrade
};

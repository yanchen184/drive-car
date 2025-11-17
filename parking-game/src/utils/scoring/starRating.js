import { SCORING } from '../../data/constants';

/**
 * Convert total score to 1-3 star rating
 *
 * Star rating system:
 * - 3 stars: Score >= 85 (Excellent parking)
 * - 2 stars: Score >= 70 (Good parking)
 * - 1 star: Score >= 50 (Acceptable parking)
 * - 0 stars: Score < 50 (Failed - should not happen if level completed)
 *
 * @param {number} totalScore - Total score from scoreCalculator (0-100)
 * @returns {number} Star rating (1-3)
 */
export const getStarRating = (totalScore) => {
  if (totalScore >= SCORING.STAR_THRESHOLDS.THREE_STAR) {
    return 3;
  }

  if (totalScore >= SCORING.STAR_THRESHOLDS.TWO_STAR) {
    return 2;
  }

  if (totalScore >= SCORING.STAR_THRESHOLDS.ONE_STAR) {
    return 1;
  }

  // If score is below minimum threshold, player shouldn't pass
  // But return 1 star as minimum if they somehow completed the level
  return 1;
};

/**
 * Get star rating with descriptive text
 *
 * @param {number} totalScore - Total score from scoreCalculator (0-100)
 * @returns {Object} { stars: number, description: string }
 */
export const getStarRatingWithDescription = (totalScore) => {
  const stars = getStarRating(totalScore);

  const descriptions = {
    3: 'Perfect Parking!',
    2: 'Good Job!',
    1: 'Passed',
    0: 'Try Again'
  };

  return {
    stars,
    description: descriptions[stars] || descriptions[1]
  };
};

/**
 * Calculate percentage to next star
 *
 * @param {number} totalScore - Current total score
 * @returns {Object} { currentStars, nextStarAt, progress }
 */
export const getProgressToNextStar = (totalScore) => {
  const currentStars = getStarRating(totalScore);

  if (currentStars === 3) {
    return {
      currentStars: 3,
      nextStarAt: null,
      progress: 100
    };
  }

  const thresholds = [
    SCORING.STAR_THRESHOLDS.ONE_STAR,
    SCORING.STAR_THRESHOLDS.TWO_STAR,
    SCORING.STAR_THRESHOLDS.THREE_STAR
  ];

  const nextStarAt = thresholds[currentStars];
  const previousStarAt = currentStars > 0 ? thresholds[currentStars - 1] : 0;

  const progress = ((totalScore - previousStarAt) / (nextStarAt - previousStarAt)) * 100;

  return {
    currentStars,
    nextStarAt,
    progress: Math.min(100, Math.max(0, progress))
  };
};

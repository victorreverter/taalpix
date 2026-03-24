/**
 * Applies the SM-2 algorithm to determine the next interval in a spaced repetition learning schedule.
 *
 * @param {number} quality - User's recall quality from 0 (blackout) to 5 (perfect recall)
 * @param {number} repetitions - The number of times the item has been successfully recalled in a row
 * @param {number} previousInterval - The current interval (in days)
 * @param {number} previousEaseFactor - The current ease factor (starts at 2.5)
 * @returns {Object} An object containing: { newInterval, newRepetitions, newEaseFactor }
 */
export const calculateSM2 = (quality, repetitions = 0, previousInterval = 0, previousEaseFactor = 2.5) => {
  let newInterval;
  let newRepetitions;
  let newEaseFactor;

  // Quality >= 3 means correct response
  if (quality >= 3) {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(previousInterval * previousEaseFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // False response, reset repetition count and interval
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate new Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEaseFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor cannot be less than 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  return { newInterval, newRepetitions, newEaseFactor };
};

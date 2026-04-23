export const calculateSM2 = (quality, repetitions, interval, easeFactor, exerciseType) => {
  let newInterval, newRepetitions, newEaseFactor;
  
  if (quality >= 3) {
    newRepetitions = repetitions + 1;
    newInterval = repetitions === 0 ? 1 
      : repetitions === 1 ? 6 
      : Math.round(interval * easeFactor);
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }
  
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);
  
  const exerciseModifiers = {
    visual: 0.9,
    matching: 0.95,
    listening: 1.0,
    build: 1.05,
    translate: 1.1,
    dialogue: 1.15
  };
  
  newInterval = Math.round(newInterval * (exerciseModifiers[exerciseType] || 1.0));
  
  return { newInterval, newRepetitions, newEaseFactor };
};

export const MASTERY_THRESHOLDS = {
  repetitions: 5,
  interval_days: 21,
  consecutive_correct_for_review_clear: 3
};

export const isMastered = (wordState) => {
  return wordState.repetitions >= MASTERY_THRESHOLDS.repetitions &&
         wordState.interval_days >= MASTERY_THRESHOLDS.interval_days;
};

export const needsPeriodicReview = (wordState) => {
  if (!isMastered(wordState)) return false;
  
  const daysSinceLastPractice = Math.floor(
    (Date.now() - new Date(wordState.last_practiced).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceLastPractice >= 90;
};

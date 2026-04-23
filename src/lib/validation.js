const levenshteinDistance = (a, b) => {
  const matrix = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

export const validateFreeText = (userInput, correctAnswer) => {
  const normalize = (text) => text.trim().toLowerCase();
  
  const normalizedInput = normalize(userInput);
  const normalizedCorrect = normalize(correctAnswer);
  
  if (normalizedInput === normalizedCorrect) {
    return { isCorrect: true, isPerfect: true };
  }
  
  const inputWords = normalizedInput.split(' ');
  const correctWords = normalizedCorrect.split(' ');
  
  if (inputWords.length !== correctWords.length) {
    return { isCorrect: false, isPerfect: false };
  }
  
  let totalTypoCount = 0;
  
  for (let i = 0; i < inputWords.length; i++) {
    const inputWord = inputWords[i];
    const correctWord = correctWords[i];
    
    const distance = levenshteinDistance(inputWord, correctWord);
    
    if (distance > 1) {
      return { isCorrect: false, isPerfect: false };
    }
    
    totalTypoCount += distance;
  }
  
  return { isCorrect: true, isPerfect: false, typoCount: totalTypoCount };
};

import React, { useState, useEffect } from 'react';
import { playAudio } from '../../lib/audio';
import PixelButton from '../common/PixelButton';

const BuildSentence = ({ sentences, onComplete }) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const currentSentence = sentences[currentSentenceIndex];

  useEffect(() => {
    const words = currentSentence.dutch.split(' ');
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setShowResult(false);
    setIsCorrect(false);
    setMistakes(0);
  }, [currentSentenceIndex, currentSentence]);

  const handleWordClick = (word, index) => {
    if (showResult) return;

    setSelectedWords(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWord = (index) => {
    if (showResult) return;

    const wordToRemove = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, wordToRemove]);
  };

  const checkAnswer = () => {
    const answer = selectedWords.join(' ');
    const correct = currentSentence.dutch;
    const isCorrectAnswer = answer === correct;

    setShowResult(true);
    setIsCorrect(isCorrectAnswer);

    if (isCorrectAnswer) {
      playAudio(currentSentence.dutch);
      const quality = mistakes === 0 ? 4 : mistakes <= 1 ? 3 : 2;
      setTimeout(() => {
        if (currentSentenceIndex < sentences.length - 1) {
          setCurrentSentenceIndex(prev => prev + 1);
        } else {
          onComplete(quality, 'build');
        }
      }, 1500);
    } else {
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setSelectedWords([]);
        const words = currentSentence.dutch.split(' ');
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setAvailableWords(shuffled);
        setShowResult(false);
      }, 1500);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-pixel text-lg text-tp-text mb-6 text-center">
        Build the Sentence
      </h2>

      <div className="mb-6 p-4 bg-tp-surface2 border-2 border-solid border-tp-border">
        <p className="text-tp-text2 text-center mb-2">{currentSentence.spanish}</p>
        <button
          onClick={() => playAudio(currentSentence.dutch)}
          className="mx-auto block text-2xl hover:opacity-80"
        >
          🔊
        </button>
      </div>

      <div className="min-h-[60px] mb-6 p-4 bg-tp-surface border-2 border-solid border-tp-border flex flex-wrap gap-2 justify-center">
        {selectedWords.length === 0 ? (
          <p className="text-tp-text3 text-sm">Tap words below to build the sentence</p>
        ) : (
          selectedWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleRemoveWord(index)}
              className="px-3 py-2 bg-tp-primary text-white font-body border-2 border-solid border-tp-border hover:bg-tp-primary-light transition-colors"
            >
              {word}
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {availableWords.map((word, index) => (
          <button
            key={index}
            onClick={() => handleWordClick(word, index)}
            disabled={showResult}
            className="px-3 py-2 bg-tp-surface text-tp-text font-body border-2 border-solid border-tp-border hover:bg-tp-surface2 transition-colors disabled:opacity-50"
          >
            {word}
          </button>
        ))}
      </div>

      {showResult && (
        <div className={`mb-6 p-4 border-2 border-solid text-center ${
          isCorrect
            ? 'bg-tp-success-light border-tp-success text-tp-success'
            : 'bg-tp-error-light border-tp-error text-tp-error'
        }`}>
          <p className="font-pixel text-sm">
            {isCorrect ? '✓ Correct!' : '✗ Not quite. The correct answer is:'}
          </p>
          {!isCorrect && (
            <p className="font-body text-lg mt-2">{currentSentence.dutch}</p>
          )}
        </div>
      )}

      {selectedWords.length > 0 && !showResult && (
        <div className="text-center">
          <PixelButton
            variant="primary"
            size="large"
            onClick={checkAnswer}
          >
            Check Answer
          </PixelButton>
        </div>
      )}

      {mistakes > 0 && (
        <div className="mt-4 text-center text-tp-error font-pixel text-xs">
          Mistakes: {mistakes}
        </div>
      )}

      <div className="mt-6 text-center text-tp-text3 text-xs">
        {currentSentenceIndex + 1} of {sentences.length}
      </div>
    </div>
  );
};

export default BuildSentence;

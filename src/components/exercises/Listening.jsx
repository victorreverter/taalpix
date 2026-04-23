import React, { useState, useEffect } from 'react';
import { playAudio } from '../../lib/audio';
import PixelButton from '../common/PixelButton';

const Listening = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    // Small delay to ensure audio system is ready
    setTimeout(() => {
      playAudio(currentWord.dutch);
    }, 100);
  }, [currentWordIndex, currentWord]);

  const handlePlayAudio = () => {
    playAudio(currentWord.dutch);
  };

  const generateOptions = () => {
    const correctWord = currentWord;
    const otherWords = words.filter(w => w.id !== correctWord.id);
    const shuffledOthers = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 2);
    const options = [...shuffledOthers, correctWord].sort(() => Math.random() - 0.5);
    return options;
  };

  const [options, setOptions] = useState([]);

  useEffect(() => {
    setOptions(generateOptions());
  }, [currentWordIndex]);

  const handleOptionClick = (option) => {
    if (selectedAnswer || showResult) return;

    setSelectedAnswer(option);
    const isCorrect = option.id === currentWord.id;

    if (isCorrect) {
      setShowResult(true);
      const quality = mistakes === 0 ? 4 : mistakes <= 1 ? 3 : 2;
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          onComplete(quality, 'listening', currentWord);
        }
      }, 1000);
    } else {
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 500);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-pixel text-lg text-tp-text mb-6 text-center">
        Listen & Choose
      </h2>

      <div className="flex justify-center mb-8">
        <button
          onClick={handlePlayAudio}
          className="p-6 bg-tp-surface2 border-2 border-solid border-tp-border hover:bg-tp-neutral-light transition-colors"
        >
          <span className="text-4xl">🔊</span>
          <p className="font-pixel text-xs text-tp-text2 mt-2">Play Audio</p>
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selectedAnswer?.id === option.id;
          const isCorrect = option.id === currentWord.id;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option)}
              disabled={showResult}
              className={`
                w-full p-4 border-2 border-solid font-body text-lg text-left
                transition-all
                ${showCorrect
                  ? 'bg-tp-success-light border-tp-success text-tp-success'
                  : showWrong
                  ? 'bg-tp-error-light border-tp-error text-tp-error'
                  : isSelected
                  ? 'bg-tp-primary-light border-tp-primary text-tp-primary'
                  : 'bg-tp-surface border-tp-border text-tp-text hover:bg-tp-surface2'
                }
              `}
            >
              {option.dutch}
            </button>
          );
        })}
      </div>

      {mistakes > 0 && (
        <div className="mt-4 text-center text-tp-error font-pixel text-xs">
          Mistakes: {mistakes}
        </div>
      )}

      <div className="mt-6 text-center text-tp-text3 text-xs">
        {currentWordIndex + 1} of {words.length}
      </div>
    </div>
  );
};

export default Listening;

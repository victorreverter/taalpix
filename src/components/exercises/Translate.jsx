import React, { useState, useEffect, useRef } from 'react';
import { validateFreeText } from '../../lib/validation';
import { playAudio } from '../../lib/audio';
import PixelButton from '../common/PixelButton';

const Translate = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [input, setInput] = useState('');
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    setInput('');
    setShowResult(false);
    setResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentWordIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || showResult) return;

    const validation = validateFreeText(input.trim(), currentWord.dutch);

    setShowResult(true);
    setResult(validation);

    if (validation.isCorrect) {
      playAudio(currentWord.dutch);
      const quality = validation.isPerfect ? (mistakes === 0 ? 4 : 3) : 2;
      setTimeout(() => {
        if (currentWordIndex < words.length - 1) {
          setCurrentWordIndex(prev => prev + 1);
        } else {
          onComplete(quality, 'translate', currentWord);
        }
      }, validation.isPerfect ? 1000 : 1500);
    } else {
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setInput('');
        setShowResult(false);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 1500);
    }
  };

  return (
    <div className="p-4">
      <h2 className="font-pixel text-lg text-tp-text mb-6 text-center">
        Translate to Dutch
      </h2>

      <div className="mb-8 p-6 bg-tp-surface2 border-2 border-solid border-tp-border text-center">
        <p className="text-tp-text text-xl font-body mb-2">
          {currentWord.spanish}
        </p>
        <p className="text-tp-text3 text-xs font-pixel">
          {currentWord.category}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showResult && result?.isCorrect}
          placeholder="Type the Dutch translation..."
          className={`
            w-full px-4 py-3 border-2 border-solid font-body text-lg
            bg-tp-surface text-tp-text
            focus:outline-none focus:border-tp-primary
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {!showResult && (
          <div className="mt-4 text-center">
            <PixelButton
              type="submit"
              variant="primary"
              size="large"
              disabled={!input.trim()}
            >
              Check Answer
            </PixelButton>
          </div>
        )}
      </form>

      {showResult && result && (
        <div className={`mb-6 p-4 border-2 border-solid text-center ${
          result.isCorrect
            ? result.isPerfect
              ? 'bg-tp-success-light border-tp-success text-tp-success'
              : 'bg-tp-warning-light border-tp-warning text-tp-warning'
            : 'bg-tp-error-light border-tp-error text-tp-error'
        }`}>
          <p className="font-pixel text-sm">
            {result.isPerfect
              ? '✓ Perfect!'
              : result.isCorrect
              ? '✓ Good (minor typo)'
              : '✗ Not correct'}
          </p>
          {!result.isCorrect && (
            <div className="mt-2">
              <p className="font-body text-sm">The correct answer is:</p>
              <p className="font-body text-lg font-bold">{currentWord.dutch}</p>
            </div>
          )}
          {result.isCorrect && !result.isPerfect && (
            <p className="font-body text-xs mt-2 text-tp-text3">
              Typo count: {result.typoCount} (doesn't count toward mastery)
            </p>
          )}
        </div>
      )}

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

export default Translate;

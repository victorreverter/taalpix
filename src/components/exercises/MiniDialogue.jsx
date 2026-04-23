import React, { useState, useEffect } from 'react';
import { validateFreeText } from '../../lib/validation';
import { playAudio } from '../../lib/audio';
import PixelButton from '../common/PixelButton';

const MiniDialogue = ({ dialogue, onComplete }) => {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [completedLines, setCompletedLines] = useState([]);

  const currentLine = dialogue[currentLineIndex];

  useEffect(() => {
    if (currentLine?.is_user_line) {
      setUserInput('');
      setSelectedOption(null);
      setShowResult(false);
      setResult(null);
    } else {
      setTimeout(() => {
        if (currentLineIndex < dialogue.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
        } else {
          const quality = mistakes === 0 ? 4 : mistakes <= 1 ? 3 : 2;
          onComplete(quality, 'dialogue');
        }
      }, 1500);
    }
  }, [currentLineIndex]);

  const handleOptionClick = (option) => {
    if (showResult) return;

    setSelectedOption(option);
    const isCorrect = option === currentLine.correct_response;

    setShowResult(true);
    setResult({ isCorrect, isPerfect: isCorrect });

    if (isCorrect) {
      playAudio(currentLine.line_dutch);
      const quality = mistakes === 0 ? 4 : 3;
      setTimeout(() => {
        if (currentLineIndex < dialogue.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
        } else {
          onComplete(quality, 'dialogue');
        }
      }, 1000);
    } else {
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setSelectedOption(null);
        setShowResult(false);
      }, 1000);
    }
  };

  const handleTextInputSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || showResult) return;

    const validation = validateFreeText(userInput.trim(), currentLine.correct_response);

    setShowResult(true);
    setResult(validation);

    if (validation.isCorrect) {
      playAudio(currentLine.line_dutch);
      const quality = validation.isPerfect ? (mistakes === 0 ? 4 : 3) : 2;
      setTimeout(() => {
        if (currentLineIndex < dialogue.length - 1) {
          setCurrentLineIndex(prev => prev + 1);
        } else {
          onComplete(quality, 'dialogue');
        }
      }, validation.isPerfect ? 1000 : 1500);
    } else {
      setMistakes(prev => prev + 1);
      setTimeout(() => {
        setUserInput('');
        setShowResult(false);
      }, 1500);
    }
  };

  if (!currentLine) return null;

  const isUserLine = currentLine.is_user_line;
  const isMultipleChoice = currentLine.response_type === 'multiple_choice';

  return (
    <div className="p-4">
      <h2 className="font-pixel text-lg text-tp-text mb-6 text-center">
        Mini Dialogue
      </h2>

      <div className="space-y-4 mb-8">
        {dialogue.map((line, index) => {
          const isCompleted = index < currentLineIndex;
          const isCurrent = index === currentLineIndex;

          return (
            <div
              key={index}
              className={`
                p-4 border-2 border-solid transition-all
                ${line.is_user_line
                  ? 'bg-tp-primary-light border-tp-primary'
                  : 'bg-tp-surface2 border-tp-border'
                }
                ${isCompleted ? 'opacity-50' : isCurrent ? 'opacity-100' : 'opacity-30'}
              `}
            >
              <p className="font-pixel text-xs text-tp-text3 mb-2">
                {line.speaker}
              </p>
              <p className="font-body text-tp-text">
                {line.line_dutch}
              </p>
              <p className="font-body text-tp-text3 text-sm mt-1">
                {line.line_spanish}
              </p>
            </div>
          );
        })}
      </div>

      {isUserLine && (
        <div className="mt-6">
          <p className="font-pixel text-xs text-tp-text2 mb-4 text-center">
            Your response:
          </p>

          {isMultipleChoice ? (
            <div className="space-y-3">
              {currentLine.response_options?.map((option, index) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentLine.correct_response;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    disabled={showResult}
                    className={`
                      w-full p-4 border-2 border-solid font-body text-left
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
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleTextInputSubmit}>
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={showResult && result?.isCorrect}
                placeholder="Type your response..."
                className={`
                  w-full px-4 py-3 border-2 border-solid font-body text-lg
                  bg-tp-surface text-tp-text
                  focus:outline-none focus:border-tp-primary
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                autoComplete="off"
                autoCorrect="off"
              />

              {!showResult && (
                <div className="mt-4 text-center">
                  <PixelButton
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={!userInput.trim()}
                  >
                    Check Answer
                  </PixelButton>
                </div>
              )}
            </form>
          )}

          {showResult && result && (
            <div className={`mt-4 p-4 border-2 border-solid text-center ${
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
                <p className="font-body text-lg mt-2">{currentLine.correct_response}</p>
              )}
            </div>
          )}
        </div>
      )}

      {mistakes > 0 && (
        <div className="mt-4 text-center text-tp-error font-pixel text-xs">
          Mistakes: {mistakes}
        </div>
      )}

      <div className="mt-6 text-center text-tp-text3 text-xs">
        Line {currentLineIndex + 1} of {dialogue.length}
      </div>
    </div>
  );
};

export default MiniDialogue;

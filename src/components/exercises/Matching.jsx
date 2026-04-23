import React, { useState, useEffect } from 'react';
import { playAudio } from '../../lib/audio';
import PixelPlaceholder from '../common/PixelPlaceholder';
import PixelButton from '../common/PixelButton';

const Matching = ({ words, onComplete }) => {
  const [selected, setSelected] = useState({ image: null, word: null });
  const [matches, setMatches] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);

  useEffect(() => {
    const subset = words.slice(0, Math.min(4, words.length));
    const shuffled = [...subset].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setMatches([]);
    setSelected({ image: null, word: null });
    setMistakes(0);
  }, [words]);

  const handleImageClick = (word) => {
    if (matches.find(m => m.word.id === word.id)) return;
    setSelected(prev => ({ ...prev, image: word }));
  };

  const handleWordClick = (word) => {
    if (matches.find(m => m.word.id === word.id)) return;
    setSelected(prev => ({ ...prev, word }));
  };

  useEffect(() => {
    if (selected.image && selected.word) {
      const isMatch = selected.image.id === selected.word.id;

      if (isMatch) {
        setMatches(prev => [...prev, { word: selected.image, wordObj: selected.word }]);
        playAudio(selected.image.dutch);
      } else {
        setMistakes(prev => prev + 1);
      }

      setTimeout(() => {
        setSelected({ image: null, word: null });
      }, 500);
    }
  }, [selected]);

  useEffect(() => {
    if (matches.length === shuffledWords.length && shuffledWords.length > 0) {
      const quality = mistakes === 0 ? 4 : mistakes <= 2 ? 3 : 2;
      setTimeout(() => {
        onComplete(quality, 'matching');
      }, 800);
    }
  }, [matches, mistakes, shuffledWords, onComplete]);

  return (
    <div className="p-4">
      <h2 className="font-pixel text-lg text-tp-text mb-6 text-center">
        Match the Word to the Image
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {shuffledWords.map((word) => {
          const isMatched = matches.find(m => m.word.id === word.id);
          const isSelected = selected.image?.id === word.id;

          return (
            <div
              key={word.id}
              onClick={() => handleImageClick(word)}
              className={`
                cursor-pointer transition-all
                ${isMatched ? 'opacity-50' : 'hover:opacity-80'}
                ${isSelected ? 'ring-2 ring-tp-primary' : ''}
              `}
            >
              <PixelPlaceholder
                assetId={word.pixel_art_placeholder}
                label={word.dutch.toUpperCase()}
                size="medium"
                className={`
                  ${isMatched ? 'bg-tp-success-light border-tp-success' : ''}
                `}
              />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {shuffledWords.map((word) => {
          const isMatched = matches.find(m => m.word.id === word.id);
          const isSelected = selected.word?.id === word.id;

          return (
            <button
              key={word.id}
              onClick={() => handleWordClick(word)}
              disabled={isMatched}
              className={`
                w-full p-4 border-2 border-solid font-body text-lg
                transition-all
                ${isMatched
                  ? 'bg-tp-success-light border-tp-success text-tp-success opacity-50 cursor-default'
                  : 'bg-tp-surface border-tp-border text-tp-text hover:bg-tp-surface2'
                }
                ${isSelected ? 'ring-2 ring-tp-primary' : ''}
              `}
            >
              {word.dutch}
            </button>
          );
        })}
      </div>

      {mistakes > 0 && (
        <div className="mt-4 text-center text-tp-error font-pixel text-xs">
          Mistakes: {mistakes}
        </div>
      )}
    </div>
  );
};

export default Matching;

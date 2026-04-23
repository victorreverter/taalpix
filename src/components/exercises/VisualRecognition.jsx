import React, { useState, useEffect } from 'react';
import { playAudio } from '../../lib/audio';
import PixelPlaceholder from '../common/PixelPlaceholder';
import PixelButton from '../common/PixelButton';

const VisualRecognition = ({ word, onComplete }) => {
  const [hasViewed, setHasViewed] = useState(false);

  useEffect(() => {
    setHasViewed(false);
    // Small delay to ensure audio is ready
    setTimeout(() => {
      playAudio(word.dutch);
    }, 100);
  }, [word]);

  const handleContinue = () => {
    onComplete(4, 'visual');
  };

  const handleReplay = () => {
    playAudio(word.dutch);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <h2 className="font-pixel text-lg text-tp-text mb-4">
        Observe & Listen
      </h2>

      <PixelPlaceholder
        assetId={word.pixel_art_placeholder}
        label={word.dutch.toUpperCase()}
        size="large"
      />

      <div className="text-center space-y-4">
        <p className="text-tp-text2 text-lg">
          {word.dutch}
        </p>
        <p className="text-tp-text3 text-sm">
          {word.spanish}
        </p>
      </div>

      <button
        onClick={handleReplay}
        className="p-3 bg-tp-surface2 border-2 border-solid border-tp-border hover:bg-tp-neutral-light transition-colors"
      >
        🔊 Replay Audio
      </button>

      <PixelButton
        variant="primary"
        size="large"
        onClick={handleContinue}
      >
        Got it →
      </PixelButton>
    </div>
  );
};

export default VisualRecognition;

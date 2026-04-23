import React from 'react';
import PixelCard from '../common/PixelCard';

const LevelCard = ({ level, isUnlocked, scenesCompleted, onClick }) => {
  const progressPercentage = (scenesCompleted / level.scenes) * 100;

  return (
    <PixelCard
      className={`p-6 cursor-pointer transition-all ${
        isUnlocked
          ? 'hover:border-tp-primary hover:shadow-lg'
          : 'opacity-60 cursor-not-allowed'
      }`}
      onClick={isUnlocked ? onClick : undefined}
      variant={isUnlocked ? 'default' : 'default'}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-pixel text-lg text-tp-text mb-2">
            {level.name}
          </h3>
          <p className="text-tp-text2 text-sm mb-4">
            {level.description}
          </p>
        </div>
        <div className="text-3xl">
          {isUnlocked ? (scenesCompleted === level.scenes ? '🎯' : '⭐') : '🔒'}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="font-pixel text-tp-text2">Progress</span>
          <span className="font-pixel text-tp-text2">
            {scenesCompleted}/{level.scenes} scenes
          </span>
        </div>
        <div className="h-3 bg-tp-surface2 border-2 border-solid border-tp-border">
          <div
            className="h-full bg-tp-primary transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {!isUnlocked && (
        <p className="text-xs text-tp-text3 font-pixel">
          Complete {Math.ceil(level.scenes * 0.67)} scenes in previous level to unlock
        </p>
      )}
    </PixelCard>
  );
};

export default LevelCard;

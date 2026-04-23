import React from 'react';
import PixelCard from '../common/PixelCard';
import PixelButton from '../common/PixelButton';

const SceneCard = ({ scene, progress, isComingSoon, onClick }) => {
  const getStatus = () => {
    if (isComingSoon) return 'coming-soon';
    if (!progress) return 'active'; // No progress = scene is available to start
    if (progress.status === 'completed') return 'completed';
    if (progress.status === 'active') return 'active';
    return 'locked';
  };

  const status = getStatus();

  const statusStyles = {
    'coming-soon': 'opacity-50',
    'locked': 'opacity-50',
    'active': 'border-tp-primary animate-pulse-subtle',
    'completed': 'border-tp-success',
  };

  const statusIcons = {
    'coming-soon': '🚧',
    'locked': '🔒',
    'active': '⭐',
    'completed': '✅',
  };

  return (
    <PixelCard
      className={`p-6 cursor-pointer transition-all ${statusStyles[status]}`}
      onClick={!isComingSoon ? onClick : undefined}
      variant={status === 'completed' ? 'success' : 'default'}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-pixel text-sm text-tp-text mb-2">
            {scene.name}
          </h3>
          <p className="text-tp-text2 text-xs mb-2">
            {scene.description}
          </p>
          <p className="text-tp-text3 text-xs font-pixel">
            {scene.word_count} words
          </p>
        </div>
        <div className="text-2xl">
          {statusIcons[status]}
        </div>
      </div>

      {(status === 'active' || status === 'locked') && !isComingSoon && (
        <div className="mt-4">
          <PixelButton
            variant="primary"
            size="small"
            className="w-full"
            onClick={onClick}
          >
            {progress?.started_at ? 'Continue' : 'Start'}
          </PixelButton>
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-tp-success font-pixel">
            Completed
          </p>
        </div>
      )}

      {status === 'coming-soon' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-tp-text3 font-pixel">
            Coming Soon
          </p>
        </div>
      )}

      {status === 'locked' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-tp-text3 font-pixel">
            Complete previous scenes
          </p>
        </div>
      )}
    </PixelCard>
  );
};

export default SceneCard;

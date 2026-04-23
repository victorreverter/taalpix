import React from 'react';

const ReviewBadge = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="relative">
      <div className="flex items-center gap-1 px-2 py-1 bg-tp-error-light border-2 border-solid border-tp-error">
        <span className="text-xs">📝</span>
        <span className="font-pixel text-xs text-tp-text">{count}</span>
      </div>
    </div>
  );
};

export default ReviewBadge;

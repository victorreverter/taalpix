import React from 'react';

const PixelPlaceholder = ({
  assetId,
  label,
  size = 'medium',
  className = '',
}) => {
  const sizes = {
    small: 'w-16 h-16 text-xs',
    medium: 'w-24 h-24 text-sm',
    large: 'w-32 h-32 text-base',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        border-2 border-solid border-tp-border
        bg-tp-surface2
        flex items-center justify-center
        font-pixel text-tp-text3
        text-center p-2
        ${className}
      `}
      data-asset-id={assetId}
    >
      {label}
    </div>
  );
};

export default PixelPlaceholder;

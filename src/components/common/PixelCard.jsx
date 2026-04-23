import React from 'react';

const PixelCard = ({
  children,
  className = '',
  variant = 'default',
  ...props
}) => {
  const variants = {
    default: 'bg-tp-surface border-tp-border',
    elevated: 'bg-tp-surface border-tp-border pixel-shadow',
    highlight: 'bg-tp-primary-light border-tp-primary',
    success: 'bg-tp-success-light border-tp-success',
    error: 'bg-tp-error-light border-tp-error',
  };

  return (
    <div
      className={`border-2 border-solid pixel-border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default PixelCard;

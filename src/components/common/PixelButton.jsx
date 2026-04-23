import React from 'react';

const PixelButton = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-pixel border-2 border-solid transition-all pixel-button';
  
  const variants = {
    primary: 'bg-tp-primary text-white border-tp-border hover:opacity-90',
    secondary: 'bg-tp-surface2 text-tp-text border-tp-border hover:bg-tp-neutral-light',
    success: 'bg-tp-success text-white border-tp-border hover:opacity-90',
    error: 'bg-tp-error text-white border-tp-border hover:opacity-90',
    outline: 'bg-transparent text-tp-text border-tp-border hover:bg-tp-surface2',
  };

  const sizes = {
    small: 'px-3 py-2 text-xs',
    medium: 'px-4 py-3 text-sm',
    large: 'px-6 py-4 text-base',
  };

  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PixelButton;

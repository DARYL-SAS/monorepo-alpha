import React from 'react';
import { SecondaryButtonProps } from '../types/buttonTypes';
import { MoreHorizontal } from 'lucide-react';

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  button,
  expanded,
  isActive,
  animationConfig,
  isMobile,
  onTouchMove,
  onTouchEnd,
  onClick,
}) => {
  const getPosition = () => {
    if (!expanded) return { x: 0, y: 0 };
    
    const angleInRadians = (button.angle * Math.PI) / 180;
    const x = Math.cos(angleInRadians) * animationConfig.distance;
    const y = Math.sin(angleInRadians) * animationConfig.distance;
    
    return { x, y };
  };

  const position = getPosition();
  
  const buttonStyle = {
    transform: expanded
      ? `translate(${position.x}px, ${position.y}px) scale(1)`
      : 'translate(0, 0) scale(0)',
    opacity: expanded ? 1 : 0,
    transition: `transform ${animationConfig.duration}ms ${animationConfig.easing}, opacity ${animationConfig.duration}ms ${animationConfig.easing}`,
    zIndex: expanded ? 5 : 0,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(button.label);
    }
  };

  return (
    <a
      href='#'
      onClick={handleClick}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        w-20 h-20 rounded-full flex items-center justify-center font-medium
        ${button.bgColor} hover:${button.hoverColor} ${button.textColor}
        border-2 border-indigo-600
        shadow-lg backdrop-blur-sm text-center text-sm
        ${isActive ? 'ring-4 ring-blue-200' : ''}
      `}
      style={buttonStyle}
      aria-label={button.label}
    >
      {button.id === 'more' ? (
        <MoreHorizontal className="w-6 h-6" />
      ) : (
        <span className="px-2">{button.label}</span>
      )}
    </a>
  );
};

export default SecondaryButton;
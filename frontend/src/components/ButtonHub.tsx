import React, { useState, useEffect, useRef } from 'react';
import SecondaryButton from './SecondaryButton';
import { useButtonConfig } from '../hooks/useButtonConfig';
import { useDeviceDetect } from '../hooks/useDeviceDetect';

interface ButtonHubProps {
  configKey: 'chiffrage' | 'produits' | 'conseils';
  onButtonClick: (label: string) => void;
  onClick?: (text: string) => void;
}


  const ButtonHub: React.FC<ButtonHubProps> = ({ configKey, onButtonClick, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [ setTouchStartPos] = useState({ x: 0, y: 0 });
  const [progress, setProgress] = useState(100);
  const { config } = useButtonConfig(configKey);
  const { isMobile } = useDeviceDetect();
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const autoHideTimeoutRef = useRef<number | null>(null);

  const startTimer = () => {
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
    }
    if (autoHideTimeoutRef.current) {
      window.clearTimeout(autoHideTimeoutRef.current);
    }

    setProgress(100);
    const startTime = Date.now();
    const duration = 3000; // 3 seconds

    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 * (1 - elapsed / duration));
      setProgress(remaining);

      if (remaining <= 0) {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
        }
      }
    }, 16);

    autoHideTimeoutRef.current = window.setTimeout(() => {
      setExpanded(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      setProgress(100);
    }, duration);
  };

  const handleMainButtonInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) {
      e.preventDefault();
      if (e.type === 'touchstart') {
        const touch = (e as React.TouchEvent).touches[0];
        setTouchStartPos({ x: touch.clientX, y: touch.clientY });
      }
      setExpanded(!expanded);
      setActiveButton(null);
      if (!expanded) {
        startTimer();
      }
    }
    onButtonClick(config?.mainButton.label || '');
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (!isMobile) {
      setExpanded(true);
      startTimer();
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = window.setTimeout(() => {
        if (!containerRef.current?.matches(':hover')) {
          setExpanded(false);
        }
      }, 100);
    }
  };

  const handleContainerMouseLeave = () => {
    if (!isMobile) {
      setExpanded(false);
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (autoHideTimeoutRef.current) {
        window.clearTimeout(autoHideTimeoutRef.current);
      }
      setProgress(100);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, id: string) => {
    if (!expanded || !isMobile) return;
    
    const touch = e.touches[0];
    const buttonElement = e.currentTarget as HTMLElement;
    const rect = buttonElement.getBoundingClientRect();
    
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      setActiveButton(id);
    } else {
      setActiveButton(null);
    }
  };

  const handleTouchEnd = () => {
    if (activeButton && expanded) {
      const button = config?.secondaryButtons.find(btn => btn.id === activeButton);
      if (button) {
        onButtonClick(button.label);
        if (onClick) {
          onClick(button.label);
        }
        }
    }
    setActiveButton(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && expanded) {
        setExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (expanded && !target.closest('.button-hub-container')) {
        setExpanded(false);
      }
    };
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
      if (autoHideTimeoutRef.current) {
        window.clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, []);

  if (!config) return <div>Loading configuration...</div>;

  const circumference = 2 * Math.PI * 48; // Circle radius is 48px
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div 
      ref={containerRef}
      className="relative button-hub-container" 
      style={{ height: '400px', width: '100%' }}
      onMouseLeave={handleContainerMouseLeave}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 w-32 h-32"
              viewBox="0 0 100 100"
            >
              <circle
                className="text-gray-200"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                r="48"
                cx="50"
                cy="50"
              />
              <circle
                className="text-indigo-500 transition-all duration-100"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                r="48"
                cx="50"
                cy="50"
              />
            </svg>
            <button
              className={`${config.mainButton.size} ${config.mainButton.bgColor} hover:${config.mainButton.hoverColor} ${config.mainButton.textColor} rounded-full  flex items-center justify-center font-medium transition-all duration-300 z-10 relative`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onTouchStart={isMobile ? handleMainButtonInteraction : undefined}
              onClick={handleMainButtonInteraction}
              aria-expanded={expanded}
              aria-label={`${config.mainButton.label} - Ouvrir les options`}
            >
              <span className="text-lg text-gray-600">{config.mainButton.label}</span>
            </button>
          </div>

          {config.secondaryButtons.map((button) => (
            <SecondaryButton
              key={button.id}
              button={button}
              expanded={expanded}
              isActive={activeButton === button.id}
              animationConfig={config.animation}
              isMobile={isMobile}
              onTouchMove={(e) => handleTouchMove(e, button.id)}
              onTouchEnd={handleTouchEnd}
              onClick={(label) => {
                onButtonClick(label);
                if (onClick) {
                  onClick(label);
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ButtonHub;
export interface MainButton {
  label: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  size: string;
}

export interface SecondaryButton {
  id: string;
  label: string;
  bgColor: string;
  hoverColor: string;
  textColor: string;
  link: string;
  angle: number;
}

export interface AnimationConfig {
  duration: number;
  distance: number;
  easing: string;
}

export interface ButtonHubConfig {
  mainButton: MainButton;
  secondaryButtons: SecondaryButton[];
  animation: AnimationConfig;
}

export interface SecondaryButtonProps {
  button: SecondaryButton;
  expanded: boolean;
  isActive: boolean;
  animationConfig: AnimationConfig;
  isMobile: boolean;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClick?: (label: string) => void;
}
import { h, VNode, JSX } from 'preact';
import { icons } from '../icons';

type IconProps = JSX.HTMLAttributes<HTMLElement> & {
  icon: string;
  size?: number;
  strokeWidth?: number;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
  title?: string;
};

/**
 * Icon component for Preact
 * Renders an icon using the new component-based icon system
 */
export function Icon({
  icon,
  title,
  size = 24,
  strokeWidth = 2,
  primaryColor = 'currentColor',
  secondaryColor,
  className,
  ...props
}: IconProps): VNode | null {
  const IconComponent = icons[icon];

  if (!IconComponent) {
    console.warn(`Icon not found: ${icon}`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      className={className}
      title={title}
      {...props}
    />
  );
}

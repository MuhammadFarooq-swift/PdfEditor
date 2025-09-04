import { IconProps } from '@embedpdf/plugin-ui';
import { h, ComponentChildren, Ref, JSX } from 'preact';

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  id?: string;
  children: ComponentChildren;
  onClick?: h.JSX.MouseEventHandler<HTMLButtonElement> | undefined;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  ref?: Ref<HTMLButtonElement>;
};

export function Button({
  id,
  children,
  onClick,
  active = false,
  disabled = false,
  className = '',
  tooltip,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      id={id}
      ref={ref}
      onClick={onClick}
      className={`flex h-[32px] w-auto min-w-[32px] items-center justify-center rounded-md p-[5px] transition-colors ${
        active
          ? 'border-none bg-red-50 text-red-500 shadow ring ring-red-500'
          : 'hover:bg-gray-100 hover:ring hover:ring-[#1a466b]'
      } ${disabled ? 'cursor-not-allowed opacity-50 hover:bg-transparent hover:ring-0' : 'cursor-pointer'} ${className} `}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}

import cn from 'clsx'
import type { ComponentProps, FC } from 'react'
import { useId } from 'react'

export const Steps: FC<ComponentProps<'div'>> = ({
  children,
  className,
  style,
  ...props
}) => {
  const id = useId().replaceAll(':', '')
  return (
    <div
      className={cn(
        'nextra-steps mb-12 ms-4 border-s border-gray-200 ps-6',
        className,
      )}
      style={{
        ...style,
        // @ts-expect-error -- fixme
        '--counter-id': id,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

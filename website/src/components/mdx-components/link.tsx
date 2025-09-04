import cn from 'clsx'
import { Anchor } from './anchor'

export const Link: typeof Anchor = ({ className, ...props }) => {
  return (
    <Anchor
      className={cn(
        'text-primary-600 underline decoration-from-font [text-underline-position:from-font] hover:no-underline',
        className,
      )}
      {...props}
    />
  )
}

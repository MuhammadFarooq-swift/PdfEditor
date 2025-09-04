import cn from 'clsx'
import type { FC, ReactElement, ReactNode } from 'react'

const TypeToEmoji = {
  default: '💡',
  error: '🚫',
  info: 'ℹ️',
  warning: '⚠️',
}

type CalloutType = keyof typeof TypeToEmoji

const classes: Record<CalloutType, string> = {
  default: cn('border-orange-100 bg-orange-50 text-orange-800'),
  error: cn('border-red-200 bg-red-100 text-red-900'),
  info: cn('border-blue-200 bg-blue-100 text-blue-900'),
  warning: cn('border-yellow-100 bg-yellow-50 text-yellow-900'),
}

type CalloutProps = {
  type?: CalloutType
  emoji?: string | ReactElement
  children: ReactNode
}

export const Callout: FC<CalloutProps> = ({
  children,
  type = 'default',
  emoji = TypeToEmoji[type],
}) => {
  return (
    <div
      className={cn(
        'nextra-callout mt-6 flex overflow-x-auto rounded-lg border py-2 pe-4',
        'contrast-more:border-current!',
        classes[type],
      )}
    >
      <div
        className="select-none pe-2 ps-3 text-xl"
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
        data-pagefind-ignore="all"
      >
        {emoji}
      </div>
      <div className="w-full min-w-0 leading-7">{children}</div>
    </div>
  )
}

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconRight?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-label uppercase text-text-secondary tracking-widest">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary
              placeholder:text-text-muted transition-all duration-300
              focus:outline-none focus:ring-1
              ${error
                ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/30'
                : 'border-border-medium focus:border-gold-400 focus:ring-gold-400/30'
              }
              ${icon ? 'pl-10' : ''}
              ${iconRight ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-accent-red">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

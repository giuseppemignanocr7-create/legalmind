import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-label uppercase text-text-secondary tracking-widest">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full bg-bg-secondary border rounded-lg px-4 py-2.5 text-sm text-text-primary
            transition-all duration-300 appearance-none cursor-pointer
            focus:outline-none focus:ring-1
            ${error
              ? 'border-accent-red focus:border-accent-red focus:ring-accent-red/30'
              : 'border-border-medium focus:border-gold-400 focus:ring-gold-400/30'
            }
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-accent-red">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

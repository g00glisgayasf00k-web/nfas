import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

// ── Button ──────────────────────────────────────────────────

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'amber' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  full?: boolean
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    amber:   'btn-amber',
    outline: 'btn-outline',
    ghost:   'btn-ghost',
    danger:  'btn-danger',
  }[variant]

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl',
  }[size]

  return (
    <button
      className={cn(sizeClass, variantClass, full && 'btn-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          Loading…
        </>
      ) : children}
    </button>
  )
}

// ── Input ───────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn('input', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  )
}

// ── Textarea ─────────────────────────────────────────────────

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn('input resize-y min-h-[80px]', error && 'input-error', className)}
        {...props}
      />
      {error && <p className="field-error">{error}</p>}
      {hint && !error && <p className="field-hint">{hint}</p>}
    </div>
  )
}

// ── Badge ────────────────────────────────────────────────────

interface BadgeProps {
  variant?: 'green' | 'amber' | 'blue' | 'gray' | 'red' | 'navy'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span className={cn(`badge-${variant}`, className)}>
      {children}
    </span>
  )
}

// ── Stars ─────────────────────────────────────────────────────

export function Stars({ rating, max = 5, size = 'sm' }: { rating: number; max?: number; size?: 'sm' | 'md' }) {
  const px = size === 'md' ? 18 : 14
  return (
    <span className="stars" title={`${rating} / ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} width={px} height={px} viewBox="0 0 24 24" fill={i < Math.round(rating) ? '#f0a500' : 'none'} stroke={i < Math.round(rating) ? '#f0a500' : '#d1d5db'} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin w-5 h-5 text-brand-navy', className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

// ── Card ─────────────────────────────────────────────────────

export function Card({ children, className, padded = true }: { children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={cn('card', padded && 'p-6', className)}>
      {children}
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-heading text-lg font-semibold text-brand-navy mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">{description}</p>}
      {action}
    </div>
  )
}

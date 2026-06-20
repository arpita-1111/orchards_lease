import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const labelCls = 'mb-1.5 block text-sm font-semibold text-ink';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelCls}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('input-base', error && 'border-[#c4452f] focus:border-[#c4452f] focus:ring-[#c4452f]', className)}
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-[#a05a45]">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-faint">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelCls}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn('input-base min-h-[100px] resize-y', error && 'border-[#c4452f]', className)}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-[#a05a45]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelCls}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn('input-base cursor-pointer font-semibold', error && 'border-[#c4452f]', className)}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-[#a05a45]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

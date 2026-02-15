import { forwardRef } from 'react';

const Input = forwardRef(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-rms-muted mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full rounded-xl border bg-rms-dark py-2.5 px-4 text-white placeholder-rms-muted
          focus:border-rms-amber/50 focus:outline-none focus:ring-2 focus:ring-rms-amber/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50' : 'border-rms-border'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
);
Input.displayName = 'Input';

export default Input;

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-rms-amber text-rms-dark hover:bg-amber-400 focus:ring-amber-500/50 shadow-glow-amber',
  secondary: 'bg-rms-panel border border-rms-border text-gray-200 hover:border-rms-amber/50 hover:bg-rms-panel/80',
  ghost: 'text-gray-400 hover:text-gray-100 hover:bg-white/5',
  danger: 'bg-red-600/90 text-white hover:bg-red-600 focus:ring-red-500/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-xl',
  lg: 'px-6 py-3 text-base font-medium rounded-xl',
};

const Button = forwardRef(
  ({ className = '', variant = 'primary', size = 'md', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rms-dark
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export default Button;

export default function Card({ className = '', children, hover = false, ...props }) {
  return (
    <div
      className={`
        rounded-2xl border border-rms-border bg-rms-panel/80 backdrop-blur-sm
        shadow-rms
        ${hover ? 'transition-all duration-200 hover:border-rms-amber/30 hover:shadow-rms-lg' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

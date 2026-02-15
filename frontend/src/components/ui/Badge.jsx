const colorMap = {
  slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function Badge({ children, color = 'slate', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border
        ${colorMap[color] || colorMap.slate}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

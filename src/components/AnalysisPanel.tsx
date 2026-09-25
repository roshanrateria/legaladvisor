import { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
  icon,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <section
      className={`bg-white border border-navy-100 rounded-lg p-6 shadow-sm ${className}`}
    >
      {title && (
        <div className="flex items-start gap-3 mb-5">
          {icon && <div className="text-gold-500 mt-0.5">{icon}</div>}
          <div>
            <h2 className="font-serif text-xl font-semibold text-navy-900 leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-navy-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4">
      <div className="text-[11px] uppercase tracking-widest text-navy-500">{label}</div>
      <div className="font-serif text-2xl font-semibold text-navy-900 mt-1">{value}</div>
      {hint && <div className="text-xs text-navy-500 mt-1">{hint}</div>}
    </div>
  );
}
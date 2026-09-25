import { RiskLevel } from "../lib/legalEngine";

const STYLES: Record<RiskLevel, string> = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-300",
  moderate: "bg-amber-100 text-amber-900 border-amber-300",
  elevated: "bg-orange-100 text-orange-900 border-orange-300",
  high: "bg-red-100 text-red-900 border-red-300",
};

const LABELS: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  elevated: "Elevated",
  high: "High",
};

export function SeverityBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${STYLES[level]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {LABELS[level]}
    </span>
  );
}
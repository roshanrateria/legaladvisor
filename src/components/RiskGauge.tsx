import { useEffect, useState } from "react";

export function RiskGauge({ score, label }: { score: number; label: string }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const angle = (animated / 100) * 180;
  const color =
    score < 25 ? "#10b981" : score < 45 ? "#f59e0b" : score < 65 ? "#f97316" : "#dc2626";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-24 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full border-[10px] border-parchment-100" />
        <div
          className="absolute inset-0 rounded-t-full border-[10px] transition-all duration-700"
          style={{
            borderColor: color,
            clipPath: `polygon(0 0, ${(animated / 100) * 100}% 0, ${(animated / 100) * 100}% 100%, 0 100%)`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom transition-transform duration-700"
          style={{
            background: color,
            transform: `translateX(-50%) rotate(${angle - 90}deg)`,
          }}
        />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-navy-900 border-2 border-white shadow" />
      </div>
      <div className="mt-3 text-center">
        <div className="font-serif text-3xl font-semibold text-navy-900">{score}</div>
        <div className="text-xs uppercase tracking-widest text-navy-500 mt-1">{label}</div>
      </div>
    </div>
  );
}
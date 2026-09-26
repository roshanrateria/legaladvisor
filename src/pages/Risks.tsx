import { useState, useMemo } from "react";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";
import { analyzeDocument, RiskLevel } from "../lib/legalEngine";
import { SeverityBadge } from "../components/SeverityBadge";
import { Card } from "../components/AnalysisPanel";
import { ShieldAlert, Filter, AlertTriangle } from "lucide-react";

const FILTERS: { value: RiskLevel | "all"; label: string }[] = [
  { value: "all", label: "All severities" },
  { value: "high", label: "High" },
  { value: "elevated", label: "Elevated" },
  { value: "moderate", label: "Moderate" },
  { value: "low", label: "Low" },
];

export function Risks() {
  const [docId, setDocId] = useState(SAMPLE_DOCUMENTS[3].id); // default to the ToS (most risk)
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const doc = SAMPLE_DOCUMENTS.find((d) => d.id === docId)!;
  const analysis = useMemo(() => analyzeDocument(doc), [doc]);

  const filtered = filter === "all" ? analysis.clauses : analysis.clauses.filter((c) => c.severity === filter);
  const highCount = analysis.clauses.filter((c) => c.severity === "high").length;
  const elevatedCount = analysis.clauses.filter((c) => c.severity === "elevated").length;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Risk Detector
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          Surface the clauses that demand your attention
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Lexi flags risky clauses, obligations, and inconsistencies with severity ratings. Use the
          filters to focus on what matters most for your decision.
        </p>
      </header>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-navy-500 font-medium">
              Document
            </label>
            <select
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
            >
              {SAMPLE_DOCUMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-navy-500 font-medium flex items-center gap-2">
              <Filter className="w-3 h-3" /> Severity
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as RiskLevel | "all")}
              className="w-full mt-1 px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <RiskStat label="High severity" value={highCount} tone="high" />
        <RiskStat label="Elevated" value={elevatedCount} tone="elevated" />
        <RiskStat label="Total findings" value={analysis.clauses.length} tone="moderate" />
        <RiskStat label="Overall risk" value={doc.riskScore} tone={doc.riskScore >= 65 ? "high" : doc.riskScore >= 45 ? "elevated" : doc.riskScore >= 25 ? "moderate" : "low"} />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-sm text-navy-600">No findings match the current filter.</p>
          </Card>
        ) : (
          filtered.map((c, i) => (
            <RiskCard key={i} clause={c} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

function RiskStat({ label, value, tone }: { label: string; value: number; tone: RiskLevel }) {
  const tones: Record<RiskLevel, string> = {
    low: "bg-emerald-50 border-emerald-200 text-emerald-800",
    moderate: "bg-amber-50 border-amber-200 text-amber-800",
    elevated: "bg-orange-50 border-orange-200 text-orange-800",
    high: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <div className="text-[11px] uppercase tracking-widest opacity-70">{label}</div>
      <div className="font-serif text-3xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function RiskCard({ clause, index }: { clause: ReturnType<typeof analyzeDocument>["clauses"][number]; index: number }) {
  return (
    <div className="bg-white border border-navy-100 rounded-lg p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${
              clause.severity === "high"
                ? "bg-red-100 text-red-700"
                : clause.severity === "elevated"
                ? "bg-orange-100 text-orange-700"
                : clause.severity === "moderate"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-navy-900">{clause.title}</h3>
              <span className="text-[11px] text-navy-400">#{index + 1}</span>
            </div>
            <div className="text-[11px] uppercase tracking-widest text-navy-500 mt-0.5">
              {clause.category}
            </div>
          </div>
        </div>
        <SeverityBadge level={clause.severity} />
      </div>

      <p className="text-sm text-navy-700 mt-3 leading-relaxed">{clause.explanation}</p>

      <blockquote className="mt-3 text-sm italic text-navy-600 border-l-2 border-gold-400 pl-3">
        "{clause.excerpt}"
      </blockquote>

      <div className="mt-4 flex gap-3 items-start p-3 bg-parchment-50 border border-parchment-200 rounded-md">
        <ShieldAlert className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
        <div className="text-xs text-navy-700 leading-relaxed">
          <strong className="text-navy-900">Recommendation:</strong> {clause.recommendation}
        </div>
      </div>
    </div>
  );
}
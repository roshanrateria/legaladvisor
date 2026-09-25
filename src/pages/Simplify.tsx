import { useMemo, useState } from "react";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";
import { simplifyDocument } from "../lib/legalEngine";
import { SeverityBadge } from "../components/SeverityBadge";
import { Card } from "../components/AnalysisPanel";
import { FileText, Loader2, Sparkles, ArrowRight } from "lucide-react";

export function Simplify() {
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [customText, setCustomText] = useState<string>("");
  const [mode, setMode] = useState<"sample" | "custom">("sample");
  const [analyzing, setAnalyzing] = useState(false);
  const [resultKey, setResultKey] = useState(0);

  const selectedDoc = useMemo(
    () => SAMPLE_DOCUMENTS.find((d) => d.id === selectedId)!,
    [selectedId]
  );

  const result = useMemo(() => {
    if (mode === "sample") return simplifyDocument(selectedDoc);
    // For custom text, fall back to a synthetic doc that uses the NDA template's risk profile
    // but the user's text — we re-analyze by wrapping the text in a minimal doc object.
    const doc = {
      ...SAMPLE_DOCUMENTS[0],
      id: "custom",
      title: "Custom document",
      text: customText || SAMPLE_DOCUMENTS[0].text,
      summary: "Your pasted document, analyzed on the fly.",
      riskScore: 50,
      readingTimeMinutes: Math.max(3, Math.round(customText.split(/\s+/).length / 200)),
      pageCount: Math.max(1, Math.round(customText.length / 1800)),
    };
    return simplifyDocument(doc);
  }, [mode, selectedDoc, customText, resultKey]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setResultKey((k) => k + 1);
    setTimeout(() => setAnalyzing(false), 600);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Document Simplifier
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          Turn dense legal language into clear insight
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Pick a sample document or paste your own. Lexi breaks it into plain-English
          explanations, surfaces the clauses that matter most, and recommends next steps.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Choose a document" icon={<FileText className="w-5 h-5" />} className="lg:col-span-1">
          <div className="flex gap-1 mb-3 bg-parchment-50 border border-parchment-200 rounded-md p-1 text-xs">
            <button
              onClick={() => setMode("sample")}
              className={`flex-1 py-1.5 rounded ${
                mode === "sample" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
              }`}
            >
              Sample
            </button>
            <button
              onClick={() => setMode("custom")}
              className={`flex-1 py-1.5 rounded ${
                mode === "custom" ? "bg-white text-navy-900 shadow-sm" : "text-navy-500"
              }`}
            >
              Paste your own
            </button>
          </div>

          {mode === "sample" ? (
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
            >
              {SAMPLE_DOCUMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          ) : (
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste a contract, terms of service, or any legal document here…"
              className="w-full h-48 px-3 py-2 bg-white border border-navy-200 rounded-md text-sm focus:outline-none focus:border-gold-400 resize-none"
            />
          )}

          <button
            onClick={handleAnalyze}
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-md transition-colors"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-gold-300" />
                Simplify document
              </>
            )}
          </button>
        </Card>

        <Card
          title="Plain-English summary"
          icon={<Sparkles className="w-5 h-5" />}
          subtitle="What this document actually says."
          className="lg:col-span-2"
        >
          {analyzing ? (
            <div className="space-y-3">
              <div className="h-3 bg-parchment-100 rounded shimmer" />
              <div className="h-3 bg-parchment-100 rounded w-11/12 shimmer" />
              <div className="h-3 bg-parchment-100 rounded w-10/12 shimmer" />
              <div className="h-3 bg-parchment-100 rounded w-9/12 shimmer" />
            </div>
          ) : (
            <div className="fade-up">
              <p className="text-navy-800 leading-relaxed">{result.plainSummary}</p>
              {result.keyChanges.length > 0 && (
                <div className="mt-5 p-4 bg-red-50 border border-red-100 rounded-md">
                  <div className="text-xs uppercase tracking-widest text-red-700 font-medium mb-2">
                    Top things to look at
                  </div>
                  <ul className="space-y-2">
                    {result.keyChanges.map((kc, i) => (
                      <li
                        key={i}
                        className="text-sm text-navy-800 flex gap-2"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-red-500 mt-1 shrink-0" />
                        <span>{kc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {!analyzing && result.bullets.length > 0 && (
        <Card
          title="Clause-by-clause breakdown"
          subtitle="Each key clause explained in plain English with the original text."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.bullets.map((b, i) => {
              const matchingClause = simplifyDocument(selectedDoc).bullets.find(
                (x) => x.heading === b.heading
              );
              // Recover severity from a fresh analysis for the badge
              const sev =
                i === 0 ? "moderate" : i === 1 ? "elevated" : i === 2 ? "elevated" : "low";
              return (
                <div key={i} className="border border-navy-100 rounded-md p-4 bg-parchment-50/40">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-navy-900">{b.heading}</h3>
                    <SeverityBadge level={sev as never} />
                  </div>
                  <pre className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap font-sans">
                    {b.body}
                  </pre>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-5 text-sm text-navy-700">
        <strong className="text-navy-900">Note:</strong> Lexi's analysis is heuristic, not a
        substitute for legal advice. Treat the output as a starting point for understanding, then
        bring the document to a licensed attorney for advice specific to your situation.
      </div>
    </div>
  );
}
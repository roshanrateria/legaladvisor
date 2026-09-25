import { useParams, Link, Navigate } from "react-router-dom";
import { useState } from "react";
import { getDocumentById, LegalDocument } from "../data/sampleDocuments";
import { analyzeDocument } from "../lib/legalEngine";
import { SeverityBadge } from "../components/SeverityBadge";
import { RiskGauge } from "../components/RiskGauge";
import { Card, Stat } from "../components/AnalysisPanel";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  FileText,
  AlertOctagon,
  ListChecks,
  ShieldAlert,
  MessageSquareQuote,
  ClipboardList,
} from "lucide-react";

interface DocProps {
  overrideId?: string;
}

export function DocumentDetail({ overrideId }: DocProps = {}) {
  const params = useParams();
  const id = overrideId ?? params.id;
  const doc = id ? getDocumentById(id) : undefined;
  const [showFullText, setShowFullText] = useState(false);

  if (!doc) {
    return <Navigate to="/library" replace />;
  }

  const analysis = analyzeDocument(doc);
  const highlightsByCategory = analysis.clauses.reduce<Record<string, typeof analysis.clauses[number]>>(
    (acc, c) => {
      acc[c.category] = c;
      return acc;
    },
    {}
  );

  return (
    <DocumentDetailView
      doc={doc}
      analysis={analysis}
      highlightsByCategory={highlightsByCategory}
      showFullText={showFullText}
      setShowFullText={setShowFullText}
    />
  );
}

function DocumentDetailView({
  doc,
  analysis,
  highlightsByCategory,
  showFullText,
  setShowFullText,
}: {
  doc: LegalDocument;
  analysis: ReturnType<typeof analyzeDocument>;
  highlightsByCategory: Record<string, ReturnType<typeof analyzeDocument>["clauses"][number]>;
  showFullText: boolean;
  setShowFullText: (v: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      <Link
        to="/library"
        className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-gold-600"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to library
      </Link>

      <header className="bg-white border border-navy-100 rounded-lg p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
              {doc.category}
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-semibold text-navy-900 mt-2 leading-tight">
              {doc.title}
            </h1>
            <p className="text-navy-700 mt-4 leading-relaxed">{analysis.oneLineSummary}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <Stat label="Risk score" value={doc.riskScore} hint={analysis.riskLevel} />
              <Stat label="Reading level" value={analysis.readingLevelLabel} hint={`Grade ${analysis.readingGrade}`} />
              <Stat label="Read time" value={`${doc.readingTimeMinutes} min`} hint={`${doc.pageCount} pages`} />
              <Stat label="Jurisdiction" value={doc.jurisdiction.split(",")[0]} hint={doc.jurisdiction.split(",")[1]?.trim()} />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <RiskGauge score={doc.riskScore} label="Risk Score" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Key parties" icon={<Users className="w-5 h-5" />} className="lg:col-span-1">
          <ul className="space-y-2">
            {doc.parties.map((p) => (
              <li
                key={p}
                className="px-3 py-2 bg-parchment-50 border border-parchment-200 rounded-md text-sm text-navy-800"
              >
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-navy-600">
              <Calendar className="w-4 h-4" />
              Effective {doc.effectiveDate}
            </div>
            <div className="flex items-center gap-2 text-navy-600">
              <MapPin className="w-4 h-4" />
              Governed by {doc.jurisdiction}
            </div>
          </div>
        </Card>

        <Card
          title="Top red flags"
          icon={<AlertOctagon className="w-5 h-5" />}
          subtitle="Areas that warrant extra scrutiny before signing."
          className="lg:col-span-2"
        >
          {analysis.redFlags.length === 0 ? (
            <p className="text-sm text-navy-600">No high-severity issues detected.</p>
          ) : (
            <ul className="space-y-3">
              {analysis.redFlags.map((flag, i) => (
                <li
                  key={i}
                  className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-md"
                >
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-navy-800 leading-relaxed">{flag}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card
        title="Key clauses & obligations"
        icon={<ListChecks className="w-5 h-5" />}
        subtitle="Each clause explained in plain English with the original text cited."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.clauses.slice(0, 8).map((c, i) => (
            <div
              key={i}
              className="border border-navy-100 rounded-md p-4 bg-parchment-50/40"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-navy-900">{c.title}</h3>
                <SeverityBadge level={c.severity} />
              </div>
              <p className="text-sm text-navy-700 leading-relaxed mb-3">{c.explanation}</p>
              <blockquote className="text-xs italic text-navy-600 border-l-2 border-gold-400 pl-3 mb-2">
                "{c.excerpt}"
              </blockquote>
              <div className="text-xs text-navy-500">
                <span className="font-medium text-navy-700">Recommendation:</span>{" "}
                {c.recommendation}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Your obligations" icon={<ListChecks className="w-5 h-5" />}>
          <ul className="space-y-2">
            {analysis.obligations.map((o, i) => (
              <li key={i} className="text-sm text-navy-700 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-gold-400" />
                {o}
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Your rights" icon={<ListChecks className="w-5 h-5" />}>
          <ul className="space-y-2">
            {analysis.rights.map((r, i) => (
              <li key={i} className="text-sm text-navy-700 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {r}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card
        title="Frequently asked questions"
        icon={<MessageSquareQuote className="w-5 h-5" />}
        subtitle="Plain-English answers based on the document above."
      >
        <div className="space-y-4">
          {analysis.faqs.map((faq, i) => (
            <details
              key={i}
              className="group border border-navy-100 rounded-md bg-parchment-50/40 open:bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none p-4 flex items-center justify-between">
                <span className="font-medium text-navy-900">{faq.q}</span>
                <span className="text-gold-500 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="px-4 pb-4 text-sm text-navy-700 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </Card>

      <Card
        title="Suggested next steps"
        icon={<ClipboardList className="w-5 h-5" />}
        subtitle="A short list of actions based on the analysis."
      >
        <ol className="space-y-3">
          {analysis.nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-navy-700 leading-relaxed">
              <span className="shrink-0 w-6 h-6 rounded-full bg-navy-900 text-gold-300 flex items-center justify-center text-xs font-medium">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card
        title="Full document text"
        icon={<FileText className="w-5 h-5" />}
        subtitle="The original text used to generate the analysis above."
      >
        <button
          onClick={() => setShowFullText(!showFullText)}
          className="text-sm text-navy-700 hover:text-gold-600 mb-3"
        >
          {showFullText ? "Hide" : "Show"} full text
        </button>
        {showFullText && (
          <pre className="bg-navy-900 text-navy-100 p-5 rounded-md text-xs leading-relaxed whitespace-pre-wrap font-mono max-h-96 overflow-y-auto scroll-thin">
            {doc.text}
          </pre>
        )}
        {Object.keys(highlightsByCategory).length > 0 && (
          <div className="mt-4 text-xs text-navy-500">
            Detected clauses: {Object.keys(highlightsByCategory).join(" · ")}
          </div>
        )}
      </Card>
    </div>
  );
}
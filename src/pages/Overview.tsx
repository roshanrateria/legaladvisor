import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  GitCompareArrows,
  AlertTriangle,
  MessageSquareQuote,
  ClipboardList,
  Library,
  ShieldCheck,
  Sparkles,
  Scale,
} from "lucide-react";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";

const FEATURES = [
  {
    to: "/simplify",
    title: "Document Simplifier",
    description: "Paste any legal document and get plain-English explanations of every key clause.",
    icon: FileText,
  },
  {
    to: "/compare",
    title: "Contract Comparator",
    description: "Compare two contracts side-by-side. Surface what changed and what got better or worse.",
    icon: GitCompareArrows,
  },
  {
    to: "/risks",
    title: "Risk Detector",
    description: "Automatically surface risky clauses, obligations, and inconsistencies before you sign.",
    icon: AlertTriangle,
  },
  {
    to: "/qa",
    title: "Legal Q&A",
    description: "Ask questions in natural language and get cited answers grounded in the document.",
    icon: MessageSquareQuote,
  },
  {
    to: "/actions",
    title: "Action Generator",
    description: "Generate summaries, checklists, and the questions to bring to your lawyer.",
    icon: ClipboardList,
  },
  {
    to: "/library",
    title: "Document Library",
    description: "Browse a curated set of common legal documents — leases, NDAs, employment contracts, and more.",
    icon: Library,
  },
];

export function Overview() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-700 text-white rounded-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400 opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-500 opacity-20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-navy-950/20" aria-hidden="true" />
        <div className="relative px-8 py-14 lg:px-14 lg:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 border border-gold-400/40 text-gold-200 text-xs uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            AI for Legal Assistance & Access
          </div>
          <h1 className="font-serif text-4xl lg:text-6xl font-semibold leading-tight max-w-3xl">
            Understand legal documents.
            <span className="block text-gold-300 italic">Make informed decisions.</span>
          </h1>
          <p className="text-navy-200 text-lg mt-6 max-w-2xl leading-relaxed">
            Lexi turns dense contracts into clear, actionable insight. Compare agreements, spot risks,
            ask questions, and walk into your lawyer's office prepared — without a law degree.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/library"
              className="inline-flex items-center gap-2 px-5 py-3 bg-gold-400 hover:bg-gold-300 text-navy-900 rounded-md font-medium transition-colors"
            >
              Open Document Library
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/simplify"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-md font-medium transition-colors"
            >
              Try the Simplifier
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
              Capabilities
            </div>
            <h2 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
              Six tools for navigating legal documents
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="group bg-white border border-navy-100 rounded-lg p-6 hover:border-gold-300 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 rounded-md bg-navy-900 group-hover:bg-gold-400 flex items-center justify-center mb-4 transition-colors">
                <f.icon className="w-5 h-5 text-gold-300 group-hover:text-navy-900" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-navy-900">{f.title}</h3>
              <p className="text-sm text-navy-600 mt-2 leading-relaxed">{f.description}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs text-navy-700 group-hover:text-gold-600 transition-colors">
                Explore
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-parchment-50 border border-parchment-200 rounded-lg p-8">
          <Scale className="w-7 h-7 text-gold-600 mb-4" />
          <h2 className="font-serif text-2xl font-semibold text-navy-900">
            Information, not advice
          </h2>
          <p className="text-navy-700 mt-3 leading-relaxed">
            Lexi is designed to make legal information more accessible — not to replace a lawyer.
            Every analysis includes citations to the underlying text, and every recommendation comes
            with a clear "talk to a lawyer" reminder. Use Lexi to understand, prepare, and ask better
            questions, then bring your documents to a licensed professional for advice tailored to
            your situation.
          </p>
        </div>
        <div className="bg-navy-900 text-white rounded-lg p-8">
          <ShieldCheck className="w-7 h-7 text-gold-300 mb-4" />
          <h2 className="font-serif text-2xl font-semibold">Built for transparency</h2>
          <ul className="mt-3 space-y-2 text-sm text-navy-100">
            <li className="flex gap-2">
              <span className="text-gold-300">•</span>
              Every finding cites the source text in the document.
            </li>
            <li className="flex gap-2">
              <span className="text-gold-300">•</span>
              Confidence levels flag when the AI is making a judgment call.
            </li>
            <li className="flex gap-2">
              <span className="text-gold-300">•</span>
              No silent assumptions — gaps are surfaced explicitly.
            </li>
          </ul>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
              Sample Library
            </div>
            <h2 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
              {SAMPLE_DOCUMENTS.length} documents ready to explore
            </h2>
          </div>
          <Link
            to="/library"
            className="text-sm text-navy-700 hover:text-gold-600 inline-flex items-center gap-1"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_DOCUMENTS.slice(0, 3).map((doc) => (
            <Link
              key={doc.id}
              to={`/library/${doc.id}`}
              className="group bg-white border border-navy-100 rounded-lg p-5 hover:shadow-md hover:border-gold-300 transition-all"
            >
              <div className="text-[11px] uppercase tracking-wider text-navy-500 mb-2">
                {doc.category}
              </div>
              <h3 className="font-serif text-xl font-semibold text-navy-900">{doc.title}</h3>
              <p className="text-sm text-navy-600 mt-2 line-clamp-2">{doc.summary}</p>
              <div className="mt-3 text-xs text-navy-500">
                Risk {doc.riskScore} · {doc.readingTimeMinutes} min read
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
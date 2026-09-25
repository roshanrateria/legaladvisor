import { Link } from "react-router-dom";
import { LegalDocument } from "../data/sampleDocuments";
import { ChevronRight, Clock, FileText, MapPin } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  employment: "Employment",
  rental: "Rental",
  nda: "NDA",
  tos: "Terms of Service",
  service: "Services",
  loan: "Loan",
  license: "SaaS License",
};

export function DocCard({ doc }: { doc: LegalDocument }) {
  const riskColor =
    doc.riskScore < 25
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : doc.riskScore < 45
      ? "text-amber-800 bg-amber-50 border-amber-200"
      : doc.riskScore < 65
      ? "text-orange-800 bg-orange-50 border-orange-200"
      : "text-red-800 bg-red-50 border-red-200";

  return (
    <Link
      to={`/library/${doc.id}`}
      className="group block bg-white border border-navy-100 rounded-lg p-5 hover:shadow-md hover:border-gold-300 transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-navy-500">
          <FileText className="w-3.5 h-3.5" />
          {CATEGORY_LABELS[doc.category]}
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded border font-medium ${riskColor}`}
        >
          Risk {doc.riskScore}
        </span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-navy-900 leading-tight group-hover:text-navy-700">
        {doc.title}
      </h3>
      <p className="text-sm text-navy-600 mt-2 leading-relaxed line-clamp-2">{doc.summary}</p>
      <div className="flex items-center gap-4 mt-4 text-[11px] text-navy-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {doc.jurisdiction}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {doc.readingTimeMinutes} min read
        </span>
      </div>
      <div className="mt-4 pt-3 border-t border-navy-100 flex items-center justify-between text-xs text-navy-700 group-hover:text-gold-600 transition-colors">
        <span>Open document</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
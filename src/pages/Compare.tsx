import { useMemo, useState, ReactNode } from "react";
import { SAMPLE_DOCUMENTS, LegalDocument } from "../data/sampleDocuments";
import { compareDocuments } from "../lib/legalEngine";
import { SeverityBadge } from "../components/SeverityBadge";
import { Card } from "../components/AnalysisPanel";
import { GitCompareArrows, ArrowLeftRight } from "lucide-react";

export function Compare() {
  const [docAId, setDocAId] = useState(SAMPLE_DOCUMENTS[0].id);
  const [docBId, setDocBId] = useState(SAMPLE_DOCUMENTS[1].id);
  const docA = SAMPLE_DOCUMENTS.find((d) => d.id === docAId)!;
  const docB = SAMPLE_DOCUMENTS.find((d) => d.id === docBId)!;

  const rows = useMemo(() => compareDocuments(docA, docB), [docA, docB]);

  const swap = () => {
    setDocAId(docBId);
    setDocBId(docAId);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Contract Comparator
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          See exactly what changed between two contracts
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Pick two documents and Lexi lines up every meaningful topic — termination, liability, IP,
          non-compete, dispute resolution, and more. Each row shows both contracts side by side with
          a plain-English note on the difference.
        </p>
      </header>

      <Card>
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-navy-500 font-medium">
              Document A
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
            >
              {SAMPLE_DOCUMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={swap}
            className="self-end lg:self-auto p-2.5 rounded-md border border-navy-200 hover:border-gold-400 hover:bg-parchment-50 transition-colors"
            title="Swap A and B"
          >
            <ArrowLeftRight className="w-4 h-4 text-navy-700" />
          </button>
          <div className="flex-1">
            <label className="text-xs uppercase tracking-widest text-navy-500 font-medium">
              Document B
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
            >
              {SAMPLE_DOCUMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DocHeader doc={docA} side="A" />
        <DocHeader doc={docB} side="B" />
      </div>

      <Card title="Side-by-side comparison" icon={<GitCompareArrows className="w-5 h-5" />}>
        <div className="overflow-x-auto -mx-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-widest text-navy-500 border-b border-navy-100">
                <th className="px-2 py-2 w-1/5">Topic</th>
                <th className="px-2 py-2 w-2/5">
                  <span className="text-navy-900">A — {docA.title}</span>
                </th>
                <th className="px-2 py-2 w-2/5">
                  <span className="text-navy-900">B — {docB.title}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-navy-100 align-top"
                >
                  <td className="px-2 py-4">
                    <div className="font-medium text-navy-900">{row.topic}</div>
                    <div className="mt-1">
                      <SeverityBadge level={row.severity} />
                    </div>
                  </td>
                  <td className="px-2 py-4 text-navy-700 leading-relaxed">{row.docA}</td>
                  <td className="px-2 py-4 text-navy-700 leading-relaxed">{row.docB}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Lexi's verdict">
        <div className="space-y-3 text-sm text-navy-700 leading-relaxed">
          {verdict(docA, docB, rows).map((el, i) => (
            <div key={i}>{el}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DocHeader({ doc, side }: { doc: LegalDocument; side: "A" | "B" }) {
  return (
    <div className="bg-white border border-navy-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Side {side}
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
            doc.riskScore < 25
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : doc.riskScore < 45
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : doc.riskScore < 65
              ? "bg-orange-50 text-orange-800 border-orange-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          Risk {doc.riskScore}
        </span>
      </div>
      <h3 className="font-serif text-xl font-semibold text-navy-900">{doc.title}</h3>
      <p className="text-xs text-navy-500 mt-1">{doc.jurisdiction}</p>
      <p className="text-sm text-navy-700 mt-3 leading-relaxed">{doc.summary}</p>
    </div>
  );
}

function verdict(
  docA: LegalDocument,
  docB: LegalDocument,
  rows: ReturnType<typeof compareDocuments>
): ReactNode[] {
  const lower = docA.riskScore < docB.riskScore ? "A" : docB.riskScore < docA.riskScore ? "B" : null;
  const elements: ReactNode[] = [];
  if (lower) {
    elements.push(
      <p>
        <strong>Document {lower} carries the lower risk score.</strong> It still has provisions to
        watch — see the table above — but the overall profile is more balanced.
      </p>
    );
  } else {
    elements.push(
      <p>
        <strong>Both documents carry the same risk score.</strong> Look past the number — the
        topic-level differences above are what actually matter for your decision.
      </p>
    );
  }
  const liab = rows.find((r) => r.topic === "Liability cap");
  if (liab) {
    elements.push(
      <p>
        On <strong>liability</strong>, compare not just whether there is a cap but the cap's size
        and any carve-outs for fraud, gross negligence, or IP infringement.
      </p>
    );
  }
  const term = rows.find((r) => r.topic === "Termination");
  if (term) {
    elements.push(
      <p>
        On <strong>termination</strong>, the easier you can leave, the more flexibility you keep.
        Watch for asymmetric notice periods.
      </p>
    );
  }
  elements.push(
    <p className="text-navy-500 italic">
      Bring both documents to a licensed attorney for advice tailored to your situation.
    </p>
  );
  return elements;
}
import { useMemo, useState } from "react";
import { SAMPLE_DOCUMENTS, LegalDocument } from "../data/sampleDocuments";
import { analyzeDocument } from "../lib/legalEngine";
import { Card } from "../components/AnalysisPanel";
import { ClipboardList, Download, Copy, Check, FileText } from "lucide-react";

type OutputKind = "checklist" | "lawyer" | "summary" | "obligations";

const TABS: { value: OutputKind; label: string; description: string }[] = [
  { value: "checklist", label: "Action Checklist", description: "Step-by-step list based on the document's terms." },
  { value: "lawyer", label: "Questions for Lawyer", description: "Targeted questions to bring to a consultation." },
  { value: "summary", label: "Plain Summary", description: "A short, readable summary you can share." },
  { value: "obligations", label: "My Obligations", description: "Everything the document asks you to do." },
];

export function Actions() {
  const [docId, setDocId] = useState(SAMPLE_DOCUMENTS[2].id); // rental — has many action items
  const [tab, setTab] = useState<OutputKind>("checklist");
  const [copied, setCopied] = useState(false);
  const doc = SAMPLE_DOCUMENTS.find((d) => d.id === docId)!;
  const analysis = useMemo(() => analyzeDocument(doc), [doc]);

  const content = useMemo(() => buildOutput(tab, doc, analysis), [tab, doc, analysis]);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, "_")}_${tab}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Action Generator
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          Turn analysis into action
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Generate checklists, lawyer-ready question lists, plain summaries, and obligation
          breakdowns. Copy to clipboard or download as text.
        </p>
      </header>

      <Card>
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
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`text-left p-4 rounded-lg border transition-all ${
              tab === t.value
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white border-navy-100 hover:border-gold-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <FileText className={`w-4 h-4 ${tab === t.value ? "text-gold-300" : "text-gold-500"}`} />
              <div className={`text-sm font-medium ${tab === t.value ? "text-white" : "text-navy-900"}`}>
                {t.label}
              </div>
            </div>
            <div className={`text-xs leading-relaxed ${tab === t.value ? "text-navy-200" : "text-navy-500"}`}>
              {t.description}
            </div>
          </button>
        ))}
      </div>

      <Card
        title={TABS.find((t) => t.value === tab)!.label}
        icon={<ClipboardList className="w-5 h-5" />}
        subtitle={TABS.find((t) => t.value === tab)!.description}
      >
        <div className="flex gap-2 mb-4">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-navy-200 rounded-md hover:border-gold-400 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={download}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-navy-900 text-white rounded-md hover:bg-navy-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download .txt
          </button>
        </div>
        <pre className="bg-navy-900 text-navy-100 p-5 rounded-md text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[600px] overflow-y-auto scroll-thin">
          {content}
        </pre>
      </Card>

      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-5 text-sm text-navy-700">
        <strong className="text-navy-900">Reminder:</strong> Outputs are starting points. Always
        review with a licensed attorney before acting on them.
      </div>
    </div>
  );
}

function buildOutput(
  kind: OutputKind,
  doc: LegalDocument,
  analysis: ReturnType<typeof analyzeDocument>
): string {
  const header = `${doc.title}\nGenerated by Lexi · ${new Date().toLocaleDateString()}\n${"─".repeat(60)}\n\n`;
  switch (kind) {
    case "summary":
      return (
        header +
        `PLAIN-ENGLISH SUMMARY\n\n` +
        `${analysis.oneLineSummary}\n\n` +
        `KEY PARTIES\n${analysis.keyParties.map((p) => "  • " + p).join("\n")}\n\n` +
        `EFFECTIVE: ${doc.effectiveDate}\n` +
        `GOVERNING LAW: ${analysis.governingLaw ?? doc.jurisdiction}\n\n` +
        `READING LEVEL\n${analysis.readingLevelLabel} (Grade ${analysis.readingGrade})\n\n` +
        `TOP RED FLAGS\n${analysis.redFlags.map((f, i) => `  ${i + 1}. ${f}`).join("\n")}\n\n` +
        `${"─".repeat(60)}\n` +
        `Generated by Lexi. Not legal advice.`
      );
    case "checklist":
      return (
        header +
        `ACTION CHECKLIST\n\n` +
        `${analysis.nextSteps.map((s, i) => `[ ] ${i + 1}. ${s}`).join("\n")}\n\n` +
        `EXTRA CHECKS DERIVED FROM CLAUSES\n` +
        `${analysis.clauses
          .slice(0, 5)
          .map((c, i) => `[ ] Verify "${c.title}" — ${c.recommendation}`)
          .join("\n")}\n\n` +
        `${"─".repeat(60)}\n` +
        `Generated by Lexi. Not legal advice.`
      );
    case "lawyer":
      return (
        header +
        `QUESTIONS FOR YOUR ATTORNEY\n\n` +
        `Bring this list — and the document itself — to your consultation.\n\n` +
        `${analysis.recommendedQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n\n")}\n\n` +
        `OPTIONAL TALKING POINTS\n` +
        `  • What's the realistic cost of enforcing this if something goes wrong?\n` +
        `  • Are there any clauses I should try to negotiate before signing?\n` +
        `  • Are there statutes in ${analysis.governingLaw ?? "my jurisdiction"} that affect enforceability?\n` +
        `  • What records should I keep to protect myself?\n\n` +
        `${"─".repeat(60)}\n` +
        `Generated by Lexi. Not legal advice.`
      );
    case "obligations":
      return (
        header +
        `YOUR OBLIGATIONS\n\n` +
        `${analysis.obligations.map((o, i) => `${i + 1}. ${o}`).join("\n\n")}\n\n` +
        `YOUR RIGHTS (for reference)\n` +
        `${analysis.rights.map((r, i) => `  ${i + 1}. ${r}`).join("\n")}\n\n` +
        `${"─".repeat(60)}\n` +
        `Generated by Lexi. Not legal advice.`
      );
  }
}
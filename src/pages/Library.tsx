import { useState, useMemo } from "react";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";
import { DocCard } from "../components/DocCard";
import { Search, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "all", label: "All categories" },
  { value: "employment", label: "Employment" },
  { value: "rental", label: "Rental" },
  { value: "nda", label: "NDA" },
  { value: "tos", label: "Terms of Service" },
  { value: "service", label: "Services" },
  { value: "loan", label: "Loan" },
  { value: "license", label: "SaaS License" },
];

export function Library() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return SAMPLE_DOCUMENTS.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(s) ||
        d.summary.toLowerCase().includes(s) ||
        d.parties.some((p) => p.toLowerCase().includes(s))
      );
    });
  }, [search, category]);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Document Library
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          Explore curated legal documents
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Each document below is a realistic sample. Open one to see Lexi's full analysis — risk
          score, plain-English summary, key clauses, red flags, and the questions to bring to a
          lawyer.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <input
            type="text"
            placeholder="Search by title, party, or keyword…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none pl-10 pr-8 py-2.5 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-parchment-50 border border-parchment-200 rounded-lg">
          <p className="text-navy-600">No documents match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc) => (
            <DocCard key={doc.id} doc={doc} />
          ))}
        </div>
      )}
    </div>
  );
}
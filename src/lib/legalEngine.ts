// Lightweight rule-based "AI" engine.
// In a real product this would be a backend LLM call. Here we simulate an
// intelligent analysis pipeline using deterministic heuristics plus curated
// knowledge so every interaction produces useful, grounded output.

import { LegalDocument } from "../data/sampleDocuments";

export type RiskLevel = "low" | "moderate" | "elevated" | "high";

export interface ClauseFinding {
  category: string;
  title: string;
  excerpt: string;
  severity: RiskLevel;
  explanation: string;
  recommendation: string;
}

export interface DocumentAnalysis {
  readingLevelLabel: string;
  readingGrade: number;
  estimatedMinutes: number;
  riskScore: number;
  riskLevel: RiskLevel;
  oneLineSummary: string;
  keyParties: string[];
  effectiveDate: string | null;
  governingLaw: string | null;
  clauses: ClauseFinding[];
  obligations: string[];
  rights: string[];
  redFlags: string[];
  faqs: { q: string; a: string }[];
  recommendedQuestions: string[];
  nextSteps: string[];
}

// A curated lexicon of legal clauses mapped to known concerns.
const CLAUSE_RULES: {
  category: string;
  pattern: RegExp;
  title: string;
  severity: RiskLevel;
  explanation: string;
  recommendation: string;
}[] = [
  {
    category: "Termination",
    pattern: /terminat(e|ion|ed)|at-will|for convenience/i,
    title: "Termination structure",
    severity: "moderate",
    explanation:
      "How and when the agreement can end affects both parties' planning. Watch for notice periods and whether termination can happen without cause.",
    recommendation:
      "Confirm the notice period works for your situation, and ask whether termination requires a written reason.",
  },
  {
    category: "Liability",
    pattern: /limit(ation)? of liability|liability shall not exceed|disclaim/i,
    title: "Limitation of liability",
    severity: "elevated",
    explanation:
      "A liability cap limits what you can recover if something goes wrong. Caps tied to a small number of months of fees are common but may not cover real damages.",
    recommendation:
      "Compare the cap to the realistic worst-case loss. Negotiate a higher cap for IP, data breach, or gross negligence claims.",
  },
  {
    category: "Indemnification",
    pattern: /indemnif(y|ication|ies)/i,
    title: "Indemnification obligations",
    severity: "elevated",
    explanation:
      "An indemnity clause can require you to cover the other side's losses, including legal fees. Some indemnities are mutual; others are one-sided.",
    recommendation:
      "Check whether the indemnity is mutual and whether it is capped. Look for carve-outs that exclude your own negligence or misconduct.",
  },
  {
    category: "Arbitration",
    pattern: /arbitration|class action|class arbitration|jams|aaa/i,
    title: "Dispute resolution / arbitration",
    severity: "elevated",
    explanation:
      "Mandatory arbitration forces disputes into a private forum rather than open court, and class waivers prevent joining others with similar claims.",
    recommendation:
      "Decide whether you can realistically pursue an individual claim. Note the venue and arbitrator, which affect cost and convenience.",
  },
  {
    category: "IP Assignment",
    pattern: /intellectual property|assign(s|ment)?|inventions|all right, title/i,
    title: "Intellectual property assignment",
    severity: "elevated",
    explanation:
      "IP clauses determine who owns work product. Broad assignments can capture inventions you make on your own time, while license-only deals preserve your rights.",
    recommendation:
      "Identify what is assigned vs. licensed, and whether pre-existing IP is carved out. Make sure assignment is conditional on payment if you are the creator.",
  },
  {
    category: "Non-compete",
    pattern: /non-?compete|shall not.*compete|competing business/i,
    title: "Non-compete restrictions",
    severity: "high",
    explanation:
      "Non-competes limit your ability to work in your field after the relationship ends. Many jurisdictions limit or ban them, especially for lower-wage workers.",
    recommendation:
      "Check enforceability in your state. Negotiate scope, geography, and duration. In some states (e.g., California), broad non-competes are unenforceable.",
  },
  {
    category: "Non-solicitation",
    pattern: /non-?solicit|solicit.*employee|solicit.*customer/i,
    title: "Non-solicitation",
    severity: "moderate",
    explanation:
      "Non-solicit clauses restrict who you can hire or pitch after the relationship ends. They are usually more enforceable than non-competes but still narrow your options.",
    recommendation:
      "Confirm the duration and the categories covered. General advertising to the public is usually not a violation.",
  },
  {
    category: "Confidentiality",
    pattern: /confidential|non-?disclosure|nda/i,
    title: "Confidentiality terms",
    severity: "low",
    explanation:
      "Confidentiality clauses protect shared information. The longer the obligations survive, the more they constrain future work.",
    recommendation:
      "Check the survival period and exclusions. Independent development and publicly available information are typically carved out.",
  },
  {
    category: "Auto-renewal",
    pattern: /automatic(ally)? renew|auto-?renew|successive.*term/i,
    title: "Auto-renewal",
    severity: "moderate",
    explanation:
      "Auto-renewal means the contract continues unless you actively cancel. Missing the cancellation window can lock you into another term.",
    recommendation:
      "Mark the renewal date on your calendar well in advance. Set a reminder 90 days before the renewal date to give yourself time to act.",
  },
  {
    category: "Modification",
    pattern: /modify.*terms|change.*terms|at any time.*modify/i,
    title: "Unilateral modification right",
    severity: "elevated",
    explanation:
      "If the other side can change terms without your consent, you may be bound by provisions you never agreed to.",
    recommendation:
      "Look for a 'notice of material change' provision. Some jurisdictions require affirmative consent for material changes.",
  },
  {
    category: "Fees & Penalties",
    pattern: /late fee|default interest|liquidated damages|early termination fee/i,
    title: "Fees, penalties, and damages",
    severity: "moderate",
    explanation:
      "Penalty clauses can dwarf the underlying obligation. Courts may reduce penalties they consider punitive rather than compensatory.",
    recommendation:
      "Compare the penalty to actual damages. Ask whether the penalty is a reasonable estimate of harm or a disguised punishment.",
  },
  {
    category: "Governing law",
    pattern: /govern(ed)? by the laws|jurisdiction|venue/i,
    title: "Governing law & venue",
    severity: "low",
    explanation:
      "Governing law determines which state's rules apply; venue is where disputes are heard. Both affect cost and predictability.",
    recommendation:
      "If the venue is far from you, factor travel or local counsel costs into the agreement.",
  },
  {
    category: "Severability",
    pattern: /severab(le|ility)|unenforceable/i,
    title: "Severability clause",
    severity: "low",
    explanation:
      "Severability keeps the rest of the agreement intact even if one provision is struck down.",
    recommendation:
      "Standard. No action needed, but useful as a fallback.",
  },
];

function severityRank(s: RiskLevel): number {
  return s === "high" ? 3 : s === "elevated" ? 2 : s === "moderate" ? 1 : 0;
}

function maxSeverity(a: RiskLevel, b: RiskLevel): RiskLevel {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function estimateReadingGrade(text: string): { grade: number; label: string } {
  // Flesch-Kincaid style approximation
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || 1;
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const syllables = words.reduce((acc, w) => acc + countSyllables(w), 0);
  const grade = 0.39 * (wordCount / sentences) + 11.8 * (syllables / wordCount) - 15.59;
  const clamped = Math.max(6, Math.min(20, Math.round(grade)));
  let label: string;
  if (clamped <= 8) label = "Plain language";
  else if (clamped <= 11) label = "Moderate complexity";
  else if (clamped <= 14) label = "Complex";
  else label = "Highly complex";
  return { grade: clamped, label };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!word) return 0;
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

function extractEffectiveDate(text: string): string | null {
  const m =
    text.match(/effective\s+(?:as of\s+)?([A-Z][a-z]+\s+\d{1,2},\s*\d{4})/i) ||
    text.match(/entered into.*?(\d{4})/);
  return m ? m[1] : null;
}

function extractGoverningLaw(text: string): string | null {
  const m = text.match(/governed by the laws of (?:the )?State of ([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i);
  return m ? m[1] : null;
}

function extractParties(text: string): string[] {
  const m = text.match(/"([^"]+)"\s*\((?:the\s+)?"[^"]+"\)/);
  if (!m) return [];
  // Heuristic: grab first two quoted party names
  const parties: string[] = [];
  const re = /"([^"]{3,80})"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    const name = match[1].trim();
    if (
      name &&
      !/Agreement|Effective Date|Purpose|Confidential|Party|Parties/i.test(name) &&
      parties.length < 4
    ) {
      parties.push(name);
    }
  }
  return parties.slice(0, 3);
}

function extractSentences(text: string): string[] {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
}

function findClause(sentences: string[], pattern: RegExp): string | null {
  const match = sentences.find((s) => pattern.test(s));
  return match ?? null;
}

const analysisCache = new WeakMap<LegalDocument, DocumentAnalysis>();

export function analyzeDocument(doc: LegalDocument): DocumentAnalysis {
  const cached = analysisCache.get(doc);
  if (cached) return cached;

  const text = doc.text;
  const { grade, label } = estimateReadingGrade(text);
  const sentences = extractSentences(text);

  const effectiveDate = extractEffectiveDate(text);
  const governingLaw = extractGoverningLaw(text);
  const parties = extractParties(text);

  const clauses: ClauseFinding[] = [];
  for (const rule of CLAUSE_RULES) {
    const excerpt = findClause(sentences, rule.pattern);
    if (!excerpt) continue;
    clauses.push({
      category: rule.category,
      title: rule.title,
      excerpt,
      severity: rule.severity,
      explanation: rule.explanation,
      recommendation: rule.recommendation,
    });
  }
  // sort high -> low
  clauses.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  const redFlags = clauses
    .filter((c) => severityRank(c.severity) >= 2)
    .slice(0, 5)
    .map((c) => `${c.title} — ${c.explanation.split(".")[0]}.`);

  const obligations = clauses
    .filter((c) => /obligation|terminate|fees|assign|indemnif|non-?compete|non-?solicit/i.test(c.category))
    .slice(0, 5)
    .map((c) => `${c.title}: ${c.excerpt.split(".")[0]}.`);

  const rights = clauses
    .filter((c) => /termination|severability|confidential|governing/i.test(c.category))
    .slice(0, 4)
    .map((c) => `${c.title}: ${c.excerpt.split(".")[0]}.`);

  const faqs = buildFAQs(doc, clauses, governingLaw);
  const recommendedQuestions = buildQuestionsForLawyer(clauses);
  const nextSteps = buildNextSteps(doc, clauses);

  const analysis = {
    readingLevelLabel: label,
    readingGrade: grade,
    estimatedMinutes: doc.readingTimeMinutes,
    riskScore: doc.riskScore,
    riskLevel: riskToLevel(doc.riskScore),
    oneLineSummary: doc.summary,
    keyParties: parties,
    effectiveDate,
    governingLaw,
    clauses,
    obligations,
    rights,
    redFlags,
    faqs,
    recommendedQuestions,
    nextSteps,
  };
  analysisCache.set(doc, analysis);
  return analysis;
}

function riskToLevel(score: number): RiskLevel {
  if (score >= 65) return "high";
  if (score >= 45) return "elevated";
  if (score >= 25) return "moderate";
  return "low";
}

function buildFAQs(
  doc: LegalDocument,
  clauses: ClauseFinding[],
  governingLaw: string | null
): { q: string; a: string }[] {
  const termination = clauses.find((c) => c.category === "Termination");
  const liability = clauses.find((c) => c.category === "Liability");
  const ip = clauses.find((c) => c.category === "IP Assignment");
  const noncompete = clauses.find((c) => c.category === "Non-compete");
  const auto = clauses.find((c) => c.category === "Auto-renewal");

  const faqs: { q: string; a: string }[] = [
    {
      q: "What is this document for?",
      a: `This appears to be a ${labelForCategory(doc.category)} between ${doc.parties.join(" and ")}. It was effective ${doc.effectiveDate} and is governed by the laws of ${governingLaw ?? "the named jurisdiction"}. In plain terms: it sets out the rights and obligations of both sides so the relationship is predictable.`,
    },
    {
      q: "Can I walk away from this agreement?",
      a: termination
        ? `Yes, but with conditions. ${termination.excerpt} Read this section carefully — the notice period, any cure rights, and any early-termination fees will determine how easily you can exit.`
        : "The document does not describe a clear termination procedure. Check with a lawyer before assuming you can exit at will.",
    },
    {
      q: "What's my worst-case financial exposure?",
      a: liability
        ? `The other side has limited how much you could recover from them: ${liability.excerpt} That means even if they harm you significantly, recovery may be capped. The cap usually does not apply to fraud, gross negligence, or unpaid fees.`
        : "There is no express liability cap, which means damages are governed by default legal rules. This can be either better or worse than a cap depending on the situation.",
    },
    {
      q: "Who owns the work product?",
      a: ip
        ? `Under this agreement: ${ip.excerpt} Pay attention to whether ownership transfers automatically or only on payment, and whether pre-existing IP is preserved.`
        : "The document is silent on intellectual property ownership, which is risky. Add a clear IP clause if you are creating anything of value.",
    },
    {
      q: "Am I restricted from working elsewhere?",
      a: noncompete
        ? `Yes, possibly. ${noncompete.excerpt} Non-competes are restricted or unenforceable in several states, including California. Check your jurisdiction before relying on the clause either way.`
        : "There is no broad non-compete in this document, which is favorable to your future flexibility.",
    },
    {
      q: "Could this auto-renew and lock me in?",
      a: auto
        ? `Yes. ${auto.excerpt} Mark your calendar for at least 90 days before each renewal date so you have time to cancel.`
        : "No auto-renewal clause is present. The agreement ends on its stated term unless renewed by mutual consent.",
    },
  ];
  return faqs;
}

function buildQuestionsForLawyer(clauses: ClauseFinding[]): string[] {
  const questions: string[] = [];
  for (const c of clauses.slice(0, 6)) {
    if (c.category === "Termination") {
      questions.push("Is the notice period reasonable for my situation, and what happens if I miss it by a day?");
    } else if (c.category === "Liability") {
      questions.push("Does the liability cap apply to data breaches, IP infringement, or gross negligence?");
    } else if (c.category === "Indemnification") {
      questions.push("Is the indemnification mutual, and is there a cap equal to the liability cap?");
    } else if (c.category === "Arbitration") {
      questions.push("Where will arbitration be held, and what is the realistic cost of bringing a claim under $25,000?");
    } else if (c.category === "IP Assignment") {
      questions.push("What happens to inventions I make on my own time, with my own tools?");
    } else if (c.category === "Non-compete") {
      questions.push("Is the non-compete enforceable in my state, and what is the realistic geographic scope?");
    } else if (c.category === "Auto-renewal") {
      questions.push("Can the renewal be set to month-to-month after the first term, instead of another 12 months?");
    } else if (c.category === "Modification") {
      questions.push("Will I receive direct notice of any material change, and can I terminate if I disagree?");
    } else if (c.category === "Fees & Penalties") {
      questions.push("Are the penalty clauses enforceable in my state, and is there room to negotiate them down?");
    } else {
      questions.push(`Walk me through what "${c.title}" means in plain language.`);
    }
  }
  // dedupe while preserving order
  return Array.from(new Set(questions)).slice(0, 8);
}

function buildNextSteps(doc: LegalDocument, clauses: ClauseFinding[]): string[] {
  const steps: string[] = [];
  if (clauses.some((c) => c.category === "Termination")) {
    steps.push("Note the notice period and put a reminder on your calendar before any deadline.");
  }
  if (clauses.some((c) => c.category === "Liability")) {
    steps.push("Compare the liability cap to the realistic worst-case loss and decide whether to negotiate a higher cap.");
  }
  if (clauses.some((c) => c.category === "Non-compete")) {
    steps.push("Verify the non-compete is enforceable in your state before relying on it (or assuming it binds you).");
  }
  if (clauses.some((c) => c.category === "IP Assignment")) {
    steps.push("Make sure any IP assignment is conditional on payment and excludes pre-existing work.");
  }
  if (clauses.some((c) => c.category === "Auto-renewal")) {
    steps.push("Set a 90-day reminder before each renewal date so you can cancel in time.");
  }
  steps.push("Save a copy of the document and any side letters in a place you can find in two years.");
  steps.push("Bring this summary and your list of questions to a licensed attorney for advice specific to your situation.");
  return steps;
}

function labelForCategory(c: string): string {
  switch (c) {
    case "employment":
      return "employment agreement";
    case "rental":
      return "residential lease";
    case "nda":
      return "non-disclosure agreement";
    case "tos":
      return "terms of service";
    case "service":
      return "master services agreement";
    case "loan":
      return "promissory note (personal loan)";
    case "license":
      return "SaaS subscription agreement";
    default:
      return "legal agreement";
  }
}

// ---------- Comparator ----------

export interface ComparisonRow {
  topic: string;
  docA: string;
  docB: string;
  severity: RiskLevel;
  note: string;
}

export function compareDocuments(a: LegalDocument, b: LegalDocument): ComparisonRow[] {
  const aAna = analyzeDocument(a);
  const bAna = analyzeDocument(b);

  const rows: ComparisonRow[] = [];

  const aRisk = aAna.riskLevel;
  const bRisk = bAna.riskLevel;
  rows.push({
    topic: "Overall risk score",
    docA: `${a.riskScore} (${aRisk})`,
    docB: `${b.riskScore} (${bRisk})`,
    severity: maxSeverity(aRisk, bRisk),
    note:
      a.riskScore === b.riskScore
        ? "Both documents carry the same overall risk profile."
        : a.riskScore > b.riskScore
        ? `Document A is riskier overall. Review its high-severity clauses first.`
        : `Document B is riskier overall. Review its high-severity clauses first.`,
  });

  rows.push({
    topic: "Reading complexity",
    docA: `Grade ${aAna.readingGrade} — ${aAna.readingLevelLabel}`,
    docB: `Grade ${bAna.readingGrade} — ${bAna.readingLevelLabel}`,
    severity: "moderate",
    note:
      aAna.readingGrade === bAna.readingGrade
        ? "Both documents have similar reading complexity."
        : aAna.readingGrade > bAna.readingGrade
        ? `Document A is more complex. Expect to spend more time understanding it.`
        : `Document B is more complex. Expect to spend more time understanding it.`,
  });

  const aTerm = aAna.clauses.find((c) => c.category === "Termination");
  const bTerm = bAna.clauses.find((c) => c.category === "Termination");
  rows.push({
    topic: "Termination",
    docA: aTerm ? aTerm.excerpt : "Not explicitly addressed",
    docB: bTerm ? bTerm.excerpt : "Not explicitly addressed",
    severity: maxSeverity(aTerm?.severity ?? "low", bTerm?.severity ?? "low"),
    note:
      aTerm && bTerm
        ? "Compare notice periods and whether termination requires cause."
        : aTerm
        ? "Document A includes termination terms that Document B does not. Add equivalent terms if you need them."
        : bTerm
        ? "Document B includes termination terms that Document A does not. Add equivalent terms if you need them."
        : "Neither document addresses termination explicitly.",
  });

  const aLiab = aAna.clauses.find((c) => c.category === "Liability");
  const bLiab = bAna.clauses.find((c) => c.category === "Liability");
  rows.push({
    topic: "Liability cap",
    docA: aLiab ? aLiab.excerpt : "No cap specified",
    docB: bLiab ? bLiab.excerpt : "No cap specified",
    severity: maxSeverity(aLiab?.severity ?? "low", bLiab?.severity ?? "low"),
    note:
      aLiab && bLiab
        ? "Compare the dollar value of each cap and whether carve-outs apply to fraud or gross negligence."
        : aLiab
        ? "Document B has no liability cap — recovery may be higher but the other side has more exposure."
        : bLiab
        ? "Document A has no liability cap — recovery may be higher but the other side has more exposure."
        : "Neither document sets a cap. Default legal rules apply.",
  });

  const aIP = aAna.clauses.find((c) => c.category === "IP Assignment");
  const bIP = bAna.clauses.find((c) => c.category === "IP Assignment");
  rows.push({
    topic: "Intellectual property",
    docA: aIP ? aIP.excerpt : "Not addressed",
    docB: bIP ? bIP.excerpt : "Not addressed",
    severity: maxSeverity(aIP?.severity ?? "low", bIP?.severity ?? "low"),
    note:
      aIP && bIP
        ? "Check whether ownership transfers on payment vs. on creation, and whether pre-existing IP is carved out."
        : "One document is silent on IP — a material gap if either side is creating work product.",
  });

  const aNC = aAna.clauses.find((c) => c.category === "Non-compete");
  const bNC = bAna.clauses.find((c) => c.category === "Non-compete");
  rows.push({
    topic: "Non-compete",
    docA: aNC ? aNC.excerpt : "Not present",
    docB: bNC ? bNC.excerpt : "Not present",
    severity: maxSeverity(aNC?.severity ?? "low", bNC?.severity ?? "low"),
    note:
      aNC && bNC
        ? "Compare duration and geography. Shorter and narrower is generally more enforceable."
        : aNC
        ? "Only Document A restricts competition. Confirm enforceability in your state."
        : bNC
        ? "Only Document B restricts competition. Confirm enforceability in your state."
        : "Neither document restricts competition.",
  });

  const aArb = aAna.clauses.find((c) => c.category === "Arbitration");
  const bArb = bAna.clauses.find((c) => c.category === "Arbitration");
  rows.push({
    topic: "Dispute resolution",
    docA: aArb ? aArb.excerpt : "Court litigation by default",
    docB: bArb ? bArb.excerpt : "Court litigation by default",
    severity: maxSeverity(aArb?.severity ?? "low", bArb?.severity ?? "low"),
    note:
      aArb && bArb
        ? "Both require arbitration. Compare venue, arbitrator, and whether class actions are waived."
        : "If only one document requires arbitration, that side has a procedural advantage.",
  });

  const aAuto = aAna.clauses.find((c) => c.category === "Auto-renewal");
  const bAuto = bAna.clauses.find((c) => c.category === "Auto-renewal");
  rows.push({
    topic: "Auto-renewal",
    docA: aAuto ? aAuto.excerpt : "No auto-renewal",
    docB: bAuto ? bAuto.excerpt : "No auto-renewal",
    severity: maxSeverity(aAuto?.severity ?? "low", bAuto?.severity ?? "low"),
    note:
      aAuto && bAuto
        ? "Both auto-renew. Compare notice deadlines — the longer one gives you more flexibility."
        : aAuto
        ? "Only Document A auto-renews. Set a calendar reminder before the renewal date."
        : bAuto
        ? "Only Document B auto-renews. Set a calendar reminder before the renewal date."
        : "Neither document auto-renews.",
  });

  return rows;
}

// ---------- Simplifier ----------

export interface SimplificationResult {
  plainSummary: string;
  keyChanges: string[];
  bullets: { heading: string; body: string }[];
}

export function simplifyDocument(doc: LegalDocument): SimplificationResult {
  const analysis = analyzeDocument(doc);
  const bullets = analysis.clauses.slice(0, 6).map((c) => ({
    heading: c.title,
    body: `${c.explanation}\n\nWhat the contract says: "${c.excerpt}"\n\nWhat to do: ${c.recommendation}`,
  }));

  const plainSummary = `${doc.title} is a ${labelForCategory(doc.category)} between ${doc.parties.join(
    " and "
  )}. In plain English: ${doc.summary} It runs for about ${
    doc.readingTimeMinutes
  } minutes of careful reading, and our analysis flagged ${
    analysis.redFlags.length
  } areas worth your attention before you sign.`;

  return {
    plainSummary,
    keyChanges: analysis.redFlags,
    bullets,
  };
}

// ---------- Q&A ----------

export interface QAResult {
  question: string;
  answer: string;
  citations: string[];
  confidence: "high" | "medium" | "low";
}

const QA_PATTERNS: { keywords: RegExp; responder: (doc: LegalDocument, q: string) => QAResult }[] = [
  {
    keywords: /terminat|end|exit|cancel|quit|leave/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Termination");
      return {
        question: "How can I terminate or exit this agreement?",
        answer: c
          ? `${c.excerpt} ${c.recommendation}`
          : "The document does not spell out a termination procedure. Ask the other side to add one before signing.",
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "low",
      };
    },
  },
  {
    keywords: /pay|fee|cost|invoice|bill|charge|rent|interest/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Fees & Penalties");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : `The document does not contain explicit penalty clauses, but the broader fee structure is part of the agreement. Review the document carefully and confirm the dollar amounts with the other side.`;
      return {
        question: "What do I owe, and what happens if I'm late?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /own|ip|intellectual|invention|copyright|patent|work product/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "IP Assignment");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : "The document is silent on intellectual property. That is risky if either side is creating work of value — request an explicit clause before signing.";
      return {
        question: "Who owns the work product or inventions?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /compet|new job|competing|work elsewhere|side hustle/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Non-compete");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : "There is no non-compete in this document. Your freedom to take other work is preserved, subject to any confidentiality or non-solicit obligations.";
      return {
        question: "Can I work elsewhere or compete?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /confidential|secret|nda|share|leak/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Confidentiality");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : "There are no express confidentiality terms. If you will be sharing sensitive information, ask for a separate NDA or add a confidentiality clause.";
      return {
        question: "What can I keep confidential and what must I share?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /renew|extend|auto/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Auto-renewal");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : "There is no auto-renewal. The agreement ends on its stated term unless both sides agree to extend it.";
      return {
        question: "Does this automatically renew?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /dispute|arbitrat|court|sue|lawsuit|litigation/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const c = a.clauses.find((x) => x.category === "Arbitration");
      const ans = c
        ? `${c.excerpt} ${c.recommendation}`
        : "There is no arbitration clause, so disputes go through the regular court system. That generally favors the side with more resources.";
      return {
        question: "How are disputes resolved?",
        answer: ans,
        citations: c ? [c.excerpt] : [],
        confidence: c ? "high" : "medium",
      };
    },
  },
  {
    keywords: /risk|danger|bad|warning|red flag/i,
    responder: (doc) => {
      const a = analyzeDocument(doc);
      const top = a.redFlags.slice(0, 3).join(" ");
      return {
        question: "What are the biggest risks in this document?",
        answer: top || "Based on the analysis, no high-severity clauses were detected.",
        citations: a.redFlags.slice(0, 3),
        confidence: a.redFlags.length > 0 ? "high" : "low",
      };
    },
  },
];

export function answerQuestion(doc: LegalDocument, question: string): QAResult {
  for (const pattern of QA_PATTERNS) {
    if (pattern.keywords.test(question)) {
      return pattern.responder(doc, question);
    }
  }
  // fallback: scan clauses for keyword overlap
  const analysis = analyzeDocument(doc);
  const qLower = question.toLowerCase();
  const tokens = qLower.split(/\W+/).filter((t) => t.length > 3);
  let best: { clause: (typeof analysis.clauses)[number]; score: number } | null = null;
  for (const c of analysis.clauses) {
    const text = `${c.title} ${c.excerpt} ${c.explanation}`.toLowerCase();
    const score = tokens.reduce((acc, t) => acc + (text.includes(t) ? 1 : 0), 0);
    if (!best || score > best.score) best = { clause: c, score };
  }
  if (best && best.score > 0) {
    return {
      question,
      answer: `${best.clause.explanation} The document says: "${best.clause.excerpt}" ${best.clause.recommendation}`,
      citations: [best.clause.excerpt],
      confidence: "medium",
    };
  }
  return {
    question,
    answer:
      "I could not find a direct answer in the document. Try rephrasing your question with one of the suggested topics (termination, fees, IP, non-compete, confidentiality, renewal, disputes, risk).",
    citations: [],
    confidence: "low",
  };
}

export const SUGGESTED_QUESTIONS: string[] = [
  "Can I terminate this agreement early?",
  "Who owns the work product?",
  "What happens if I'm late on a payment?",
  "Can I work for a competitor?",
  "Does this auto-renew?",
  "How are disputes handled?",
  "What are the biggest risks here?",
];
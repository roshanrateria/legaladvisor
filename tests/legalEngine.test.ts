import { describe, expect, it } from "vitest";
import { SAMPLE_DOCUMENTS } from "../src/data/sampleDocuments";
import { analyzeDocument, answerQuestion, compareDocuments } from "../src/lib/legalEngine";

describe("legal engine", () => {
  const employment = SAMPLE_DOCUMENTS.find((doc) => doc.id === "employment-ft")!;
  const nda = SAMPLE_DOCUMENTS.find((doc) => doc.id === "nda-mutual")!;

  it("detects high-impact clauses and preserves source excerpts", () => {
    const analysis = analyzeDocument(employment);
    const categories = analysis.clauses.map((clause) => clause.category);

    expect(categories).toContain("Non-compete");
    expect(categories).toContain("IP Assignment");
    expect(analysis.clauses[0].excerpt.length).toBeGreaterThan(20);
    expect(analysis.riskLevel).toBe("elevated");
  });

  it("answers supported questions with citations", () => {
    const result = answerQuestion(employment, "Can I work for a competitor?");

    expect(result.confidence).toBe("high");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.answer).toMatch(/compete/i);
    expect(result.citations[0]).toMatch(/compete/i);
  });

  it("does not invent an answer for unsupported questions", () => {
    const result = answerQuestion(nda, "What is the weather tomorrow?");

    expect(result.confidence).toBe("low");
    expect(result.citations).toHaveLength(0);
    expect(result.answer).toContain("could not find a direct answer");
  });

  it("compares documents across decision-relevant topics", () => {
    const rows = compareDocuments(employment, nda);
    const topics = rows.map((row) => row.topic);

    expect(topics).toContain("Overall risk score");
    expect(topics).toContain("Termination");
    expect(topics).toContain("Intellectual property");
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });
});

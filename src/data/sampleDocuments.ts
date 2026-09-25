// Sample legal documents for the Lexi library.
// In a real product these would be loaded from a backend / user upload.
// Here they act as canonical references the AI engine can analyze end-to-end.

export type DocCategory =
  | "employment"
  | "rental"
  | "nda"
  | "tos"
  | "service"
  | "loan"
  | "license";

export interface LegalDocument {
  id: string;
  title: string;
  category: DocCategory;
  jurisdiction: string;
  parties: string[];
  effectiveDate: string;
  pageCount: number;
  readingTimeMinutes: number;
  readingLevel: "Plain" | "Moderate" | "Complex" | "Highly Complex";
  riskScore: number; // 0-100, higher = more risk
  summary: string;
  text: string;
  highlights: string[]; // pre-computed key clauses / obligations
}

export const SAMPLE_DOCUMENTS: LegalDocument[] = [
  {
    id: "nda-mutual",
    title: "Mutual Non-Disclosure Agreement",
    category: "nda",
    jurisdiction: "State of Delaware, USA",
    parties: ["Acme Innovations, Inc.", "Beta Labs LLC"],
    effectiveDate: "January 15, 2025",
    pageCount: 4,
    readingTimeMinutes: 9,
    readingLevel: "Moderate",
    riskScore: 22,
    summary:
      "A standard mutual NDA covering a 24-month confidentiality window with carve-outs for independently developed information and a $50,000 liquidated damages cap.",
    text: `This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2025 ("Effective Date") by and between Acme Innovations, Inc., a Delaware corporation ("Acme"), and Beta Labs LLC, a Delaware limited liability company ("Beta"). Each may be referred to as a "Party" and collectively as the "Parties."

1. PURPOSE. The Parties wish to explore a potential business relationship (the "Purpose") and may disclose to each other certain confidential and proprietary information.

2. CONFIDENTIAL INFORMATION. "Confidential Information" means any non-public information disclosed by one Party (the "Discloser") to the other (the "Recipient"), whether orally, in writing, or in any other form, that is marked or identified as confidential or that a reasonable person would understand to be confidential.

3. OBLIGATIONS. The Recipient shall: (a) hold the Confidential Information in strict confidence; (b) not disclose such information to any third party without prior written consent; and (c) use the Confidential Information solely for the Purpose.

4. TERM. This Agreement shall remain in effect for two (2) years from the Effective Date. The confidentiality obligations shall survive for a period of three (3) years after termination.

5. EXCLUSIONS. Confidential Information does not include information that: (a) is or becomes publicly available without breach of this Agreement; (b) was rightfully known prior to disclosure; (c) is independently developed without use of the Confidential Information; or (d) is required to be disclosed by law.

6. LIQUIDATED DAMAGES. In the event of a material breach, the breaching Party shall pay liquidated damages of fifty thousand dollars ($50,000) per breach.

7. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of law principles.

8. ENTIRE AGREEMENT. This Agreement constitutes the entire agreement of the Parties and supersedes all prior negotiations.`,
    highlights: [
      "Two-year evaluation period before obligations expire",
      "Three-year tail on confidentiality after termination",
      "$50,000 liquidated damages cap per breach",
      "Standard exclusions: independently developed, public domain",
      "Delaware governing law — neutral forum for both parties",
    ],
  },
  {
    id: "employment-ft",
    title: "Full-Time Employment Agreement",
    category: "employment",
    jurisdiction: "State of California, USA",
    parties: ["Northwind Software, Inc.", "Jordan Reyes"],
    effectiveDate: "March 1, 2025",
    pageCount: 12,
    readingTimeMinutes: 28,
    readingLevel: "Complex",
    riskScore: 64,
    summary:
      "An at-will employment agreement with a broad non-compete, IP assignment of all inventions, mandatory arbitration, and an asymmetric termination notice structure.",
    text: `This Employment Agreement ("Agreement") is made between Northwind Software, Inc. ("Company") and Jordan Reyes ("Employee"), effective March 1, 2025.

1. POSITION. Employee is hired as a Senior Software Engineer reporting to the VP of Engineering.

2. AT-WILL EMPLOYMENT. Employee's employment is at-will and may be terminated by either Party at any time, with or without cause. However, if Company terminates Employee without cause, Company shall provide thirty (30) days written notice. Employee must provide ninety (90) days written notice prior to voluntary resignation.

3. COMPENSATION. Employee will receive an annual base salary of $185,000 paid bi-weekly, plus eligibility for an annual performance bonus of up to 20% of base salary, determined at the sole discretion of the Company.

4. NON-COMPETE. During employment and for a period of twenty-four (24) months thereafter, Employee shall not, directly or indirectly, engage in any business that competes with the Company within the State of California or any state in which Company operates.

5. INTELLECTUAL PROPERTY. Employee hereby assigns to Company all right, title, and interest in any Inventions conceived or developed during employment, including those developed on personal time and without use of Company resources.

6. NON-SOLICITATION. For twelve (12) months after termination, Employee shall not solicit any employee, contractor, customer, or supplier of the Company.

7. DISPUTE RESOLUTION. Any dispute arising out of or relating to this Agreement shall be resolved exclusively through binding arbitration administered by JAMS in San Francisco, California. Employee waives the right to participate in any class action.

8. GOVERNING LAW. This Agreement is governed by the laws of the State of California.

9. SEVERABILITY. If any provision is held unenforceable, the remaining provisions remain in full force and effect.`,
    highlights: [
      "Asymmetric notice: 30 days for employer, 90 days for employee",
      "24-month non-compete (unusually broad and likely unenforceable in CA)",
      "IP assignment captures inventions made on personal time",
      "Mandatory binding arbitration with class action waiver",
      "Bonus is at 'sole discretion' of the Company",
    ],
  },
  {
    id: "rental-residential",
    title: "Residential Lease Agreement",
    category: "rental",
    jurisdiction: "City of Austin, Texas",
    parties: ["Greenwood Property Holdings LLC", "Tenant"],
    effectiveDate: "February 1, 2025",
    pageCount: 6,
    readingTimeMinutes: 14,
    readingLevel: "Moderate",
    riskScore: 41,
    summary:
      "A 12-month residential lease with a $2,400 monthly rent, $4,800 security deposit, late-fee escalators, and a unilateral early-termination clause that favors the landlord.",
    text: `This Residential Lease Agreement ("Lease") is entered into between Greenwood Property Holdings LLC ("Landlord") and the undersigned tenant ("Tenant") for the property located at 1422 Live Oak Street, Austin, Texas 78704 (the "Premises").

1. TERM. The lease term is twelve (12) months beginning February 1, 2025 and ending January 31, 2026.

2. RENT. Monthly rent is $2,400, due on the 1st of each month. A grace period of three (3) days applies; thereafter a late fee of $75 is assessed, plus an additional $25 per day after the 7th day.

3. SECURITY DEPOSIT. Tenant shall deposit $4,800 (equivalent to two months' rent) as security. Landlord may use any portion of the deposit for damages, unpaid rent, or cleaning, at Landlord's sole discretion.

4. MAINTENANCE. Tenant shall maintain the Premises in clean and sanitary condition and is responsible for all repairs under $500. Landlord is responsible for structural repairs and major systems.

5. EARLY TERMINATION. If Tenant terminates this Lease prior to expiration, Tenant shall pay an early termination fee equal to two (2) months' rent plus any unpaid rent through the date a new tenant commences occupancy.

6. PETS. No pets are permitted without prior written consent and an additional $400 pet deposit per animal.

7. RIGHT OF ENTRY. Landlord may enter the Premises with twenty-four (24) hours notice for inspections, repairs, or showings.

8. GOVERNING LAW. This Lease is governed by the laws of the State of Texas.`,
    highlights: [
      "Two-month security deposit (above Texas standard of 1.5 months in some cases)",
      "Late fee of $75 plus $25/day is aggressive — verify against local caps",
      "Tenant pays for any repair under $500 — high cost exposure",
      "Early termination fee is two months' rent — substantial penalty",
      "Landlord entry requires only 24 hours notice",
    ],
  },
  {
    id: "tos-social",
    title: "Social Platform Terms of Service",
    category: "tos",
    jurisdiction: "State of California, USA",
    parties: ["Lumen Networks, Inc.", "End User"],
    effectiveDate: "Updated November 4, 2024",
    pageCount: 18,
    readingTimeMinutes: 42,
    readingLevel: "Highly Complex",
    riskScore: 73,
    summary:
      "A broad user-generated content license, content moderation at the platform's sole discretion, a class-action waiver, and a unilateral right to modify terms at any time.",
    text: `These Terms of Service ("Terms") govern your access to and use of the Lumen social platform. By creating an account, you agree to these Terms.

1. ACCOUNT ELIGIBILITY. You must be at least 13 years old to use the Service.

2. LICENSE GRANT. You retain ownership of content you post, but you grant Lumen a worldwide, perpetual, irrevocable, royalty-free, fully sublicensable license to use, reproduce, modify, distribute, and display your content in any media.

3. CONTENT MODERATION. Lumen may, at its sole discretion and without notice, remove any content, suspend or terminate your account, or take any other action it deems appropriate. Lumen has no obligation to review content prior to posting.

4. CHANGES TO TERMS. Lumen may modify these Terms at any time. Continued use of the Service after changes constitutes acceptance. Material changes will not be individually notified.

5. DISPUTES. All disputes shall be resolved through individual binding arbitration. You waive the right to participate in any class action or class arbitration.

6. NO WARRANTIES. The Service is provided "as is" without warranties of any kind. Lumen disclaims all liability for user conduct, content, or third-party links.

7. LIMITATION OF LIABILITY. To the maximum extent permitted by law, Lumen's total liability shall not exceed $100 or the amount you paid Lumen in the last twelve months, whichever is greater.

8. INDEMNIFICATION. You agree to indemnify and hold Lumen harmless from any claim arising out of your use of the Service or your content.

9. TERMINATION. Lumen may terminate your account at any time, for any reason, without notice.`,
    highlights: [
      "Perpetual, irrevocable license to your content",
      "Platform can remove content or terminate account without notice or reason",
      "Terms can change at any time without direct notification",
      "Mandatory arbitration with class action waiver",
      "Liability capped at $100 or last 12 months of payments",
      "You must indemnify the platform for any claim arising from your use",
    ],
  },
  {
    id: "service-msa",
    title: "Master Services Agreement",
    category: "service",
    jurisdiction: "State of New York, USA",
    parties: ["Apex Consulting Group", "Client"],
    effectiveDate: "April 1, 2025",
    pageCount: 14,
    readingTimeMinutes: 32,
    readingLevel: "Complex",
    riskScore: 57,
    summary:
      "A professional services agreement with hourly billing, IP ownership on full payment, indemnification capped at fees paid, and a 30-day termination-for-convenience clause.",
    text: `This Master Services Agreement ("MSA") is entered into between Apex Consulting Group ("Consultant") and the Client identified in the applicable Statement of Work.

1. SERVICES. Consultant will provide services as described in one or more Statements of Work ("SOW") incorporated by reference.

2. FEES. Client will pay Consultant on a time-and-materials basis at the rates specified in each SOW. Invoices are due net thirty (30) days. Late payments accrue interest at 1.5% per month.

3. INTELLECTUAL PROPERTY. Upon full payment of all fees due, Consultant assigns to Client all right, title, and interest in the Deliverables. Pre-existing materials remain the property of Consultant and are licensed, not assigned.

4. CONFIDENTIALITY. Each Party shall protect the other's confidential information with the same standard of care it uses for its own confidential information, but no less than reasonable care.

5. INDEMNIFICATION. Consultant will indemnify Client against third-party claims that the Deliverables infringe a U.S. patent, copyright, or trademark, up to a maximum of the fees paid by Client in the twelve (12) months preceding the claim.

6. WARRANTY. Consultant warrants that the services will be performed in a professional and workmanlike manner. EXCEPT AS EXPRESSLY SET FORTH HEREIN, CONSULTANT MAKES NO OTHER WARRANTIES.

7. TERMINATION FOR CONVENIENCE. Either Party may terminate a SOW upon thirty (30) days written notice. Client shall pay for all work performed and accepted prior to the termination date.

8. LIMITATION OF LIABILITY. Neither Party's liability shall exceed the fees paid or payable under the applicable SOW in the twelve (12) months preceding the event giving rise to liability.

9. GOVERNING LAW. This MSA is governed by the laws of the State of New York.`,
    highlights: [
      "IP transfers only after full payment — verify payment terms before signing",
      "Pre-existing IP is licensed, not assigned — important for reuse",
      "Indemnification capped at 12 months of fees — typical but verify",
      "30-day termination for convenience — favorable to both sides",
      "Liability cap aligns with indemnification cap",
    ],
  },
  {
    id: "loan-personal",
    title: "Personal Promissory Note",
    category: "loan",
    jurisdiction: "State of Florida, USA",
    parties: ["Lender", "Borrower"],
    effectiveDate: "May 10, 2025",
    pageCount: 3,
    readingTimeMinutes: 7,
    readingLevel: "Moderate",
    riskScore: 48,
    summary:
      "A $25,000 unsecured personal loan at 9.5% APR over 36 months with a 10% default interest bump and broad remedies on default including attorney's fees.",
    text: `This Promissory Note ("Note") is made by the Borrower identified below in favor of the Lender identified below.

1. PRINCIPAL. The Borrower promises to pay the Lender the principal sum of twenty-five thousand dollars ($25,000).

2. INTEREST. The unpaid principal shall bear interest at a fixed rate of 9.5% per annum.

3. PAYMENT SCHEDULE. Borrower shall make thirty-six (36) equal monthly installments of approximately $803, commencing June 1, 2025.

4. DEFAULT. If any payment is more than ten (10) days late, or if Borrower defaults under any other obligation, the entire unpaid balance shall become immediately due. Upon default, the interest rate shall increase to 19.5% per annum.

5. ATTORNEY'S FEES. In the event of default, the prevailing party shall be entitled to recover reasonable attorney's fees and costs.

6. WAIVER. Borrower waives presentment, demand, protest, and notice of dishonor.

7. GOVERNING LAW. This Note is governed by the laws of the State of Florida.

8. SEVERABILITY. If any provision is held invalid, the remainder remains in effect.`,
    highlights: [
      "10% default interest bump is high — review state usury caps",
      "Attorney's fees clause favors the prevailing party",
      "Borrower waives standard notice rights (protest, demand)",
      "Acceleration on a single late payment over 10 days",
    ],
  },
  {
    id: "license-saas",
    title: "SaaS Subscription Agreement",
    category: "license",
    jurisdiction: "State of Washington, USA",
    parties: ["Stratus Cloud, Inc.", "Subscriber"],
    effectiveDate: "Effective upon signup",
    pageCount: 10,
    readingTimeMinutes: 22,
    readingLevel: "Complex",
    riskScore: 52,
    summary:
      "An auto-renewing SaaS subscription with a usage-based overage tier, a unilateral price-change clause, and an SLA that limits refunds to a 10% monthly credit.",
    text: `This SaaS Subscription Agreement ("Agreement") governs your use of the Stratus Cloud platform.

1. SUBSCRIPTION. Subscriber is granted a non-exclusive, non-transferable right to access the Service during the Subscription Term in exchange for the Subscription Fee.

2. TERM AND RENEWAL. The initial term is twelve (12) months. The Agreement automatically renews for successive twelve-month terms unless Subscriber provides written notice of non-renewal at least sixty (60) days prior to the end of the current term.

3. FEES. Subscriber shall pay the Subscription Fee annually in advance. Usage above the included tier is billed monthly at then-current rates.

4. PRICE CHANGES. Stratus may increase the Subscription Fee upon thirty (30) days notice. Continued use after the effective date of any increase constitutes acceptance.

5. SERVICE LEVEL. Stratus commits to 99.9% monthly uptime. The sole remedy for failure to meet this commitment is a service credit not to exceed ten percent (10%) of the monthly fee.

6. DATA. As between the Parties, Subscriber retains all rights to its data. Stratus may use aggregated, de-identified data to improve the Service.

7. TERMINATION. Stratus may suspend or terminate the Service at any time for any breach by Subscriber, with or without notice.

8. LIMITATION OF LIABILITY. Stratus's total liability shall not exceed the fees paid in the twelve (12) months preceding the event.

9. GOVERNING LAW. This Agreement is governed by the laws of the State of Washington.`,
    highlights: [
      "Auto-renews for 12-month terms unless 60-day notice is given",
      "Provider can raise prices on 30 days notice — no consent required",
      "SLA remedy is capped at a 10% monthly credit",
      "Provider can suspend for any alleged breach",
      "Liability cap aligns with 12 months of fees",
    ],
  },
];

export function getDocumentById(id: string) {
  return SAMPLE_DOCUMENTS.find((d) => d.id === id);
}
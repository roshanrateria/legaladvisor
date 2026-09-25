const MODEL = process.env.NEMOTRON_MODEL ?? "nvidia/nemotron-3-ultra-550b-a55b";
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1";

type RequestLike = { method?: string; body?: unknown };
type ResponseLike = { status: (code: number) => ResponseLike; json: (body: unknown) => void };

export default async function handler(request: RequestLike, response: ResponseLike) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const body = (request.body ?? {}) as { document?: unknown; question?: unknown };
  const document = typeof body.document === "string" ? body.document.trim() : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!document || !question || document.length > 100_000 || question.length > 500) {
    return response.status(400).json({ error: "Document or question is invalid." });
  }
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return response.status(503).json({ error: "NVIDIA integration is not configured." });

  try {
    const upstream = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          { role: "system", content: "You are a legal information assistant. Answer only from the supplied document. Say when the answer is not supported. Use plain language, do not invent citations, and remind the user this is not legal advice." },
          { role: "user", content: `DOCUMENT:\n${document}\n\nQUESTION:\n${question}` },
        ],
      }),
    });
    if (!upstream.ok) return response.status(502).json({ error: "Model request failed." });
    const payload = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) return response.status(502).json({ error: "Model returned no answer." });
    return response.status(200).json({ answer });
  } catch {
    return response.status(502).json({ error: "Unable to reach the model service." });
  }
}
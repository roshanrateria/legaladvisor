import { useState, useMemo, useRef, useEffect } from "react";
import { SAMPLE_DOCUMENTS } from "../data/sampleDocuments";
import { answerQuestion, SUGGESTED_QUESTIONS } from "../lib/legalEngine";
import { Card } from "../components/AnalysisPanel";
import { MessageSquareQuote, Send, Sparkles, User } from "lucide-react";

const nvidiaEnabled = import.meta.env.VITE_ENABLE_NVIDIA === "true";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations: string[];
  confidence: "high" | "medium" | "low";
}

export function QA() {
  const [docId, setDocId] = useState(SAMPLE_DOCUMENTS[0].id);
  const doc = SAMPLE_DOCUMENTS.find((d) => d.id === docId)!;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q) return;
    const userMsg: Message = {
      id: ++messageIdRef.current,
      role: "user",
      text: q,
      citations: [],
      confidence: "high",
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    try {
      let answer = answerQuestion(doc, q);
      if (nvidiaEnabled) {
        const response = await fetch("/api/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ document: doc.text, question: q }),
        });
        if (response.ok) {
          const remote = (await response.json()) as { answer?: string };
          if (remote.answer) answer = { ...answer, answer: remote.answer, confidence: "medium" };
        }
      } else {
        await new Promise((resolve) => setTimeout(resolve, 550));
      }
      setMessages((m) => [
        ...m,
        { id: ++messageIdRef.current, role: "assistant", text: answer.answer, citations: answer.citations, confidence: answer.confidence },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const suggestions = useMemo(() => SUGGESTED_QUESTIONS, []);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-widest text-gold-600 font-medium">
          Legal Q&A
        </div>
        <h1 className="font-serif text-3xl font-semibold text-navy-900 mt-1">
          Ask questions, get cited answers
        </h1>
        <p className="text-navy-600 mt-2 max-w-2xl">
          Lexi answers questions in natural language and cites the exact text from the document so
          you can verify every claim. Pick a document and start asking.
        </p>
      </header>

      <Card>
        <label className="text-xs uppercase tracking-widest text-navy-500 font-medium">
          Document
        </label>
        <select
          value={docId}
          onChange={(e) => {
            setDocId(e.target.value);
            setMessages([]);
          }}
          className="w-full mt-1 px-3 py-2 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400"
        >
          {SAMPLE_DOCUMENTS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </Card>

      <Card
        title="Conversation"
        icon={<MessageSquareQuote className="w-5 h-5" />}
        subtitle={`Asking about: ${doc.title}`}
        className="min-h-[400px]"
      >
        <div className="space-y-4 max-h-[500px] overflow-y-auto scroll-thin pr-2">
          {messages.length === 0 && (
            <div className="text-center py-10">
              <div className="inline-flex w-12 h-12 rounded-full bg-parchment-100 items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-gold-500" />
              </div>
              <p className="text-sm text-navy-500 max-w-md mx-auto">
                Try a question below or type your own. Lexi answers from the selected document,
                cites relevant text, and flags when it cannot find enough evidence.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-sm text-navy-500 pl-2">
              <Sparkles className="w-4 h-4 text-gold-500 animate-pulse" />
              Lexi is reading the document...
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="mt-6 pt-6 border-t border-navy-100">
            <div className="text-[11px] uppercase tracking-widest text-navy-500 font-medium mb-3">
              Try one of these
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 bg-parchment-50 hover:bg-parchment-100 border border-parchment-200 rounded-full text-navy-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mt-4 pt-4 border-t border-navy-100 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this document…"
            className="flex-1 px-4 py-2.5 bg-white border border-navy-200 rounded-md focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
        <p className="mt-3 text-[11px] text-navy-400">
          {nvidiaEnabled
            ? "NVIDIA mode is enabled. Answers remain informational; verify the cited text before acting."
            : "Grounded demo mode uses deterministic document analysis. Enable NVIDIA mode only on a trusted server deployment."}
        </p>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} fade-up`}>
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-gold-300" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isUser
            ? "bg-navy-900 text-white"
            : "bg-parchment-50 border border-parchment-200 text-navy-800"
        }`}
      >
        {!isUser && message.confidence && (
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded ${
                message.confidence === "high"
                  ? "bg-emerald-100 text-emerald-800"
                  : message.confidence === "medium"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {message.confidence} confidence
            </span>
          </div>
        )}
        <div className="text-sm leading-relaxed">{message.text}</div>
        {message.citations.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.citations.map((c, i) => (
              <blockquote
                key={i}
                className="text-xs italic text-navy-600 border-l-2 border-gold-400 pl-2"
              >
                "{c}"
              </blockquote>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-parchment-200 flex items-center justify-center">
          <User className="w-4 h-4 text-navy-700" />
        </div>
      )}
    </div>
  );
}
// lib/groq.ts
import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;
const model = process.env.GROQ_MODEL || "llama3-70b-8192";

if (!apiKey) {
  console.warn("GROQ_API_KEY not set — LLM calls will fail.");
}

const groq = new Groq({ apiKey });

export async function summarizeChunk(userInstruction: string, chunk: string): Promise<string> {
  const res = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a careful note-taking assistant. Follow user instruction exactly. Do not hallucinate." },
      { role: "user", content: `Instruction: ${userInstruction}\n\nTranscript chunk:\n\n${chunk}` },
    ],
    temperature: 0.2,
  });

  const text = res.choices?.[0]?.message?.content || "";
  return text.trim();
}

export async function combineSummaries(userInstruction: string, partials: string[]): Promise<string> {
  const res = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You are a careful note-taking assistant. Combine partial summaries into a coherent, deduped result without adding facts." },
      { role: "user", content: `Instruction: ${userInstruction}\n\nPartial summaries:\n\n${partials.join("\n\n---\n\n")}` },
    ],
    temperature: 0.2,
  });

  return (res.choices?.[0]?.message?.content || "").trim();
}

// app/api/summarize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { splitTranscript } from "../../../lib/chunking";
import { summarizeChunk, combineSummaries } from "../../../lib/groq";
import { dbConnect } from "../../../lib/db";
import Summary from "../../../models/Summary";

export const runtime = "nodejs";

async function readMultipart(req: NextRequest) {
  const form = await req.formData();
  const prompt = String(form.get("prompt") || "");
  const file = form.get("file") as File | null;
  let transcriptText = "";
  if (file) {
    const buf = Buffer.from(await file.arrayBuffer());
    transcriptText = buf.toString("utf-8");
  }
  return { prompt, transcriptText };
}

export async function POST(req: NextRequest) {
  try {
    let prompt = "";
    let transcriptText = "";

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const res = await readMultipart(req);
      prompt = res.prompt;
      transcriptText = res.transcriptText;
    } else {
      const json = await req.json();
      prompt = json.prompt || "";
      transcriptText = json.transcriptText || "";
    }

    if (!prompt || !transcriptText) {
      return NextResponse.json({ error: "Provide a transcript (file or text) and a prompt." }, { status: 400 });
    }

    if (transcriptText.length > 2_000_000) {
      return NextResponse.json({ error: "Transcript too large (max ~2MB). Split and try again." }, { status: 422 });
    }

    const chunks = splitTranscript(transcriptText);
    const partials: string[] = [];
    for (const ch of chunks) {
      const part = await summarizeChunk(prompt, ch);
      partials.push(part);
    }
    const summary = partials.length === 1 ? partials[0] : await combineSummaries(prompt, partials);

    // persist (best-effort)
    try {
      await dbConnect();
      const doc = await (Summary as any).create({ transcriptText, prompt, summaryText: summary });
      return NextResponse.json({ id: String(doc._id), summary });
    } catch (e) {
      // DB failed — still return summary
      return NextResponse.json({ id: null, summary });
    }
  } catch (err: any) {
    console.error("Summarize error:", err?.message || err);
    return NextResponse.json({ error: "Failed to summarize." }, { status: 500 });
  }
}

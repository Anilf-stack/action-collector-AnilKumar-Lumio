// app/page.tsx
"use client";

import { useState, useRef } from "react";

export default function Page() {
  const [transcriptText, setTranscriptText] = useState("");
  const [prompt, setPrompt] = useState("Summarize in concise bullet points with decisions, risks, and action items.");
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const file = fileRef.current?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.append("prompt", prompt);
        fd.append("file", file);
        const res = await fetch("/api/summarize", { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSummary(data.summary || "");
      } else {
        const res = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcriptText, prompt }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSummary(data.summary || "");
      }
    } catch (e: any) {
      alert("Failed to generate summary: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendEmail() {
    setEmailing(true);
    try {
      const recips = recipients.split(",").map(s => s.trim()).filter(Boolean);
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summaryText: summary, recipients: recips, subject: "Meeting Summary" }),
      });
      if (!res.ok) throw new Error(await res.text());
      alert("Email sent!");
    } catch (e: any) {
      alert("Failed to send email: " + (e?.message || e));
    } finally {
      setEmailing(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "24px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>AI Meeting Notes Summarizer</h1>

      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Upload .txt transcript (optional)
          <input ref={fileRef} type="file" accept=".txt,text/plain" />
        </label>

        <label>
          Or paste transcript
          <textarea value={transcriptText} onChange={e => setTranscriptText(e.target.value)} rows={8} style={{ width: "100%" }} />
        </label>

        <label>
          Custom instruction/prompt
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={3} style={{ width: "100%" }} />
        </label>

        <button onClick={handleGenerate} disabled={loading}>{loading ? "Generating…" : "Generate Summary"}</button>

        <label>
          Editable summary
          <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={10} style={{ width: "100%" }} />
        </label>

        <label>
          Recipients (comma-separated)
          <input value={recipients} onChange={e => setRecipients(e.target.value)} style={{ width: "100%" }} placeholder="alice@ex.com, bob@ex.com" />
        </label>

        <button onClick={handleSendEmail} disabled={!summary || emailing}>{emailing ? "Sending…" : "Send Email"}</button>
      </div>
    </main>
  );
}

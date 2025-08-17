// app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "../../../lib/email";
import { dbConnect } from "../../../lib/db";
import Summary from "../../../models/Summary";

export const runtime = "nodejs";

const schema = z.object({
  summaryText: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  subject: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const { summaryText, recipients, subject = "Meeting Summary" } = parsed.data;
    await sendEmail(recipients, subject, summaryText);

    // update summary doc with sent info (best effort)
    try {
      await dbConnect();
      await (Summary as any).updateOne({ summaryText }, { $set: { recipients, sentAt: new Date() } });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Email error:", err?.message || err);
    return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
  }
}

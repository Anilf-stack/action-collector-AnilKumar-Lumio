// models/Summary.ts
import { Schema, models, model } from "mongoose";

const SummarySchema = new Schema({
  transcriptText: { type: String },
  prompt: { type: String, required: true },
  summaryText: { type: String, required: true },
  recipients: { type: [String], default: [] },
  sentAt: { type: Date, default: null },
}, { timestamps: true });

export default models.Summary || model('Summary', SummarySchema);

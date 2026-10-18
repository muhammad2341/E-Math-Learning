import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuditLogDocument extends Document {
  adminId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId?: string;
  details: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLogDocument>(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, default: "" },
    details: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLogDocument>("AuditLog", auditLogSchema);

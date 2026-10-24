const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["BLOCK_USER", "UNBLOCK_USER", "DELETE_LISTING"],
      required: true,
    },
    targetType: { type: String, enum: ["User", "Listing"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: Object, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

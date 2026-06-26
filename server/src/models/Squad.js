const mongoose = require("mongoose");
const crypto = require("crypto");

const squadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
      uppercase: true,
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

squadSchema.index({ inviteCode: 1 }, { unique: true });

squadSchema.statics.generateInviteCode = function () {
  return crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 8);
};

module.exports = mongoose.model("Squad", squadSchema);

const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    commits: {
      type: Number,
      default: 0,
      min: 0,
    },
    prs: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    minutesFocused: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);

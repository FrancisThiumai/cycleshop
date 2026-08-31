const mongoose = require("mongoose");
const cycleInfoSchema = mongoose.Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Sale",
    },
    frame: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PartInfo",
    },
    gear: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PartInfo",
    },
    brake: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PartInfo",
    },
    tyre1: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PartInfo",
    },
    tyre2: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PartInfo",
    },
    extras: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PartInfo",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("BicycleInfo", cycleInfoSchema);

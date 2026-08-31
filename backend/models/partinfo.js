const mongoose = require("mongoose");
const partInfoSchema = mongoose.Schema(
  {
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartModel",
      required: true,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseDate: {
      type: Date,
      required: true,
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      default: null,
    },

    soldPrice: { //the base price at the time it was sold
      type: Number,
      default: null,
      min: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("PartInfo", partInfoSchema);
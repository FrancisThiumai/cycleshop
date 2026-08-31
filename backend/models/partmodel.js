const mongoose = require('mongoose');
const partModelSchema = mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    partType: {
      type: String,
      required: true,
    },

    currentPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("PartModel", partModelSchema);
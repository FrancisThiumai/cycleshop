const mongoose = require('mongoose');
const priceHistorySchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartModel',
     required: true
  },
  price : {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true
  }
});

priceHistorySchema.index({ modelId: 1, date: 1}, { unique: true });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
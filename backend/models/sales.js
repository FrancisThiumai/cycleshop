const mongoose = require('mongoose');
const saleSchema = mongoose.Schema({
  saleDate: {
    type: Date,
    default: Date.now,
  },
  seller : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  saleType: {
    type: String,
    enum: ['bicycle', 'parts'],
    required: true,
    default: 'parts'
  },
  salePrice : Number, //the actual price it was sold at
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    required: true
  },
  transactionId: {
    type: String,
    default: null
  },

  verified: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Sale', saleSchema);
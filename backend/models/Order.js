const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    uniqueId: { type: String, required: true, unique: true }, // YY/MM/DD/000001

    farmerName: { type: String, required: true, trim: true },

    // Quantity ordered for each variety (0 = not ordered)
    varieties: {
      jarviRed: { type: Number, default: 0 },
      jarviRed1: { type: Number, default: 0 },
      jarviRedPlus: { type: Number, default: 0 },
      jarviWhiteHoney: { type: Number, default: 0 }
    },

    mobile: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    farmLocation: { type: String, trim: true },
    deliveryDate: { type: String, required: true },

    notification: {
      ownerSent: { type: Boolean, default: false },
      customerSent: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

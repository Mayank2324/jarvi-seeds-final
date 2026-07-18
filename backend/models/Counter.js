const mongoose = require("mongoose");

// One document per calendar day, e.g. _id "260714".
// seq increments every time an order is created on that day.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // YYMMDD
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model("Counter", counterSchema);

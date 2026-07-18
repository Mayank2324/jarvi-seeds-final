const Counter = require("../models/Counter");

// Generates an atomic, gap-free daily sequence: YY/MM/DD/000001
async function generateUniqueId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const dayKey = `${yy}${mm}${dd}`; // e.g. "260714"

  const counter = await Counter.findByIdAndUpdate(
    dayKey,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seqPadded = String(counter.seq).padStart(6, "0");
  return `${yy}/${mm}/${dd}/${seqPadded}`;
}

module.exports = generateUniqueId;

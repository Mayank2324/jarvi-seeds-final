const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const generateUniqueId = require("../utils/generateUniqueId");
const { appendOrderToExcel, FILE_PATH } = require("../utils/excelStore");
const { sendOwnerNotification, sendCustomerNotification } = require("../utils/notify");

// POST /api/orders  -> create a new seed order
router.post("/", async (req, res) => {
  try {
    const {
      farmerName,
      jarviRed,
      jarviRed1,
      jarviRedPlus,
      jarviWhiteHoney,
      mobile,
      fullAddress,
      state,
      village,
      district,
      pinCode,
      farmLocation,
      deliveryDate
    } = req.body;

    // ---- basic validation ----
    if (!farmerName || !mobile || !fullAddress || !state || !village || !district || !pinCode || !deliveryDate) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: "Please enter a valid 10-digit Indian mobile number." });
    }
    const totalQty =
      Number(jarviRed || 0) + Number(jarviRed1 || 0) + Number(jarviRedPlus || 0) + Number(jarviWhiteHoney || 0);
    if (totalQty <= 0) {
      return res.status(400).json({ success: false, message: "Please select at least one variety with quantity." });
    }

    // ---- generate unique order ID ----
    const uniqueId = await generateUniqueId();

    // ---- save to MongoDB ----
    const order = await Order.create({
      uniqueId,
      farmerName,
      varieties: {
        jarviRed: Number(jarviRed || 0),
        jarviRed1: Number(jarviRed1 || 0),
        jarviRedPlus: Number(jarviRedPlus || 0),
        jarviWhiteHoney: Number(jarviWhiteHoney || 0)
      },
      mobile,
      fullAddress,
      state,
      village,
      district,
      pinCode,
      farmLocation,
      deliveryDate
    });

    // ---- save to Excel sheet (does not block the response on error) ----
    try {
      appendOrderToExcel(order);
    } catch (excelErr) {
      console.error("Excel write failed:", excelErr.message);
    }

    // ---- send free notifications (WhatsApp to owner, SMS to customer) ----
    const [ownerSent, customerSent] = await Promise.all([
      sendOwnerNotification(order),
      sendCustomerNotification(order)
    ]);
    order.notification.ownerSent = ownerSent;
    order.notification.customerSent = customerSent;
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      uniqueId: order.uniqueId,
      notification: order.notification
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    return res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// GET /api/orders?key=ADMIN_KEY -> list all orders (simple admin view)
router.get("/", async (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, orders });
});

// GET /api/orders/export?key=ADMIN_KEY -> download the Excel file
router.get("/export", (req, res) => {
  if (req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  res.download(FILE_PATH, "jarvi-seeds-orders.xlsx");
});

module.exports = router;

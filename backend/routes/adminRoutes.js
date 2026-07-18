const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getAllOrders,
  deleteOrder
} = require("../controllers/adminController");

// ===============================
// Admin Login
// ===============================
router.post("/login", adminLogin);

// ===============================
// Get All Orders
// ===============================
router.get("/orders", getAllOrders);

// ===============================
// Delete Order
// ===============================
router.delete("/orders/:id", deleteOrder);

module.exports = router;

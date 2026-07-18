// controllers/adminController.js

const Order = require("../models/Order");

/**
 * ===============================
 * Admin Login
 * ===============================
 */
exports.adminLogin = async (req, res) => {
  try {
    const { adminKey } = req.body;

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        message: "Admin key is required."
      });
    }

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid Admin Key."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login Successful."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

/**
 * ===============================
 * Get Orders (Month Wise)
 * ===============================
 */
exports.getAllOrders = async (req, res) => {

  try {

    const adminKey = req.query.key;

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { month, year } = req.query;

    let filter = {};

    if (month && year) {

      const selectedDate = new Date(Number(year), Number(month) - 1);
      const currentDate = new Date();

      const currentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );

      // Prevent future months
      if (selectedDate > currentMonth) {
        return res.status(400).json({
          success: false,
          message: "Future month reports are not available."
        });
      }

      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);

      filter.createdAt = {
        $gte: start,
        $lt: end
      };
    }

    const orders = await Order.find(filter).sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      totalOrders: orders.length,
      orders
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders."
    });

  }

};
/**
 * ===============================
 * Delete Order
 * ===============================
 */
exports.deleteOrder = async (req, res) => {

  try {

    const adminKey = req.query.key;

    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found."
      });
    }

    await Order.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully."
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order."
    });

  }

};

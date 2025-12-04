import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

export const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // ---------------------------
    // 1. SALES PER PRODUCT (only user's products)
    // ---------------------------
    const salesPerProduct = await Order.aggregate([
      // Match orders for this user
      { $match: { user: userObjectId } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product",
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: { $sum: "$totalAmount" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      // Filter to only show user's products
      { $match: { "product.owner": userObjectId } },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          name: "$product.name",
          totalQuantity: 1,
          totalSales: 1
        }
      }
    ]);

    // ---------------------------
    // 2. MOST ORDERED PRODUCTS
    // ---------------------------
    const mostOrdered = [...salesPerProduct]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 5);

    // ---------------------------
    // 3. ORDER COUNT OVER TIME (user's orders only)
    // ---------------------------
    const orderCount = await Order.aggregate([
      { $match: { user: userObjectId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 } // Last 30 days
    ]);

    // ---------------------------
    // RESPONSE
    // ---------------------------
    return res.status(200).json({
      success: true,
      salesPerProduct,
      mostOrdered,
      orderCount
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

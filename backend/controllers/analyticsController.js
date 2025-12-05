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
    // 1. SALES PER PRODUCT (only products owned by this seller)
    // ---------------------------
    const salesPerProduct = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      // Only include products owned by this seller
      { $match: { "product.owner": userObjectId } },
      {
        $group: {
          _id: "$product._id",
          name: { $first: "$product.name" },
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: {
            $sum: {
              $multiply: [
                "$products.quantity",
                {
                  $multiply: [
                    "$product.price",
                    {
                      $subtract: [
                        1,
                        {
                          $divide: [
                            { $ifNull: ["$product.discount", 0] },
                            100
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          name: 1,
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
    // 3. ORDER COUNT OVER TIME (orders that include this seller's products)
    // ---------------------------
    const orderCount = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: { "product.owner": userObjectId } },
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
    // 4. CATEGORY-WISE SALES (by seller's products)
    // ---------------------------
    const categoryBreakdown = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      { $match: { "product.owner": userObjectId } },
      {
        $group: {
          _id: "$product.category",
          totalQuantity: { $sum: "$products.quantity" },
          totalSales: {
            $sum: {
              $multiply: [
                "$products.quantity",
                {
                  $multiply: [
                    "$product.price",
                    {
                      $subtract: [
                        1,
                        {
                          $divide: [
                            { $ifNull: ["$product.discount", 0] },
                            100
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalQuantity: 1,
          totalSales: 1
        }
      }
    ]);

    // ---------------------------
    // 5. SUMMARY TOTALS
    // ---------------------------
    const totalRevenue = salesPerProduct.reduce(
      (sum, p) => sum + (p.totalSales || 0),
      0
    );
    const totalUnits = salesPerProduct.reduce(
      (sum, p) => sum + (p.totalQuantity || 0),
      0
    );
    const totalProductsWithSales = salesPerProduct.length;
    const totalOrderDays = orderCount.length;

    // ---------------------------
    // RESPONSE
    // ---------------------------
    return res.status(200).json({
      success: true,
      salesPerProduct,
      mostOrdered,
      orderCount,
      categoryBreakdown,
      summary: {
        totalRevenue,
        totalUnits,
        totalProductsWithSales,
        totalOrderDays
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

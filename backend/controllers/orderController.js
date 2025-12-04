import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products given" });
    }

    // Calculate total amount
    let totalAmount = 0;

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      const finalPrice = product.price - (product.price * (product.discount || 0)) / 100;
      totalAmount += finalPrice * item.quantity;
    }

    const newOrder = await Order.create({
      user: req.user.id,
      products,
      totalAmount,
    });

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");

    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

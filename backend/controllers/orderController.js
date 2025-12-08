import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ success: false, message: "No products given" });
    }

    // Calculate total amount and check stock availability
    let totalAmount = 0;
    const productDetails = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });

      // Check stock availability
      if (product.stock < item.quantity) {
        if (product.stock === 0) {
          return res.status(400).json({
            success: false,
            message: `Sorry, "${product.name}" is currently out of stock`
          });
        } else {
          return res.status(400).json({
            success: false,
            message: `Sorry, only ${product.stock} units of "${product.name}" are available`
          });
        }
      }

      const finalPrice = product.price - (product.price * (product.discount || 0)) / 100;
      totalAmount += finalPrice * item.quantity;
      productDetails.push({ productId: product._id, quantity: item.quantity });
    }

    const newOrder = await Order.create({
      user: req.user.id,
      products,
      totalAmount,
    });

    // Reduce stock for each product after successful order
    for (let item of productDetails) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user's cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $set: { items: [] } },
      { new: true }
    );

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

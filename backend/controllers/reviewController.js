import Review from "../models/Review.js";
import Product from "../models/Product.js";

// ADD REVIEW
export const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Prevent multiple reviews
    const existing = await Review.findOne({
      user: req.user.id,
      product: productId,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "You already reviewed this product" });
    }

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      comment,
    });

    // Update product rating
    await updateProductRating(productId);

    res.status(201).json({ success: true, review });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET REVIEWS FOR PRODUCT
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email");

    res.status(200).json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    await updateProductRating(review.product);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// HELPER – Update product average rating
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const { avgRating = 0, totalReviews = 0 } = stats[0] || {};

  await Product.findByIdAndUpdate(productId, {
    rating: avgRating,
    numReviews: totalReviews,
  });
};

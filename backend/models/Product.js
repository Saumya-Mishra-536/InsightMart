import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true, trim: true, lowercase: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: { type: Number, default: 0 },

    monthlySales: [
      {
        month: { type: String, required: true },
        sales: { type: Number, default: 0 },
      },
    ],

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Ensure unique index is created for SKU
productSchema.index({ sku: 1 }, { unique: true });

const Product = mongoose.model("Product", productSchema);

export default Product;

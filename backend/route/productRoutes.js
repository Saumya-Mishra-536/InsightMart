import express from "express";
import {
  addProduct,
  addMultipleProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  updatePriceOrDiscount,
  deleteProduct,
  deleteByCategory,
  searchProducts,
  advancedFilter,
  getProductByIdPublic,
} from "../controllers/productController.js";

import auth from "../utils/auth.js";

const router = express.Router();

// Public READ endpoints (global catalog for customers)
router.get("/public", advancedFilter);
router.get("/public/:id", getProductByIdPublic);

// READ (Require login - seller scoped)
router.get("/", auth, getAllProducts);
router.get("/search", auth, searchProducts); // Must come before /:id
router.get("/filter", auth, advancedFilter); // Must come before /:id
router.get("/:id", auth, getProductById);

// CREATE (Require login)
router.post("/", auth, addProduct);
router.post("/bulk", auth, addMultipleProducts);

// UPDATE (Require login)
router.put("/:id", auth, updateProduct);
router.patch("/:id/price-discount", auth, updatePriceOrDiscount);

// DELETE (Require login)
router.delete("/:id", auth, deleteProduct);
router.delete("/", auth, deleteByCategory);

export default router;

import express from "express";
import auth from "../utils/auth.js";
import { addReview, getProductReviews, deleteReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/", auth, addReview);
router.get("/:productId", getProductReviews);
router.delete("/:id", auth, deleteReview);

export default router;

import express from "express";
import auth from "../utils/auth.js";
import { addToCart, getCart, updateCartItem, removeCartItem } from "../controllers/cartController.js";

const router = express.Router();

router.post("/add", auth, addToCart);
router.get("/my-cart", auth, getCart);
router.put("/update", auth, updateCartItem);
router.delete("/remove", auth, removeCartItem);
// router.delete("/clear", auth, clearCart);


export default router;

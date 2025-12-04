import express from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import auth from "../utils/auth.js";

const router = express.Router();

router.post("/create", auth, createOrder);
router.get("/my-orders", auth, getMyOrders);

export default router;

import express from "express";
import auth from "../utils/auth.js";
import { getDashboardAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// Dashboard analytics route - protected
router.get("/", auth, getDashboardAnalytics);

export default router;

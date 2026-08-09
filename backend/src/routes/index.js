// index.js - Gom tất cả các route lại một nơi để dễ quản lý
import express from "express";
import authRoutes from "./auth.route.js";
// import bookRoutes from "./book.route.js"; // sẽ thêm sau khi viết xong module book

const router = express.Router();

router.use("/auth", authRoutes);
// router.use("/books", bookRoutes);

export default router;
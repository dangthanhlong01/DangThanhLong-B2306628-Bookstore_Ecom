// index.js - Gom tất cả các route lại một nơi để dễ quản lý
import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import bannerRoutes from "./banner.route.js"; // thêm route banner 
import bookRoutes from "./book.route.js"; // thêm route book
import categoryRoutes from "./category.route.js"; // thêm route category
import publisherRoute from "./publisher.route.js"; // thêm route publisher
import authorRoute from "./author.route.js"; // thêm route author
import voucherRoute from "./voucher.route.js"; // thêm route voucher
import shippingTypeRoute from "./shippingType.route.js"// thêm route shippingType
import orderBookRoute from "./orderBook.route.js";
import dashboardRouer from "./dashboard.route.js";
import shopcartRouter from "./shopcart.route.js"; // thêm route shopcart
import orderRouter from "./order.route.js"; // thêm route order
import addressRouter from "./address.route.js"; // thêm route address
import chatbotRouter from "./chatbot.route.js"; // thêm route chatbot
// import bookRoutes from "./book.route.js"; // sẽ thêm sau khi viết xong module book

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/banners", bannerRoutes);
router.use("/books", bookRoutes);
router.use("/categories", categoryRoutes);
router.use("/publishers", publisherRoute);
router.use("/authors", authorRoute);
router.use("/vouchers", voucherRoute);
router.use("/shipping-types", shippingTypeRoute);
router.use("/order-books", orderBookRoute);
router.use("/dashboard", dashboardRouer);
router.use("/shopcart", shopcartRouter); // thêm route shopcart
router.use("/orders", orderRouter); // thêm route order
router.use("/addresses", addressRouter); // thêm route address
router.use("/chatbot", chatbotRouter); // thêm route chatbot

// router.use("/books", bookRoutes);

export default router;  
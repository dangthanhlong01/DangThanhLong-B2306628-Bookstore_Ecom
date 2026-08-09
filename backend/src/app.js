// app.js - Khởi tạo Express app và gắn các middleware, route chính
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// Middleware cho phép frontend (Vue) gọi API từ domain khác
app.use(cors());

// Middleware parse dữ liệu JSON gửi lên từ client
app.use(express.json());

// Middleware parse dữ liệu dạng form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Gắn toàn bộ route với tiền tố /api
app.use("/api", routes);

// Route mặc định để test server sống hay không
app.get("/", (req, res) => {
    res.send("Book Store API is running...");
});

export default app;
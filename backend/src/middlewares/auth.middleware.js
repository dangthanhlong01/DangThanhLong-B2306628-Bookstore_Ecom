// auth.middleware.js - Middleware kiểm tra và xác thực JWT token
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Không có token, vui lòng đăng nhập",
      });
    }

    const token = authHeader.split(" ")[1];

    // Giải mã token để lấy id, role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user tương ứng trong DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    // So khớp token gửi lên với token đang lưu trong DB
    // Nếu không khớp → token này đã bị vô hiệu hoá (VD: đã đăng nhập ở nơi khác, hoặc đã logout)
    if (user.tokenUser !== token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "Phiên đăng nhập đã hết hiệu lực, vui lòng đăng nhập lại",
      });
    }

    if (user.status === "inactive") {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Tài khoản của bạn đã bị khoá",
      });
    }

    // Gắn thông tin user vào request để controller/service sau dùng
    req.user = user;

    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: "Token không hợp lệ hoặc đã hết hạn",
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này",
    });
  }
};
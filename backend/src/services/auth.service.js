// auth.service.js - Chứa toàn bộ logic nghiệp vụ xác thực người dùng
// Mỗi hàm trả về object chuẩn: { success, statusCode, message, data? }
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";
import generateToken from "../utils/generateToken.js";
import generateOtp from "../utils/generateOtp.js";
import sendOtpEmail from "./mail.services.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";

const OTP_EXPIRE_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_OTP_COOLDOWN_SECONDS = 60; // giới hạn thời gian chờ giữa 2 lần gửi OTP

// Bước 1: Gửi OTP tới email (chưa tạo user)
const sendOtp = async (email) => {
    if (!email) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập email",
        };
    }

    // Email đã có tài khoản chính thức → không cho gửi OTP nữa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return {
            success: false,
            statusCode: HTTP_STATUS.CONFLICT, // 409 - dữ liệu bị trùng
            message: "Email đã được sử dụng để đăng ký",
        };
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    let otpRecord = await OtpVerification.findOne({ email });

    // Chống spam: nếu vừa gửi OTP cách đây chưa đủ 60s thì chặn lại
    if (otpRecord) {
        const secondsSinceLastSend = (Date.now() - otpRecord.updatedAt.getTime()) / 1000;
        if (secondsSinceLastSend < RESEND_OTP_COOLDOWN_SECONDS) {
            const waitTime = Math.ceil(RESEND_OTP_COOLDOWN_SECONDS - secondsSinceLastSend);
            return {
                success: false,
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS, // 429
                message: `Vui lòng đợi ${waitTime} giây trước khi yêu cầu gửi lại OTP`,
            };
        }

        otpRecord.otp = otp;
        otpRecord.expiresAt = expiresAt;
        otpRecord.attempts = 0;
        otpRecord.isVerified = false;
        await otpRecord.save();
    } else {
        otpRecord = await OtpVerification.create({ email, otp, expiresAt });
    }

    await sendOtpEmail(email, otp);

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Đã gửi mã OTP tới email, vui lòng kiểm tra hộp thư",
    };
};

// Bước 2: Xác minh OTP
const verifyOtp = async (email, otp) => {
    if (!email || !otp) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập email và mã OTP",
        };
    }

    const otpRecord = await OtpVerification.findOne({ email });
    if (!otpRecord) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND, // 404 - không tìm thấy yêu cầu OTP nào
            message: "Không tìm thấy yêu cầu OTP cho email này, vui lòng gửi lại OTP",
        };
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return {
            success: false,
            statusCode: HTTP_STATUS.TOO_MANY_REQUESTS, // 429
            message: "Bạn đã nhập sai quá nhiều lần, vui lòng yêu cầu gửi lại mã OTP mới",
        };
    }

    if (otpRecord.expiresAt < new Date()) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Mã OTP đã hết hạn, vui lòng yêu cầu gửi lại",
        };
    }

    if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: `Mã OTP không đúng. Còn ${MAX_OTP_ATTEMPTS - otpRecord.attempts} lần thử`,
        };
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Xác minh OTP thành công, vui lòng hoàn tất thông tin đăng ký",
    };
};

// Bước 3: Hoàn tất đăng ký
const registerUser = async ({ fullName, email, password, phone, dob }) => {
    if (!fullName || !email || !password) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập đầy đủ thông tin bắt buộc",
        };
    }

    const otpRecord = await OtpVerification.findOne({ email, isVerified: true });
    if (!otpRecord) {
        return {
            success: false,
            statusCode: HTTP_STATUS.FORBIDDEN, // 403 - không đủ điều kiện thực hiện hành động
            message: "Email chưa được xác minh OTP, vui lòng xác minh trước khi đăng ký",
        };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return {
            success: false,
            statusCode: HTTP_STATUS.CONFLICT, // 409
            message: "Email đã được sử dụng",
        };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        fullName,
        email,
        password: hashedPassword,
        phone,
        dob,
        status: "active",
        isactiveEmail: true,
    });

    await OtpVerification.deleteOne({ email });

    const token = generateToken(newUser._id, newUser.role);
    // Lưu token vừa sinh vào DB để dùng cho việc kiểm soát phiên sau này
    newUser.tokenUser = token;
    await newUser.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.CREATED, // 201 - tạo tài nguyên mới thành công
        message: "Đăng ký thành công",
        data: {
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        },
    };
};

// Đăng nhập
const loginUser = async (email, password) => {
    if (!email || !password) {
        return {
            success: false,
            statusCode: HTTP_STATUS.BAD_REQUEST,
            message: "Vui lòng nhập email và mật khẩu",
        };
    }

    const user = await User.findOne({ email });
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED, // 401 - sai thông tin đăng nhập
            message: "Email hoặc mật khẩu không đúng",
        };
    }

    if (user.status === "inactive") {
        return {
            success: false,
            statusCode: HTTP_STATUS.FORBIDDEN, // 403 - tài khoản bị khoá, đúng nghĩa "bị từ chối truy cập"
            message: "Tài khoản của bạn đã bị khoá",
        };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: "Email hoặc mật khẩu không đúng",
        };
    }

    const token = generateToken(user._id, user.role);
    // Ghi đè token mới vào DB
    // → nếu user đang đăng nhập ở thiết bị khác với token cũ, token đó sẽ tự động bị vô hiệu hoá
    user.tokenUser = token;
    await user.save();
    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Đăng nhập thành công",
        data: {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
            token,
        },
    };
};
// Đăng xuất - xoá token khỏi DB để vô hiệu hoá phiên đăng nhập hiện tại
const logoutUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Người dùng không tồn tại",
        };
    }

    user.tokenUser = null;
    await user.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.OK,
        message: "Đăng xuất thành công",
    };
};

export default {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    logoutUser,
};
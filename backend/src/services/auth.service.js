// auth.service.js - Chứa toàn bộ logic nghiệp vụ xác thực người dùng
// Mỗi hàm trả về object chuẩn: { success, statusCode, message, data? }
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import OtpVerification from "../models/OtpVerification.js";
import generateToken from "../utils/generateToken.js";
import generateOtp from "../utils/generateOtp.js";
import sendOtpEmail from "./mail.services.js";
import { HTTP_STATUS } from "../constants/errorCodes.js";
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
);

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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return {
            success: false,
            statusCode: HTTP_STATUS.CONFLICT,
            message: "Email đã được sử dụng để đăng ký",
        };
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);

    let otpRecord = await OtpVerification.findOne({ email });

    if (otpRecord) {
        const secondsSinceLastSend = (Date.now() - otpRecord.updatedAt.getTime()) / 1000;
        if (secondsSinceLastSend < RESEND_OTP_COOLDOWN_SECONDS) {
            const waitTime = Math.ceil(RESEND_OTP_COOLDOWN_SECONDS - secondsSinceLastSend);
            return {
                success: false,
                statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
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
            statusCode: HTTP_STATUS.NOT_FOUND,
            message: "Không tìm thấy yêu cầu OTP cho email này, vui lòng gửi lại OTP",
        };
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
        return {
            success: false,
            statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
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
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: "Email chưa được xác minh OTP, vui lòng xác minh trước khi đăng ký",
        };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return {
            success: false,
            statusCode: HTTP_STATUS.CONFLICT,
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
    newUser.tokenUser = token;
    await newUser.save();

    return {
        success: true,
        statusCode: HTTP_STATUS.CREATED,
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

    const user = await User.findOne({ email }).select("+password"); // thêm .select("+password")
    if (!user) {
        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: "Email hoặc mật khẩu không đúng",
        };
    }

    if (user.status === "inactive") {
        return {
            success: false,
            statusCode: HTTP_STATUS.FORBIDDEN,
            message: "Tài khoản của bạn đã bị khoá",
        };
    }

    // Bảo vệ thêm: nếu user đăng ký qua Google trước đây mà chưa từng đặt password
    // (hoặc trường hợp dữ liệu cũ thiếu password), tránh lỗi bcrypt và trả lỗi rõ ràng
    if (!user.password) {
        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: "Tài khoản này chưa đặt mật khẩu, vui lòng đăng nhập bằng Google hoặc đặt lại mật khẩu",
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

// Đăng nhập bằng Google
const loginWithGoogle = async (idToken) => {
    try {
        if (!idToken) {
            return {
                success: false,
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: "Google token không tồn tại",
            };
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, picture, email_verified } = payload;

        if (!email || !email_verified) {
            return {
                success: false,
                statusCode: HTTP_STATUS.UNAUTHORIZED,
                message: "Email Google chưa được xác minh",
            };
        }

        let user = await User.findOne({ email });

        if (!user) {
            /*
             * User.js yêu cầu password bắt buộc.
             * Người dùng Google không nhập password,
             * vì vậy backend tạo password ngẫu nhiên rồi hash lại.
             */
            const randomPassword =
                Math.random().toString(36).slice(-10) + "Google@123";

            const hashedPassword = await bcrypt.hash(randomPassword, 10);

            if (!hashedPassword || typeof hashedPassword !== "string") {
                throw new Error(
                    "Không thể tạo mật khẩu ngẫu nhiên cho tài khoản Google"
                );
            }

            user = await User.create({
                fullName: name || "",
                email,
                password: hashedPassword,
                phone: "",
                avatar: picture || "",
                role: "customer",
                status: "active",
                isactiveEmail: true,
            });
        }

        if (user.status === "inactive") {
            return {
                success: false,
                statusCode: HTTP_STATUS.FORBIDDEN,
                message: "Tài khoản của bạn đã bị khoá",
            };
        }

        const token = generateToken(user._id, user.role);

        // Dùng updateOne thay vì user.save() để KHÔNG kích hoạt validate
        // toàn bộ document — tránh lỗi với các user cũ (vd tạo qua Google
        // trước đây) có thể đang thiếu field password.
        await User.updateOne({ _id: user._id }, { $set: { tokenUser: token } });

        return {
            success: true,
            statusCode: HTTP_STATUS.OK,
            message: "Đăng nhập Google thành công",
            data: {
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar,
                },
                token,
            },
        };
    } catch (error) {
        console.error("===== GOOGLE VERIFY ERROR =====");
        console.error("MESSAGE:", error.message);
        console.error("ERROR:", error);

        return {
            success: false,
            statusCode: HTTP_STATUS.UNAUTHORIZED,
            message: error.message || "Đăng nhập Google thất bại",
        };
    }
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
    loginWithGoogle,
    logoutUser,
};
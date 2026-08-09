// mail.service.js
// Service chịu trách nhiệm gửi email OTP cho người dùng
import nodemailer from "nodemailer";
import env from "../config/env.js";
// Hàm gửi OTP đến email người dùng
const sendOtpEmail = async (email, otp) => {
    // Tạo transporter BÊN TRONG hàm — chỉ được tạo khi hàm này thực sự được GỌI,
    // lúc đó dotenv.config() chắc chắn đã chạy xong, process.env đã có giá trị đầy đủ
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: env.MAIL_USER,
            pass: env.MAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Bookstore Ecom" <${env.MAIL_USER}>`,
        to: email,
        subject: "Mã OTP xác thực email - Bookstore Ecom",
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
        html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Xác thực email - Bookstore Ecom</h2>
                <p>Mã OTP của bạn là:</p>
                <h1 style="letter-spacing: 5px;">${otp}</h1>
                <p>Mã OTP có hiệu lực trong <strong>5 phút</strong>.</p>
                <p>Không chia sẻ mã OTP này cho bất kỳ ai.</p>
            </div>
        `,
    };

    await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
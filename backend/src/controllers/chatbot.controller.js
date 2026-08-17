import chatbotService from "../services/chatbot.service.js";

const sendMessage = async (req, res) => {
    try {
        const { messages, userMessage } = req.body;

        if (
            !userMessage ||
            !userMessage.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Tin nhắn không được để trống",
            });
        }

        const conversationHistory =
            Array.isArray(messages)
                ? messages
                : [];

        const updatedMessages = [
            ...conversationHistory,
            {
                role: "user",
                content: userMessage.trim(),
            },
        ];

        // Chỉ giữ 20 tin nhắn gần nhất
        const limitedMessages =
            updatedMessages.slice(-20);

        const result =
            await chatbotService.getChatbotResponse(
                limitedMessages
            );

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,

            data: {
                reply: result.message,

                products:
                    result.products || [],

                updatedMessages: [
                    ...limitedMessages,

                    {
                        role: "assistant",
                        content: result.message,
                    },
                ],
            },
        });
    } catch (error) {
        console.error(
            "Chatbot Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,

            message:
                "Lỗi server, vui lòng thử lại sau",
        });
    }
};

const getWelcomeMessage = async (
    req,
    res
) => {
    return res.status(200).json({
        success: true,

        data: {
            message:
                "Xin chào! 👋 Mình là trợ lý AI của Bookstore. Mình có thể giúp bạn tìm sách, tư vấn theo thể loại, tác giả, mức giá hoặc nhu cầu đọc. Bạn đang muốn tìm cuốn sách nào?",
        },
    });
};

export default {
    sendMessage,
    getWelcomeMessage,
};
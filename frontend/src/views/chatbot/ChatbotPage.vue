<template>
    <div class="chatbot-wrapper">

        <!-- =========================
             NÚT MỞ CHATBOT
        ========================== -->
        <button v-if="!isOpen" class="chatbot-toggle" @click="openChatbot" aria-label="Mở chatbot">
            <img :src="chatbotImage" alt="Chatbot" />

            <span v-if="unread" class="chatbot-unread">
                1
            </span>
        </button>


        <!-- =========================
             KHUNG CHATBOT
        ========================== -->
        <div v-if="isOpen" class="chatbot-box">

            <!-- =========================
                 HEADER
            ========================== -->
            <div class="chatbot-header">

                <div class="chatbot-header-left">

                    <div class="chatbot-avatar">
                        <img :src="chatbotImage" alt="Chatbot" />
                    </div>

                    <div>
                        <h3>Trợ lý Bookstore</h3>

                        <div class="chatbot-status">
                            <span></span>
                            Đang hoạt động
                        </div>
                    </div>

                </div>


                <div class="chatbot-header-actions">

                    <button class="chatbot-header-btn" @click="clearChat" title="Xóa cuộc trò chuyện">
                        <i class="fas fa-trash-alt"></i>
                    </button>

                    <button class="chatbot-header-btn" @click="closeChatbot" title="Đóng">
                        <i class="fas fa-times"></i>
                    </button>

                </div>

            </div>


            <!-- =========================
                 BODY
            ========================== -->
            <div ref="messagesContainer" class="chatbot-body">

                <!-- =========================
                     WELCOME
                ========================== -->
                <div v-if="messages.length === 0" class="chatbot-welcome">

                    <div class="welcome-icon">
                        <img :src="chatbotImage" alt="Chatbot" />
                    </div>

                    <h4>
                        Xin chào! 👋
                    </h4>

                    <p>
                        Mình là trợ lý AI của Bookstore.
                        Mình có thể giúp bạn tìm sách và
                        tư vấn sách phù hợp với nhu cầu.
                    </p>


                    <!-- =========================
                         QUICK QUESTIONS
                    ========================== -->
                    <div class="quick-questions">

                        <button v-for="question in quickQuestions" :key="question" @click="sendQuickQuestion(question)">
                            <i class="fas fa-comment-dots"></i>

                            {{ question }}
                        </button>

                    </div>

                </div>


                <!-- =========================
                     MESSAGES
                ========================== -->
                <div v-for="(message, index) in messages" :key="index" class="message-row" :class="message.role">

                    <!-- BOT AVATAR -->
                    <!-- <div v-if="message.role === 'assistant'" class="message-avatar">
                        <img :src="chatbotImage" alt="Chatbot" />
                    </div> -->


                    <div class="message-content">

                        <!-- MESSAGE -->
                        <div class="message-bubble">
                            {{ message.content }}
                        </div>


                        <!-- =========================
                             PRODUCTS
                        ========================== -->
                        <div v-if="
                            message.role === 'assistant' &&
                            message.products &&
                            message.products.length
                        " class="chatbot-products">

                            <div v-for="book in message.products" :key="book.id" class="book-card">

                                <!-- BOOK IMAGE -->
                                <div class="book-image">
                                    <img :src="book.image ||
                                        book.images?.[0] ||
                                        chatbotImage
                                        " :alt="book.title" />
                                </div>


                                <!-- BOOK INFO -->
                                <div class="book-info">

                                    <h5 :title="book.title">
                                        {{ book.title }}
                                    </h5>


                                    <!-- AUTHOR -->
                                    <p v-if="
                                        book.authors &&
                                        book.authors.length
                                    " class="book-author">
                                        <i class="fas fa-user-edit"></i>

                                        {{ formatAuthors(book.authors) }}
                                    </p>


                                    <!-- PRICE -->
                                    <div class="book-price">

                                        <!-- GIÁ KHUYẾN MÃI -->
                                        <span v-if="
                                            book.discountPrice &&
                                            book.discountPrice > 0 &&
                                            book.discountPrice < book.price
                                        " class="discount-price">
                                            {{
                                                formatPrice(
                                                    book.discountPrice
                                                )
                                            }}
                                        </span>


                                        <!-- GIÁ GỐC -->
                                        <span :class="{
                                            'old-price':
                                                book.discountPrice &&
                                                book.discountPrice > 0 &&
                                                book.discountPrice < book.price
                                        }">
                                            {{
                                                formatPrice(
                                                    book.price
                                                )
                                            }}
                                        </span>

                                    </div>


                                    <!-- RATING -->
                                    <div v-if="
                                        book.ratingAverage !== undefined &&
                                        book.ratingAverage !== null
                                    " class="book-rating">
                                        <i class="fas fa-star"></i>

                                        {{
                                            Number(
                                                book.ratingAverage
                                            ).toFixed(1)
                                        }}

                                        <span>
                                            ({{
                                                book.ratingCount || 0
                                            }})
                                        </span>
                                    </div>


                                    <!-- VIEW BOOK -->
                                    <button class="view-book-btn" @click="viewBook(book)">
                                        Xem sách

                                        <i class="fas fa-arrow-right"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- =========================
                     LOADING
                ========================== -->
                <div v-if="loading" class="message-row assistant">

                    <div class="message-avatar">
                        <img :src="chatbotImage" alt="Chatbot" />
                    </div>

                    <div class="typing-bubble">

                        <span></span>
                        <span></span>
                        <span></span>

                    </div>

                </div>

            </div>


            <!-- =========================
                 INPUT
            ========================== -->
            <div class="chatbot-footer">

                <div class="chatbot-input-wrapper">

                    <input v-model="inputMessage" type="text" placeholder="Bạn muốn tìm sách gì?"
                        @keyup.enter="sendMessage" :disabled="loading" />

                    <button class="send-btn" @click="sendMessage" :disabled="loading ||
                        !inputMessage.trim()
                        ">
                        <i class="fas fa-paper-plane"></i>
                    </button>

                </div>

                <p class="chatbot-note">
                    Trợ lý AI có thể hỗ trợ tìm kiếm và tư vấn sách.
                </p>

            </div>

        </div>

    </div>
</template>


<script setup>
import { ref, nextTick } from "vue";
import { useRouter } from "vue-router";

import userService from "../../services/user.service.js";
import chatbotImage from "../../assets/logo.png";

import "./Chatbot.css";


// =========================
// ROUTER
// =========================

const router = useRouter();


// =========================
// STATE
// =========================

const isOpen = ref(false);

const loading = ref(false);

const unread = ref(true);

const inputMessage = ref("");

const messages = ref([]);

const messagesContainer = ref(null);


// =========================
// CÂU HỎI GỢI Ý
// =========================

const quickQuestions = [
    "Tìm sách lập trình cho người mới",
    "Gợi ý sách bán chạy",
    "Có sách nào dưới 200.000đ không?",
    "Tìm sách được đánh giá cao",
];


// =========================
// OPEN CHATBOT
// =========================

const openChatbot = async () => {
    isOpen.value = true;

    unread.value = false;

    if (messages.value.length === 0) {
        await loadWelcome();
    }

    await scrollToBottom();
};


// =========================
// CLOSE CHATBOT
// =========================

const closeChatbot = () => {
    isOpen.value = false;
};


// =========================
// WELCOME
// =========================

const loadWelcome = async () => {
    try {

        const response =
            await userService.getChatbotWelcome();


        if (
            response?.success &&
            response?.data
        ) {

            messages.value.push({
                role: "assistant",

                content:
                    response.data.message,

                products: [],
            });

        } else {

            messages.value.push({
                role: "assistant",

                content:
                    "Xin chào! 👋 Mình có thể giúp bạn tìm và tư vấn sách. Bạn đang muốn tìm sách gì?",

                products: [],
            });

        }

    } catch (error) {

        console.error(
            "Lỗi lấy welcome chatbot:",
            error
        );


        messages.value.push({
            role: "assistant",

            content:
                "Xin chào! 👋 Mình có thể giúp bạn tìm và tư vấn sách. Bạn đang muốn tìm sách gì?",

            products: [],
        });

    }
};


// =========================
// SEND QUICK QUESTION
// =========================

const sendQuickQuestion = (question) => {

    inputMessage.value = question;

    sendMessage();
};


// =========================
// SEND MESSAGE
// =========================

const sendMessage = async () => {

    const text =
        inputMessage.value.trim();


    if (
        !text ||
        loading.value
    ) {
        return;
    }


    // =========================
    // USER MESSAGE
    // =========================

    messages.value.push({
        role: "user",

        content: text,

        products: [],
    });


    inputMessage.value = "";

    loading.value = true;


    await scrollToBottom();


    try {

        // =========================
        // LẤY HISTORY
        // =========================

        const history =
            messages.value
                .filter(
                    (message) =>
                        message.role === "user" ||
                        message.role === "assistant"
                )
                .map((message) => ({
                    role: message.role,

                    content: message.content,
                }));


        // =========================
        // GỌI API CHATBOT
        // =========================

        const response =
            await userService.sendChatbotMessage(
                history.slice(0, -1),
                text
            );


        // =========================
        // SUCCESS
        // =========================

        if (
            response?.success &&
            response?.data
        ) {

            messages.value.push({
                role: "assistant",

                content:
                    response.data.reply ||
                    "Mình chưa tìm được câu trả lời phù hợp.",

                products:
                    response.data.products || [],
            });

        } else {

            messages.value.push({
                role: "assistant",

                content:
                    response?.message ||
                    "Xin lỗi bạn, mình đang gặp sự cố. Bạn thử lại nhé!",

                products: [],
            });

        }

    } catch (error) {

        console.error(
            "Chatbot frontend error:",
            error
        );


        messages.value.push({
            role: "assistant",

            content:
                "Xin lỗi bạn, hiện tại mình không thể kết nối với hệ thống. Bạn thử lại sau nhé! 🙏",

            products: [],
        });

    } finally {

        loading.value = false;

        await scrollToBottom();
    }
};


// =========================
// CLEAR CHAT
// =========================

const clearChat = async () => {

    messages.value = [];

    await loadWelcome();

    await scrollToBottom();
};


// =========================
// SCROLL
// =========================

const scrollToBottom = async () => {

    await nextTick();

    if (messagesContainer.value) {

        messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
    }
};


// =========================
// FORMAT PRICE
// =========================

const formatPrice = (price) => {

    if (
        price === undefined ||
        price === null
    ) {
        return "";
    }


    return (
        Number(price).toLocaleString("vi-VN") +
        "đ"
    );
};


// =========================
// FORMAT AUTHORS
// =========================

const formatAuthors = (authors) => {

    if (!authors) {
        return "";
    }


    if (Array.isArray(authors)) {

        return authors
            .map((author) => {

                if (
                    typeof author === "string"
                ) {
                    return author;
                }

                return author?.name || "";
            })
            .filter(Boolean)
            .join(", ");
    }


    return authors;
};


// =========================
// VIEW BOOK
// =========================

const viewBook = (book) => {

    if (!book?.id) {

        console.warn(
            "Sản phẩm chatbot không có id:",
            book
        );

        return;
    }


    router.push({
        name: "BookDetail",

        params: {
            id: book.id,
        },
    });
};
</script>
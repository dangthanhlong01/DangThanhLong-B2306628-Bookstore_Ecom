import https from "https";

import Book from "../models/Book.js";

/**
 * ============================================================
 * GỌI GROQ API
 * ============================================================
 */
const callGroqAPI = (prompt, messages) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: "openai/gpt-oss-20b",

            messages: [
                {
                    role: "system",
                    content: prompt,
                },

                ...messages.map((message) => ({
                    role:
                        message.role === "assistant"
                            ? "assistant"
                            : "user",
                    content: message.content,
                })),
            ],

            temperature: 0.2,
            max_tokens: 1200,
        });

        const request = https.request(
            {
                hostname: "api.groq.com",
                path: "/openai/v1/chat/completions",
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Length": Buffer.byteLength(body),
                },
            },

            (response) => {
                let data = "";

                response.on("data", (chunk) => {
                    data += chunk;
                });

                response.on("end", () => {
                    try {
                        const json = JSON.parse(data);

                        resolve(json);
                    } catch (error) {
                        reject(
                            new Error(
                                "Groq trả về dữ liệu không hợp lệ"
                            )
                        );
                    }
                });
            }
        );

        request.on("error", reject);

        request.write(body);
        request.end();
    });
};

/**
 * ============================================================
 * CHUẨN HÓA CHUỖI TÌM KIẾM
 * ============================================================
 */
const normalizeText = (text = "") => {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
};

/**
 * ============================================================
 * LOẠI BỎ CÁC TỪ KHÔNG QUAN TRỌNG
 * ============================================================
 */
const extractKeywords = (message = "") => {
    const stopWords = [
        "shop",
        "sach",
        "sách",
        "co",
        "có",
        "khong",
        "không",
        "cho",
        "minh",
        "mình",
        "toi",
        "tôi",
        "ban",
        "bạn",
        "muon",
        "muốn",
        "can",
        "cần",
        "tim",
        "tìm",
        "xem",
        "gioi",
        "giới",
        "thieu",
        "thiệu",
        "goi",
        "gợi",
        "y",
        "ý",
        "tu",
        "tư",
        "van",
        "vấn",
        "giup",
        "giúp",
        "voi",
        "với",
        "nhe",
        "nhé",
        "nha",
        "này",
        "nao",
        "nào",
        "la",
        "là",
        "ve",
        "về",
        "mot",
        "một",
        "cuon",
        "cuốn",
        "quyen",
        "quyển",
        "hay",
        "hoac",
        "hoặc",
        "dang",
        "đang",
        "tim",
        "tìm",
        "the",
        "thể",
        "loai",
        "loại",
    ];

    const normalized = normalizeText(message);

    return normalized
        .split(/\s+/)
        .filter((word) => {
            return (
                word.length > 1 &&
                !stopWords.includes(word)
            );
        });
};

/**
 * ============================================================
 * LẤY SÁCH TỪ DATABASE
 *
 * Tìm theo:
 * - tên sách
 * - mô tả
 * - tác giả
 * - nhà xuất bản
 * - danh mục
 * ============================================================
 */
const getBooksFromDB = async (userMessage) => {
    try {
        const keywords = extractKeywords(userMessage);

        /**
         * Nếu người dùng chỉ chào hỏi hoặc hỏi chung chung
         * thì không cần tìm sách.
         */
        if (keywords.length === 0) {
            return [];
        }

        const searchRegex = keywords.map(
            (keyword) =>
                new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        );

        /**
         * Populate:
         * authorIds
         * publisherId
         * categoryIds
         */
        const books = await Book.find({
            status: "active",
            stock: { $gt: 0 },

            $or: [
                {
                    title: {
                        $in: searchRegex,
                    },
                },

                {
                    description: {
                        $in: searchRegex,
                    },
                },
            ],
        })
            .populate({
                path: "authorIds",
                match: {
                    status: "active",
                },
                select: "name slug avatar bio nationality",
            })
            .populate({
                path: "publisherId",
                match: {
                    status: "active",
                },
                select: "name slug logo description",
            })
            .populate({
                path: "categoryIds",
                match: {
                    status: "active",
                },
                select: "name slug description parentId",
            })
            .limit(10)
            .lean();

        /**
         * Nếu tìm trực tiếp không có kết quả,
         * thử tìm rộng hơn theo từng keyword.
         */
        if (books.length === 0) {
            const fallbackBooks = await Book.find({
                status: "active",
                stock: { $gt: 0 },

                $or: keywords.flatMap((keyword) => {
                    const regex = new RegExp(
                        keyword.replace(
                            /[.*+?^${}()|[\]\\]/g,
                            "\\$&"
                        ),
                        "i"
                    );

                    return [
                        { title: regex },
                        { description: regex },
                    ];
                }),
            })
                .populate({
                    path: "authorIds",
                    match: {
                        status: "active",
                    },
                    select: "name slug",
                })
                .populate({
                    path: "publisherId",
                    match: {
                        status: "active",
                    },
                    select: "name slug",
                })
                .populate({
                    path: "categoryIds",
                    match: {
                        status: "active",
                    },
                    select: "name slug",
                })
                .limit(10)
                .lean();

            return formatBooksForChatbot(fallbackBooks);
        }

        return formatBooksForChatbot(books);
    } catch (error) {
        console.error(
            "Lỗi lấy sách từ database:",
            error.message
        );

        return [];
    }
};

/**
 * ============================================================
 * FORMAT DỮ LIỆU SÁCH
 * ============================================================
 */
const formatBooksForChatbot = (books = []) => {
    return books.map((book) => ({
        id: book._id?.toString(),

        title: book.title,

        slug: book.slug,

        description: book.description || "",

        isbn: book.isbn || "",

        authors: (book.authorIds || [])
            .filter(Boolean)
            .map((author) => ({
                id: author._id?.toString(),
                name: author.name,
            })),

        publisher: book.publisherId
            ? {
                id: book.publisherId._id?.toString(),
                name: book.publisherId.name,
            }
            : null,

        categories: (book.categoryIds || [])
            .filter(Boolean)
            .map((category) => ({
                id: category._id?.toString(),
                name: category.name,
            })),

        images: book.images || [],

        price: book.price,

        discountPrice: book.discountPrice,

        stock: book.stock,

        sold: book.sold,

        pageCount: book.pageCount,

        publishYear: book.publishYear,

        language: book.language,

        format: book.format,

        ratingAverage: book.ratingAverage,

        ratingCount: book.ratingCount,
    }));
};

/**
 * ============================================================
 * SYSTEM PROMPT
 * ============================================================
 */
const SYSTEM_PROMPT = `
Bạn là trợ lý AI của một cửa hàng bán sách online.

Nhiệm vụ của bạn là hỗ trợ khách hàng tìm kiếm và lựa chọn sách
dựa trên dữ liệu sách thực tế được cung cấp.

============================================================
QUY TẮC GIAO TIẾP
============================================================

1. Luôn trả lời bằng tiếng Việt.

2. Xưng "mình" và gọi khách hàng là "bạn".

3. Giọng điệu:
   - thân thiện
   - tự nhiên
   - nhiệt tình
   - dễ hiểu

4. Không trả lời quá dài.

5. Nếu khách hỏi chung chung:
   - hãy hỏi thêm nhu cầu
   - ví dụ:
     + Bạn muốn đọc thể loại nào?
     + Bạn muốn tìm sách cho người mới bắt đầu hay nâng cao?
     + Bạn muốn khoảng giá bao nhiêu?

============================================================
QUY TẮC DỮ LIỆU SÁCH
============================================================

1. CHỈ ĐƯỢC giới thiệu những sách xuất hiện trong
   danh sách dữ liệu được cung cấp.

2. TUYỆT ĐỐI KHÔNG bịa:
   - tên sách
   - tác giả
   - giá
   - nhà xuất bản
   - thể loại
   - số lượng
   - đánh giá

3. Nếu không tìm thấy sách phù hợp:
   - nói rõ hiện tại chưa tìm thấy sách phù hợp
   - không được tự tạo tên sách.

4. Khi giới thiệu sách, nếu có dữ liệu thì có thể nói:
   - tên sách
   - tác giả
   - thể loại
   - nhà xuất bản
   - giá
   - đánh giá
   - số lượng còn lại

5. Nếu sách có discountPrice > 0 và nhỏ hơn price,
   xem discountPrice là giá bán hiện tại.

6. Nếu discountPrice không hợp lệ hoặc bằng 0,
   sử dụng price.

============================================================
TƯ VẤN THEO NHU CẦU
============================================================

Bạn có thể hỗ trợ:

- Tìm sách theo tên.
- Tìm sách theo tác giả.
- Tìm sách theo nhà xuất bản.
- Tìm sách theo danh mục.
- Tìm sách theo khoảng giá.
- Tìm sách còn hàng.
- Tìm sách bán chạy.
- Tìm sách được đánh giá cao.
- Tư vấn sách cho người mới.
- Gợi ý sách dựa trên nhu cầu đọc.

============================================================
QUY TẮC PRODUCTS
============================================================

Nếu khách đang tìm hoặc cần được gợi ý sách,
hãy đưa những sách phù hợp vào "products".

Nếu câu hỏi không liên quan đến việc tìm sách,
"products" phải là [].

Không được đưa một sản phẩm vào products nếu sản phẩm đó
không tồn tại trong dữ liệu được cung cấp.

============================================================
ĐỊNH DẠNG RESPONSE
============================================================

BẮT BUỘC trả về JSON hợp lệ.

KHÔNG được thêm markdown.

KHÔNG được thêm \`\`\`json.

KHÔNG được viết bất kỳ nội dung nào bên ngoài JSON.

Format:

{
  "message": "Nội dung trả lời",
  "products": [
    {
      "id": "ID sách",
      "title": "Tên sách",
      "price": 200000,
      "discountPrice": 150000,
      "slug": "slug-cua-sach"
    }
  ]
}

Nếu không có sách:

{
  "message": "Nội dung trả lời",
  "products": []
}
`;

/**
 * ============================================================
 * LẤY RESPONSE TỪ CHATBOT
 * ============================================================
 */
const getChatbotResponse = async (messages = []) => {
    try {
        const lastMessage =
            messages[messages.length - 1]?.content || "";

        if (!lastMessage.trim()) {
            return {
                success: false,
                message: "Tin nhắn không hợp lệ.",
            };
        }

        /**
         * 1. Tìm sách trong MongoDB
         */
        const books = await getBooksFromDB(lastMessage);

        /**
         * 2. Không gửi toàn bộ dữ liệu không cần thiết cho AI
         */
        const booksForAI = books.map((book) => ({
            id: book.id,

            title: book.title,

            slug: book.slug,

            description: book.description,

            authors: book.authors?.map(
                (author) => author.name
            ),

            publisher:
                book.publisher?.name || null,

            categories:
                book.categories?.map(
                    (category) => category.name
                ),

            price: book.price,

            discountPrice: book.discountPrice,

            stock: book.stock,

            sold: book.sold,

            pageCount: book.pageCount,

            publishYear: book.publishYear,

            language: book.language,

            format: book.format,

            ratingAverage: book.ratingAverage,

            ratingCount: book.ratingCount,
        }));

        /**
         * 3. Tạo prompt động
         */
        const dynamicPrompt = `
${SYSTEM_PROMPT}

============================================================
DANH SÁCH SÁCH HIỆN CÓ
============================================================

${JSON.stringify(
            booksForAI,
            null,
            2
        )}

============================================================

Hãy trả lời khách hàng dựa trên dữ liệu phía trên.

Nhớ:
- Không bịa thông tin.
- Chỉ giới thiệu sách có trong danh sách.
- Nếu không có sách phù hợp thì products = [].
`;


        /**
         * 4. Gọi Groq
         */
        const response = await callGroqAPI(
            dynamicPrompt,
            messages
        );

        if (response.error) {
            console.error(
                "Groq API Error:",
                response.error.message
            );

            return {
                success: false,
                message:
                    "Không thể kết nối với trợ lý AI.",
            };
        }

        if (
            !response.choices ||
            response.choices.length === 0
        ) {
            return {
                success: false,
                message:
                    "AI không trả về kết quả.",
            };
        }

        const reply =
            response.choices[0]?.message?.content;

        if (!reply) {
            return {
                success: false,
                message:
                    "AI trả về nội dung rỗng.",
            };
        }

        /**
         * 5. Parse JSON
         */
        let parsed;

        try {
            /**
             * Loại bỏ markdown nếu AI lỡ thêm
             */
            const cleaned = reply
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

            parsed = JSON.parse(cleaned);
        } catch (error) {
            console.error(
                "Lỗi parse JSON:",
                error.message
            );

            console.error(
                "AI response:",
                reply
            );

            /**
             * Fallback
             */
            return {
                success: true,

                message: reply,

                products: [],
            };
        }

        /**
         * 6. Kiểm tra products do AI trả về
         *
         * Chỉ lấy những ID thực sự tồn tại trong DB.
         */
        const validProducts = Array.isArray(
            parsed.products
        )
            ? parsed.products
                .map((product) => {
                    const found = books.find(
                        (book) =>
                            String(book.id) ===
                            String(product.id)
                    );

                    if (!found) {
                        return null;
                    }

                    return {
                        id: found.id,

                        title: found.title,

                        slug: found.slug,

                        price: found.price,

                        discountPrice:
                            found.discountPrice,

                        image:
                            found.images?.[0] ||
                            null,

                        authors:
                            found.authors,

                        publisher:
                            found.publisher,

                        categories:
                            found.categories,

                        stock: found.stock,

                        ratingAverage:
                            found.ratingAverage,

                        ratingCount:
                            found.ratingCount,
                    };
                })
                .filter(Boolean)
            : [];

        /**
         * 7. Response cuối cùng
         */
        return {
            success: true,

            message:
                parsed.message ||
                "Mình chưa có thông tin phù hợp.",

            products: validProducts,
        };
    } catch (error) {
        console.error(
            "Chatbot Service Error:",
            error
        );

        return {
            success: false,

            message:
                "Xin lỗi bạn, mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé! 🙏",
        };
    }
};

export default {
    getChatbotResponse,
};
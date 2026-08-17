<template>
    <div class="page">

        <!-- ================================================= -->
        <!-- TITLE -->
        <!-- ================================================= -->

        <h1 class="page-title">
            Quản lý đơn hàng
        </h1>


        <div class="card">

            <!-- ================================================= -->
            <!-- HEADER -->
            <!-- ================================================= -->

            <div class="card-header">
                <span class="tab-label">
                    Danh sách đơn hàng
                </span>
            </div>


            <!-- ================================================= -->
            <!-- TOOLBAR -->
            <!-- ================================================= -->

            <div class="toolbar">

                <div class="toolbar-filters">

                    <input
                        v-model="searchKeyword"
                        type="text"
                        class="search-input"
                        placeholder="Tìm theo mã đơn hàng..."
                    />

                    <select
                        v-model="filterStatus"
                        class="filter-select"
                    >
                        <option value="">
                            Tất cả trạng thái
                        </option>

                        <option value="pending">
                            Chờ xác nhận
                        </option>

                        <option value="confirmed">
                            Đã xác nhận
                        </option>

                        <option value="shipping">
                            Đang giao
                        </option>

                        <option value="completed">
                            Hoàn thành
                        </option>

                        <option value="cancelled">
                            Đã hủy
                        </option>
                    </select>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- TABLE -->
            <!-- ================================================= -->

            <div class="table-wrapper">

                <table class="table">

                    <thead>

                        <tr>

                            <th>STT</th>

                            <th>Mã đơn hàng</th>

                            <th>Loại ship</th>

                            <th>Voucher</th>

                            <th>Shipper</th>

                            <th>Trạng thái</th>

                            <th>Ngày tạo</th>

                            <th>Thao tác</th>

                        </tr>

                    </thead>


                    <tbody>

                        <!-- Loading -->

                        <tr v-if="loading">

                            <td
                                colspan="9"
                                class="empty"
                            >
                                Đang tải...
                            </td>

                        </tr>


                        <!-- Data -->

                        <tr
                            v-else
                            v-for="(
                                order,
                                index
                            ) in filteredOrders"
                            :key="order._id"
                        >

                            <td>
                                {{ index + 1 }}
                            </td>


                            <td class="code-cell">
                                #{{ order._id }}
                            </td>


                            <!-- Loại ship -->
                            <td>
                                {{
                                    getShippingTypeName(
                                        order.typeShipId
                                    )
                                }}
                            </td>


                            <!-- Voucher -->
                            <td>
                                {{
                                    order.voucherId
                                        ? "Có"
                                        : "Không"
                                }}
                            </td>


                            <!-- Payment -->


                            <!-- Shipper -->
                            <td>
                                {{
                                    getShipperName(
                                        order.shipperId
                                    )
                                }}
                            </td>


                            <!-- Status -->
                            <td>

                                <span
                                    :class="[
                                        'status-badge',
                                        getStatusClass(
                                            order.statusId
                                        )
                                    ]"
                                >
                                    {{
                                        getStatusName(
                                            order.statusId
                                        )
                                    }}
                                </span>

                            </td>


                            <!-- Date -->
                            <td>
                                {{
                                    formatDate(
                                        order.createdAt
                                    )
                                }}
                            </td>


                            <!-- Actions -->
                            <td class="actions">

                                <button
                                    class="btn-link btn-view"
                                    @click="
                                        handleOpenDetail(
                                            order
                                        )
                                    "
                                >
                                    Xem
                                </button>


                                <button
                                    class="btn-link btn-edit"
                                    @click="
                                        handleOpenEdit(
                                            order
                                        )
                                    "
                                >
                                    Sửa trạng thái
                                </button>


                                <button
                                    class="btn-link btn-delete"
                                    @click="
                                        handleDelete(
                                            order._id
                                        )
                                    "
                                >
                                    Xóa
                                </button>

                            </td>

                        </tr>


                        <!-- Empty -->

                        <tr
                            v-if="
                                !loading &&
                                filteredOrders.length === 0
                            "
                        >

                            <td
                                colspan="9"
                                class="empty"
                            >
                                Không tìm thấy đơn hàng nào
                            </td>

                        </tr>

                    </tbody>

                </table>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- MODAL XEM -->
        <!-- ================================================= -->

        <div
            v-if="showDetailModal"
            class="modal-overlay"
            @click.self="
                handleCloseDetail
            "
        >

            <div class="modal modal-large">

                <h2 class="modal-title">
                    Chi tiết đơn hàng
                </h2>


                <div
                    v-if="selectedOrder"
                >

                    <!-- ================================================= -->
                    <!-- ORDER INFO -->
                    <!-- ================================================= -->

                    <div class="order-info">

                        <div class="info-item">

                            <span class="info-label">
                                Mã đơn hàng
                            </span>

                            <span class="info-value">
                                #{{ selectedOrder._id }}
                            </span>

                        </div>


                        <div class="info-item">

                            <span class="info-label">
                                Ngày tạo
                            </span>

                            <span class="info-value">
                                {{
                                    formatDate(
                                        selectedOrder.createdAt
                                    )
                                }}
                            </span>

                        </div>


                        <div class="info-item">

                            <span class="info-label">
                                Trạng thái
                            </span>

                            <span
                                :class="[
                                    'status-badge',
                                    getStatusClass(
                                        selectedOrder.statusId
                                    )
                                ]"
                            >
                                {{
                                    getStatusName(
                                        selectedOrder.statusId
                                    )
                                }}
                            </span>

                        </div>


                        <div class="info-item">

                            <span class="info-label">
                                Loại vận chuyển
                            </span>

                            <span class="info-value">

                                {{
                                    getShippingTypeName(
                                        selectedOrder.typeShipId
                                    )
                                }}

                            </span>

                        </div>


                        


                        <div class="info-item">

                            <span class="info-label">
                                Shipper
                            </span>

                            <span class="info-value">

                                {{
                                    getShipperName(
                                        selectedOrder.shipperId
                                    )
                                }}

                            </span>

                        </div>

                    </div>


                    <!-- ================================================= -->
                    <!-- NOTE -->
                    <!-- ================================================= -->

                    <div class="note-box">

                        <strong>
                            Ghi chú:
                        </strong>

                        <span>
                            {{
                                selectedOrder.note ||
                                "Không có"
                            }}
                        </span>

                    </div>


                    <!-- ================================================= -->
                    <!-- PRODUCTS -->
                    <!-- ================================================= -->

                    <h3 class="section-title">
                        Sản phẩm trong đơn hàng
                    </h3>


                    <div class="table-wrapper">

                        <table
                            class="table detail-table"
                        >

                            <thead>

                                <tr>

                                    <th>
                                        STT
                                    </th>

                                    <th>
                                        Ảnh
                                    </th>

                                    <th>
                                        Sản phẩm
                                    </th>

                                    <th>
                                        Số lượng
                                    </th>

                                    <th>
                                        Giá
                                    </th>

                                    <th>
                                        Thành tiền
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                <!-- Loading -->

                                <tr
                                    v-if="
                                        loadingDetails
                                    "
                                >

                                    <td
                                        colspan="6"
                                        class="empty"
                                    >
                                        Đang tải chi tiết...
                                    </td>

                                </tr>


                                <!-- Products -->

                                <tr
                                    v-else
                                    v-for="(
                                        detail,
                                        index
                                    ) in orderDetails"
                                    :key="
                                        detail._id
                                    "
                                >

                                    <td>
                                        {{
                                            index + 1
                                        }}
                                    </td>


                                    <!-- IMAGE -->

                                    <td>

                                        <img
                                            v-if="
                                                getBookImage(
                                                    detail.bookId
                                                )
                                            "
                                            :src="
                                                getBookImage(
                                                    detail.bookId
                                                )
                                            "
                                            class="product-image"
                                            alt="Ảnh sản phẩm"
                                        />


                                        <div
                                            v-else
                                            class="no-image"
                                        >
                                            Không có ảnh
                                        </div>

                                    </td>


                                    <!-- PRODUCT -->

                                    <td>

                                        <div class="product-info">

                                            <strong>
                                                {{
                                                    getBookName(
                                                        detail.bookId
                                                    )
                                                }}
                                            </strong>

                                            <small>
                                                ID:
                                                {{
                                                    getBookId(
                                                        detail.bookId
                                                    )
                                                }}
                                            </small>

                                        </div>

                                    </td>


                                    <!-- QUANTITY -->

                                    <td>
                                        {{
                                            detail.quantity
                                        }}
                                    </td>


                                    <!-- PRICE -->

                                    <td>
                                        {{
                                            formatPrice(
                                                detail.realPrice
                                            )
                                        }}
                                    </td>


                                    <!-- TOTAL -->

                                    <td>

                                        {{
                                            formatPrice(
                                                Number(
                                                    detail.realPrice ||
                                                        0
                                                ) *
                                                    Number(
                                                        detail.quantity ||
                                                            0
                                                    )
                                            )
                                        }}

                                    </td>

                                </tr>


                                <!-- Empty -->

                                <tr
                                    v-if="
                                        !loadingDetails &&
                                        orderDetails.length ===
                                            0
                                    "
                                >

                                    <td
                                        colspan="6"
                                        class="empty"
                                    >
                                        Đơn hàng chưa có sản phẩm
                                    </td>

                                </tr>

                            </tbody>

                        </table>

                    </div>


                    <!-- ================================================= -->
                    <!-- TOTAL -->
                    <!-- ================================================= -->

                    <div class="order-total">

                        <span>
                            Tổng tiền hàng:
                        </span>

                        <strong>
                            {{
                                formatPrice(
                                    totalOrderPrice
                                )
                            }}
                        </strong>

                    </div>


                    <!-- CLOSE -->

                    <div class="modal-actions">

                        <button
                            class="btn btn-secondary"
                            @click="
                                handleCloseDetail
                            "
                        >
                            Đóng
                        </button>

                    </div>

                </div>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- MODAL SỬA STATUS -->
        <!-- ================================================= -->

        <div
            v-if="showEditModal"
            class="modal-overlay"
            @click.self="
                handleCloseEdit
            "
        >

            <div class="modal">

                <h2 class="modal-title">
                    Cập nhật trạng thái đơn hàng
                </h2>


                <p
                    v-if="formError"
                    class="form-error"
                >
                    {{ formError }}
                </p>


                <!-- ONLY STATUS -->

                <div class="form-group">

                    <label>
                        Trạng thái đơn hàng
                    </label>

                    <select
                        v-model="
                            editForm.statusId
                        "
                        class="form-input"
                    >

                        <option value="">
                            Chọn trạng thái
                        </option>

                        <option
                            v-for="
                                status in orderStatuses
                            "
                            :key="
                                status._id
                            "
                            :value="
                                status._id
                            "
                        >
                            {{
                                status.name ||
                                status.status ||
                                status.title
                            }}
                        </option>

                    </select>

                </div>


                <!-- Buttons -->

                <div class="modal-actions">

                    <button
                        class="btn btn-secondary"
                        @click="
                            handleCloseEdit
                        "
                    >
                        Hủy
                    </button>


                    <button
                        class="btn btn-primary"
                        :disabled="
                            saving ||
                            !editForm.statusId
                        "
                        @click="
                            handleSubmitEdit
                        "
                    >

                        {{
                            saving
                                ? "Đang lưu..."
                                : "Cập nhật trạng thái"
                        }}

                    </button>

                </div>

            </div>

        </div>

    </div>
</template>


<script setup>

import {
    ref,
    computed,
    onMounted,
} from "vue";

import userService from "@/services/user.service";


// =====================================================
// STATE
// =====================================================

const orders = ref([]);

const loading = ref(false);

const searchKeyword = ref("");

const filterStatus = ref("");


// =====================================================
// DETAIL MODAL
// =====================================================

const showDetailModal =
    ref(false);

const selectedOrder =
    ref(null);

const orderDetails =
    ref([]);

const loadingDetails =
    ref(false);


// =====================================================
// EDIT MODAL
// =====================================================

const showEditModal =
    ref(false);

const saving =
    ref(false);

const formError =
    ref("");


/*
 * ADMIN CHỈ CẦN STATUS
 */
const editForm = ref({
    statusId: "",
});


// =====================================================
// DATA
// =====================================================

const shippingTypes =
    ref([]);

const orderStatuses =
    ref([]);

const shippers =
    ref([]);


// =====================================================
// FORMAT PRICE
// =====================================================

const formatPrice = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "0đ";
    }

    return (
        Number(value)
            .toLocaleString(
                "vi-VN"
            ) + "đ"
    );
};


// =====================================================
// FORMAT DATE
// =====================================================

const formatDate = (
    value
) => {

    if (!value) {
        return "—";
    }

    return new Date(
        value
    ).toLocaleDateString(
        "vi-VN"
    );
};


// =====================================================
// SHIPPING NAME
// =====================================================

const getShippingTypeName = (
    shippingId
) => {

    if (!shippingId) {
        return "—";
    }

    const id =
        typeof shippingId ===
        "object"
            ? shippingId._id
            : shippingId;

    const shipping =
        shippingTypes.value.find(
            (item) =>
                String(item._id) ===
                String(id)
        );

    return shipping
        ? shipping.type ||
              shipping.name
        : id;
};


// =====================================================
// SHIPPER NAME
// =====================================================

const getShipperName = (
    shipperId
) => {

    if (!shipperId) {
        return "Chưa có";
    }

    if (
        typeof shipperId ===
        "object"
    ) {

        return (
            shipperId.name ||
            shipperId.fullName ||
            shipperId.email ||
            shipperId._id ||
            "Chưa có"
        );

    }

    const shipper =
        shippers.value.find(
            (item) =>
                String(item._id) ===
                String(shipperId)
        );

    if (!shipper) {
        return shipperId;
    }

    return (
        shipper.name ||
        shipper.fullName ||
        shipper.email ||
        shipper._id
    );
};


// =====================================================
// STATUS ID
// =====================================================

const getStatusId = (
    status
) => {

    if (!status) {
        return "";
    }

    if (
        typeof status ===
        "object"
    ) {
        return (
            status._id ||
            status.id ||
            ""
        );
    }

    return status;
};


// =====================================================
// STATUS NAME
// =====================================================

const getStatusName = (
    status
) => {

    if (!status) {
        return "Chưa cập nhật";
    }

    if (
        typeof status ===
        "object"
    ) {

        return (
            status.name ||
            status.status ||
            status.title ||
            status._id ||
            "Chưa cập nhật"
        );
    }

    const found =
        orderStatuses.value.find(
            (item) =>
                String(item._id) ===
                    String(status) ||
                String(item.status) ===
                    String(status) ||
                String(item.code) ===
                    String(status)
        );

    if (found) {
        return (
            found.name ||
            found.status ||
            found.title ||
            status
        );
    }

    const fallback = {
        pending:
            "Chờ xác nhận",

        confirmed:
            "Đã xác nhận",

        shipping:
            "Đang giao",

        completed:
            "Hoàn thành",

        cancelled:
            "Đã hủy",
    };

    return (
        fallback[status] ||
        status
    );
};


// =====================================================
// STATUS CLASS
// =====================================================

const getStatusClass = (
    status
) => {

    const id =
        getStatusId(status);

    switch (id) {

        case "pending":
            return "status-pending";

        case "confirmed":
            return "status-confirmed";

        case "shipping":
            return "status-shipping";

        case "completed":
            return "status-completed";

        case "cancelled":
            return "status-cancelled";

        default:
            return "status-default";
    }
};


// =====================================================
// FILTER
// =====================================================

const filteredOrders =
    computed(() => {

        let result =
            orders.value;

        // SEARCH

        if (
            searchKeyword.value
                .trim()
        ) {

            const keyword =
                searchKeyword.value
                    .trim()
                    .toLowerCase();

            result =
                result.filter(
                    (order) =>
                        String(
                            order._id
                        )
                            .toLowerCase()
                            .includes(
                                keyword
                            )
                );
        }


        // STATUS

        if (
            filterStatus.value
        ) {

            result =
                result.filter(
                    (order) =>
                        String(
                            getStatusId(
                                order.statusId
                            )
                        ) ===
                        String(
                            filterStatus.value
                        )
                );
        }


        return result;
    });


// =====================================================
// TOTAL
// =====================================================

const totalOrderPrice =
    computed(() => {

        return orderDetails.value.reduce(
            (
                total,
                detail
            ) => {

                return (
                    total +
                    Number(
                        detail.realPrice ||
                            0
                    ) *
                        Number(
                            detail.quantity ||
                                0
                        )
                );

            },
            0
        );
    });


// =====================================================
// GET ALL ADMIN ORDERS
// =====================================================

const handleFetchOrders =
    async () => {

        loading.value = true;

        try {

            const res =
                await userService.getAllOrderBooksAdmin();

            orders.value =
                res.data?.data ??
                res.data ??
                [];

        } catch (error) {

            console.error(
                "Lỗi lấy danh sách đơn hàng admin:",
                error
            );

            orders.value = [];

        } finally {

            loading.value = false;

        }
    };


// =====================================================
// GET ADMIN ORDER DETAILS
// =====================================================

const handleFetchOrderDetails = async (orderId) => {
    loadingDetails.value = true;

    try {
        const res =
            await userService.getOrderDetailsAdmin(
                orderId
            );

        console.log(
            "========== ADMIN ORDER DETAIL =========="
        );

        console.log(
            "ORDER ID:",
            orderId
        );

        console.log(
            "DETAIL RESPONSE:",
            res.data
        );

        console.log(
            "DETAILS:",
            res.data?.data
        );

        console.log(
            "========================================"
        );

        orderDetails.value =
            res.data?.data ??
            res.data ??
            [];

    } catch (error) {
        console.error(
            "Lỗi lấy chi tiết đơn hàng admin:",
            error
        );

        orderDetails.value = [];
    } finally {
        loadingDetails.value = false;
    }
};


// =====================================================
// SHIPPING TYPES
// =====================================================

const handleFetchShippingTypes =
    async () => {

        try {

            const res =
                await userService.getShippingTypes();

            shippingTypes.value =
                res.data?.data ??
                res.data ??
                [];

        } catch (error) {

            console.error(
                "Lỗi lấy loại vận chuyển:",
                error
            );

        }
    };


// =====================================================
// STATUS
// =====================================================

const handleFetchStatuses =
    async () => {

        try {

            /*
             * Nếu project của m đã có API
             * getOrderStatuses thì dùng.
             */

            if (
                typeof userService.getOrderStatuses ===
                "function"
            ) {

                const res =
                    await userService.getOrderStatuses();

                orderStatuses.value =
                    res.data?.data ??
                    res.data ??
                    [];

            }


            // Nếu API không có thì dùng fallback

            if (
                !orderStatuses.value.length
            ) {

                orderStatuses.value = [

                    {
                        _id:
                            "pending",
                        name:
                            "Chờ xác nhận",
                    },

                    {
                        _id:
                            "confirmed",
                        name:
                            "Đã xác nhận",
                    },

                    {
                        _id:
                            "shipping",
                        name:
                            "Đang giao",
                    },

                    {
                        _id:
                            "completed",
                        name:
                            "Hoàn thành",
                    },

                    {
                        _id:
                            "cancelled",
                        name:
                            "Đã hủy",
                    },

                ];

            }

        } catch (error) {

            console.error(
                "Lỗi lấy trạng thái đơn hàng:",
                error
            );

            orderStatuses.value = [

                {
                    _id:
                        "pending",
                    name:
                        "Chờ xác nhận",
                },

                {
                    _id:
                        "confirmed",
                    name:
                        "Đã xác nhận",
                },

                {
                    _id:
                        "shipping",
                    name:
                        "Đang giao",
                },

                {
                    _id:
                        "completed",
                    name:
                        "Hoàn thành",
                },

                {
                    _id:
                        "cancelled",
                    name:
                        "Đã hủy",
                },

            ];

        }
    };


// =====================================================
// DETAIL
// =====================================================

const handleOpenDetail =
    async (
        order
    ) => {

        selectedOrder.value =
            order;

        orderDetails.value =
            [];

        showDetailModal.value =
            true;

        await handleFetchOrderDetails(
            order._id
        );
    };


const handleCloseDetail =
    () => {

        showDetailModal.value =
            false;

        selectedOrder.value =
            null;

        orderDetails.value =
            [];
    };


// =====================================================
// GET BOOK ID
// =====================================================

const getBookId = (
    book
) => {

    if (!book) {
        return "—";
    }

    if (
        typeof book ===
        "object"
    ) {

        return (
            book._id ||
            "—"
        );
    }

    return book;
};


// =====================================================
// GET BOOK NAME
// =====================================================

const getBookName = (
    book
) => {

    if (!book) {
        return "Không tìm thấy sản phẩm";
    }

    if (
        typeof book ===
        "object"
    ) {

        return (
            book.title ||
            book.name ||
            "Không có tên sản phẩm"
        );
    }

    return book;
};


// =====================================================
// GET BOOK IMAGE
// =====================================================

const getBookImage = (
    book
) => {

    if (!book) {
        return "";
    }

    if (
        typeof book !==
        "object"
    ) {
        return "";
    }


    // images array

    if (
        Array.isArray(
            book.images
        ) &&
        book.images.length
    ) {

        const first =
            book.images[0];

        if (
            typeof first ===
            "string"
        ) {
            return first;
        }

        if (
            first &&
            typeof first ===
                "object"
        ) {

            return (
                first.url ||
                first.path ||
                first.src ||
                ""
            );
        }
    }


    // image string

    if (
        typeof book.image ===
        "string"
    ) {

        return book.image;
    }


    // image object

    if (
        book.image &&
        typeof book.image ===
            "object"
    ) {

        return (
            book.image.url ||
            book.image.path ||
            book.image.src ||
            ""
        );
    }


    return "";
};


// =====================================================
// OPEN EDIT
// =====================================================

const handleOpenEdit =
    (order) => {

        formError.value =
            "";

        editForm.value = {

            statusId:
                getStatusId(
                    order.statusId
                ),

        };

        selectedOrder.value =
            order;

        showEditModal.value =
            true;
    };


// =====================================================
// CLOSE EDIT
// =====================================================

const handleCloseEdit =
    () => {

        showEditModal.value =
            false;

        formError.value =
            "";

        editForm.value = {
            statusId: "",
        };
    };


// =====================================================
// ADMIN UPDATE STATUS ONLY
// =====================================================

const handleSubmitEdit =
    async () => {

        formError.value =
            "";

        if (
            !editForm.value.statusId
        ) {

            formError.value =
                "Vui lòng chọn trạng thái";

            return;
        }


        if (
            !selectedOrder.value
        ) {

            formError.value =
                "Không tìm thấy đơn hàng";

            return;
        }


        saving.value =
            true;

        try {

            /*
             * CỰC KỲ QUAN TRỌNG:
             *
             * Chỉ gửi statusId.
             *
             * Không gửi:
             * typeShipId
             * shipperId
             * voucherId
             * isPaymentOnline
             * note
             */

            const payload = {
                statusId:
                    editForm.value
                        .statusId,
            };


            const res =
                await userService.updateOrderBookAdmin(
                    selectedOrder.value
                        ._id,
                    payload
                );


            if (
                res.data?.success ===
                false
            ) {

                formError.value =
                    res.data.message ||
                    "Cập nhật trạng thái thất bại";

                return;
            }


            handleCloseEdit();

            await handleFetchOrders();

        } catch (error) {

            console.error(
                "Lỗi cập nhật trạng thái admin:",
                error
            );

            formError.value =
                error.response
                    ?.data
                    ?.message ||
                "Cập nhật trạng thái thất bại";

        } finally {

            saving.value =
                false;

        }
    };


// =====================================================
// DELETE
// =====================================================

const handleDelete =
    async (
        orderId
    ) => {

        if (
            !confirm(
                "Bạn có chắc muốn xóa đơn hàng này?"
            )
        ) {
            return;
        }


        try {

            const res =
                await userService.deleteOrderBookAdmin(
                    orderId
                );


            if (
                res.data?.success ===
                false
            ) {

                alert(
                    res.data.message ||
                    "Xóa đơn hàng thất bại"
                );

                return;
            }


            await handleFetchOrders();

        } catch (error) {

            console.error(
                "Lỗi xóa đơn hàng:",
                error
            );

            alert(
                error.response
                    ?.data
                    ?.message ||
                "Xóa đơn hàng thất bại"
            );
        }
    };


// =====================================================
// INIT
// =====================================================

onMounted(
    async () => {

        await Promise.all([
            handleFetchOrders(),
            handleFetchShippingTypes(),
            handleFetchStatuses(),
        ]);

    }
);

</script>


<style scoped>

.page {
    padding: 0;
    background: transparent;
    min-height: auto;
    color: #1f2937;
}


.page-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 20px;
}


.card {
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow:
        0 1px 3px
            rgba(
                0,
                0,
                0,
                0.08
            );
}


.card-header {
    padding: 16px 20px;
    border-bottom:
        1px solid #eef0f2;
}


.tab-label {
    font-size: 15px;
    font-weight: 600;
}


.toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
}


.toolbar-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}


.search-input,
.filter-select {
    padding: 8px 12px;
    border:
        1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    outline: none;
}


.search-input {
    width: 260px;
}


.search-input:focus,
.filter-select:focus {
    border-color: #2563eb;
}


.table-wrapper {
    overflow-x: auto;
}


.table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}


.table th {
    background: #f9fafb;
    color: #374151;
    font-weight: 600;
    padding: 11px 16px;
    text-align: left;
    border-bottom:
        1px solid #eef0f2;
    white-space: nowrap;
}


.table td {
    padding: 12px 16px;
    border-bottom:
        1px solid #f3f4f6;
    color: #374151;
    vertical-align: middle;
}


.table tbody tr:hover {
    background: #f9fafb;
}


.code-cell {
    font-weight: 600;
    font-size: 12px;
}


.actions {
    white-space: nowrap;
}


.btn-link {
    background: none;
    border: none;
    font-size: 13px;
    cursor: pointer;
    padding: 0;
    font-weight: 500;
}


.btn-view {
    color: #059669;
    margin-right: 10px;
}


.btn-edit {
    color: #2563eb;
    margin-right: 10px;
}


.btn-delete {
    color: #dc2626;
}


.btn-link:hover {
    text-decoration: underline;
}


.badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}


.badge--active {
    background: #dcfce7;
    color: #16a34a;
}


.badge--warning {
    background: #fef3c7;
    color: #b45309;
}


/* STATUS */

.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
}


.status-pending {
    background: #fef3c7;
    color: #92400e;
}


.status-confirmed {
    background: #dbeafe;
    color: #1d4ed8;
}


.status-shipping {
    background: #e0e7ff;
    color: #4338ca;
}


.status-completed {
    background: #dcfce7;
    color: #166534;
}


.status-cancelled {
    background: #fee2e2;
    color: #b91c1c;
}


.status-default {
    background: #f3f4f6;
    color: #374151;
}


.empty {
    text-align: center;
    color: #9ca3af;
    padding: 32px;
}


/* MODAL */

.modal-overlay {
    position: fixed;
    inset: 0;
    background:
        rgba(
            0,
            0,
            0,
            0.6
        );
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 20px;
}


.modal {
    background: #ffffff;
    border-radius: 10px;
    padding: 24px;
    width: 460px;
    max-width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}


.modal-large {
    width: 950px;
}


.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 20px;
}


/* ORDER INFO */

.order-info {
    display: grid;
    grid-template-columns:
        1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
}


.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px;
    background: #f9fafb;
    border-radius: 6px;
}


.info-label {
    font-size: 12px;
    color: #6b7280;
}


.info-value {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
}


/* NOTE */

.note-box {
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 13px;
}


.note-box strong {
    margin-right: 5px;
}


/* SECTION */

.section-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 10px;
}


/* PRODUCT */

.product-image {
    width: 70px;
    height: 90px;
    object-fit: cover;
    display: block;
    border-radius: 8px;
    border:
        1px solid #e5e7eb;
    background: #f9fafb;
}


.no-image {
    width: 70px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 11px;
    color: #9ca3af;
    background: #f3f4f6;
    border-radius: 8px;
    border:
        1px solid #e5e7eb;
}


.product-info {
    display: flex;
    flex-direction: column;
    gap: 5px;
}


.product-info strong {
    color: #1f2937;
    font-size: 13px;
}


.product-info small {
    color: #9ca3af;
    font-size: 11px;
}


/* TOTAL */

.order-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    margin-top: 15px;
    padding-top: 15px;
    border-top:
        1px solid #e5e7eb;
}


.order-total strong {
    font-size: 18px;
    color: #dc2626;
}


/* FORM */

.form-group {
    margin-bottom: 15px;
}


.form-group label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}


.form-input {
    width: 100%;
    box-sizing: border-box;
    padding: 9px 12px;
    border:
        1px solid #d1d5db;
    border-radius: 6px;
    background: #ffffff;
    color: #1f2937;
    font-size: 14px;
    outline: none;
}


.form-input:focus {
    border-color: #2563eb;
}


.form-error {
    background: #fee2e2;
    color: #b91c1c;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 13px;
    margin-bottom: 15px;
}


/* BUTTONS */

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}


.btn {
    padding: 8px 16px;
    border-radius: 5px;
    border: none;
    font-size: 13px;
    cursor: pointer;
}


.btn-primary {
    background: #2563eb;
    color: #ffffff;
}


.btn-primary:hover {
    background: #1d4ed8;
}


.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}


.btn-secondary {
    background: #4b5563;
    color: #ffffff;
}


.btn-secondary:hover {
    background: #374151;
}


/* RESPONSIVE */

@media (
    max-width: 700px
) {

    .order-info {
        grid-template-columns:
            1fr;
    }


    .modal-large {
        width: 100%;
    }


    .search-input {
        width: 100%;
    }

}

</style>
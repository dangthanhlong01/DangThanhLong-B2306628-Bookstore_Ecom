<script setup>
import { ref, onMounted } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import userService from "@/services/user.service";

// =========================
// Thông tin user
// =========================
const inputValues = ref({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    avatar: "",
    role: "",
    dob: "",
    status: "",
    isactiveEmail: true,
});

// Ngày sinh dùng cho input type="date"
const birthday = ref("");

// Kiểm tra ngày sinh có thay đổi hay không
const isChangeDate = ref(false);

// Ảnh dùng để preview
const imageReview = ref("");

// Hiển thị modal xem ảnh
const isOpen = ref(false);

// Ảnh mặc định
const defaultImage =
    "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg";


// ======================================================
// LẤY PROFILE USER ĐANG ĐĂNG NHẬP
// ======================================================
const fetchUser = async () => {
    try {
        console.log("=== BẮT ĐẦU LẤY PROFILE ===");

        const response = await userService.getProfile();

        console.log("PROFILE RESPONSE:", response);

        const user = response?.data?.user;

        console.log("USER SAU KHI FETCH:", user);

        if (!user) {
            console.error("Không tìm thấy user:", response);
            toast.error("Không lấy được thông tin người dùng");
            return;
        }

        setStateUser(user);

        console.log("INPUT VALUES SAU KHI SET:", inputValues.value);
        console.log("BIRTHDAY SAU KHI SET:", birthday.value);

    } catch (error) {
        console.error("Lỗi lấy thông tin user:", error);

        toast.error(
            error?.response?.data?.message ||
            error?.message ||
            "Không thể lấy thông tin người dùng"
        );
    }
};


// ======================================================
// ĐƯA DỮ LIỆU USER VÀO FORM
// ======================================================
const setStateUser = (data) => {
    console.log("SET STATE USER:", data);

    inputValues.value = {
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
        gender: data.gender ?? "",
        avatar: data.avatar || defaultImage,
        role: data.role ?? "",
        dob: data.dob ?? "",
        status: data.status ?? "",
        isactiveEmail: data.isactiveEmail ?? true,
    };

    if (data.dob) {
        const date = new Date(data.dob);

        if (!isNaN(date.getTime())) {
            birthday.value = date.toISOString().split("T")[0];
        } else {
            birthday.value = "";
        }
    } else {
        birthday.value = "";
    }

    imageReview.value = data.avatar || defaultImage;

    console.log(
        "INPUT VALUES SAU KHI SET:",
        inputValues.value
    );

    console.log(
        "BIRTHDAY SAU KHI SET:",
        birthday.value
    );
};


// ======================================================
// XỬ LÝ INPUT
// ======================================================
const handleOnChange = (event) => {
    const { name, value } = event.target;

    inputValues.value[name] = value;
};


// ======================================================
// XỬ LÝ NGÀY SINH
// ======================================================
const handleOnChangeDate = (event) => {
    birthday.value = event.target.value;
    isChangeDate.value = true;
};


// ======================================================
// CHUYỂN FILE SANG BASE64
// ======================================================
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};


// ======================================================
// CHỌN ẢNH AVATAR
// ======================================================
const handleOnChangeImage = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    // Giới hạn 30MB
    if (file.size > 30 * 1024 * 1024) {
        toast.error("Dung lượng ảnh phải nhỏ hơn 30MB");
        return;
    }

    try {
        // Chuyển ảnh thành Base64
        const base64 = await getBase64(file);

        // Tạo URL để preview
        const objectUrl = URL.createObjectURL(file);

        inputValues.value.avatar = base64;
        imageReview.value = objectUrl;

    } catch (error) {
        console.error("Lỗi đọc file:", error);
        toast.error("Không thể đọc file ảnh");
    }
};


// ======================================================
// MỞ XEM ẢNH
// ======================================================
const openPreviewImage = (url) => {
    if (!url) return;

    imageReview.value = url;
    isOpen.value = true;
};


// ======================================================
// ĐÓNG XEM ẢNH
// ======================================================
const closePreviewImage = () => {
    isOpen.value = false;
};


// ======================================================
// CẬP NHẬT THÔNG TIN USER
// ======================================================
const handleSaveInfor = async () => {
    if (
        !inputValues.value.fullName ||
        inputValues.value.fullName.trim() === ""
    ) {
        toast.error("Họ và tên không được để trống");
        return;
    }

    const phoneRegex = /^[0-9]{10}$/;

    if (
        inputValues.value.phone &&
        !phoneRegex.test(inputValues.value.phone)
    ) {
        toast.error("Vui lòng nhập số điện thoại 10 số");
        return;
    }

    try {
        let dob = inputValues.value.dob;

        if (isChangeDate.value && birthday.value) {
            dob = birthday.value
                ? new Date(birthday.value).toISOString()
                : null;
        }

        const updateData = {
            fullName: inputValues.value.fullName,
            phone: inputValues.value.phone,
            address: inputValues.value.address,
            gender: inputValues.value.gender,
            dob: dob,
            avatar: inputValues.value.avatar,
        };

        console.log("DATA GỬI BACKEND:", updateData);

        const response = await userService.updateProfile(updateData);

        console.log("UPDATE RESPONSE:", response);

        // axiosClient đã unwrap response.data
        // nên response chính là:
        // {
        //   success: true,
        //   statusCode: 200,
        //   message: "...",
        //   data: {
        //      user: {...}
        //   }
        // }

        if (response?.success === true) {
            console.log("UPDATE THÀNH CÔNG");

            const updatedUser = response?.data?.user;

            console.log("USER SAU UPDATE:", updatedUser);

            if (updatedUser) {
                // Cập nhật UI ngay lập tức
                setStateUser(updatedUser);
            }

            isChangeDate.value = false;

            toast.success(
                response.message || "Cập nhật thông tin thành công"
            );

        } else {
            console.error(
                "BACKEND TRẢ VỀ LỖI:",
                response
            );

            toast.error(
                response?.message ||
                "Cập nhật thông tin thất bại"
            );
        }

    } catch (error) {
        console.error("===== UPDATE PROFILE ERROR =====");
        console.error("ERROR:", error);
        console.error("ERROR MESSAGE:", error?.message);
        console.error("ERROR RESPONSE:", error?.response);

        toast.error(
            error?.message ||
            error?.response?.message ||
            "Có lỗi xảy ra khi cập nhật thông tin"
        );
    }
};


// ======================================================
// KHI TRANG ĐƯỢC MỞ
// ======================================================
onMounted(() => {
    fetchUser();
});
</script>


<template>
    <div class="profile-page">

        <!-- ================= PROFILE LEFT ================= -->
        <div class="profile-left">

            <!-- Avatar -->
            <img :src="inputValues.avatar || defaultImage" class="avatar" alt="Avatar" referrerpolicy="no-referrer"
                @click="openPreviewImage(inputValues.avatar)" />

            <!-- Tên -->
            <h3>
                {{ inputValues.fullName }}
            </h3>

            <!-- Email -->
            <div class="email">
                {{ inputValues.email }}

                <i v-if="inputValues.isactiveEmail" class="fas fa-check-circle verified"></i>
            </div>

        </div>


        <!-- ================= PROFILE RIGHT ================= -->
        <div class="profile-right">

            <h4>Thông tin cá nhân</h4>


            <!-- Họ và tên -->
            <div class="form-group">
                <label>Họ và tên</label>

                <input name="fullName" type="text" class="form-control" :value="inputValues.fullName"
                    @input="handleOnChange" />
            </div>


            <!-- Email -->
            <div class="form-group">
                <label>Email</label>

                <input type="email" class="form-control" :value="inputValues.email" readonly />
            </div>


            <!-- Số điện thoại -->
            <div class="form-group">
                <label>Số điện thoại</label>

                <input name="phone" type="text" class="form-control" :value="inputValues.phone" @input="handleOnChange"
                    placeholder="Nhập số điện thoại" />
            </div>


            <!-- Ngày sinh -->
            <div class="form-group">
                <label>Ngày sinh</label>

                <input type="date" class="form-control" :value="birthday" @change="handleOnChangeDate" />
            </div>

            <div class="form-group">
                <label>Địa chỉ</label>

                <input name="address" type="text" class="form-control" :value="inputValues.address"
                    @input="handleOnChange" placeholder="Nhập địa chỉ" />
            </div>

            <!-- Giới tính -->
            <div class="form-group">
                <label>Giới tính</label>

                <select name="gender" class="form-control" :value="inputValues.gender" @change="handleOnChange">
                    <option value="">-- Chọn giới tính --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                </select>
            </div>

            <!-- Avatar -->
            <div class="form-group">
                <label>Ảnh đại diện</label>

                <div>
                    <input type="file" id="avatarInput" accept=".jpg,.jpeg,.png" hidden @change="handleOnChangeImage" />

                    <label for="avatarInput" class="upload-button">
                        Tải ảnh
                        <i class="fas fa-upload"></i>
                    </label>
                </div>
            </div>

            <!-- Button -->
            <div class="button-container">
                <button type="button" class="save-button" @click="handleSaveInfor">
                    Lưu thông tin
                </button>
            </div>

        </div>


        <!-- ================= IMAGE PREVIEW ================= -->
        <div v-if="isOpen" class="image-modal" @click="closePreviewImage">
            <div class="image-modal-content" @click.stop>
                <span class="close-button" @click="closePreviewImage">
                    ×
                </span>

                <img :src="imageReview" alt="Preview" />
            </div>
        </div>

    </div>
</template>


<style scoped>
.profile-page {
    display: flex;
    max-width: 1000px;
    margin: 40px auto;
    background: white;
    border-radius: 8px;
    min-height: 600px;
    overflow: hidden;
}

.profile-left {
    width: 280px;
    border-right: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 20px;
}

.avatar {
    width: 150px;
    height: 170px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    margin-bottom: 20px;
}

.profile-left h3 {
    margin: 5px 0 10px;
    font-size: 18px;
}

.email {
    color: #777;
    text-align: center;
    word-break: break-word;
}

.verified {
    color: green;
    margin-left: 5px;
}

.profile-right {
    flex: 1;
    padding: 40px;
    color: #201f18
}

.profile-right h4 {
    margin-bottom: 30px;
    font-size: 20px;
    color: #000000;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
    background-color: #ffffff;
    color: #000000;
}

.form-control:focus {
    outline: none;
    border-color: #5fae32;
}

.upload-button {
    display: inline-block;
    padding: 8px 14px;
    background: #eee;
    border-radius: 5px;
    cursor: pointer;
}

.upload-button:hover {
    background: #ddd;
}

.button-container {
    margin-top: 30px;
    text-align: center;
}

.save-button {
    border: none;
    padding: 10px 30px;
    border-radius: 5px;
    background: #5fae32;
    color: white;
    cursor: pointer;
}

.save-button:hover {
    opacity: 0.9;
}


/* ================= IMAGE MODAL ================= */

.image-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.image-modal-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
}

.image-modal-content img {
    max-width: 800px;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 5px;
}

.close-button {
    position: absolute;
    right: -35px;
    top: -35px;
    color: white;
    font-size: 35px;
    cursor: pointer;
}
</style>
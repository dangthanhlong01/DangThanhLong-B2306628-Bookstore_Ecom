<template>
    <div class="box-login">
        <div class="login-container">
            <section id="formHolder">
                <div class="row">
                    <div class="form">
                        <!-- ============ PANEL ĐĂNG NHẬP ============ -->
                        <div class="form-peice" :class="{ switched: mode === 'register' }">
                            <form @submit.prevent="handleLogin">
                                <h3 class="form-title">Đăng nhập</h3>

                                <div class="form-group" :class="{ hasError: errors.loginEmail }">
                                    <input type="email" v-model="loginForm.email" @focus="focusField('loginEmail')"
                                        @blur="blurField('loginEmail', loginForm.email)" />
                                    <label :class="{ active: loginForm.email || active.loginEmail }">Địa chỉ
                                        email</label>
                                    <span class="error" :style="errors.loginEmail ? { display: 'block' } : {}">{{
                                        errors.loginEmail }}</span>
                                </div>

                                <div class="form-group" :class="{ hasError: errors.loginPassword }">
                                    <input type="password" v-model="loginForm.password"
                                        @focus="focusField('loginPassword')"
                                        @blur="blurField('loginPassword', loginForm.password)" />
                                    <label :class="{ active: loginForm.password || active.loginPassword }">Mật
                                        khẩu</label>
                                    <span class="error" :style="errors.loginPassword ? { display: 'block' } : {}">{{
                                        errors.loginPassword }}</span>
                                </div>

                                <p v-if="serverError.login" class="server-error">{{ serverError.login }}</p>

                                <div class="CTA">
                                    <input type="submit" value="Đăng nhập" :disabled="loading.login" />
                                    <a class="switch" href="#" @click.prevent="switchMode('register')">Tạo tài khoản
                                        mới</a>
                                </div>

                                <div class="social-login">
                                    <a class="social-btn facebook" href="#">
                                        <img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20viewBox%3D%270%200%2036%2036%27%3E%3Ccircle%20cx%3D%2718%27%20cy%3D%2718%27%20r%3D%2718%27%20fill%3D%27%23fff%27%20stroke%3D%27%23dadce0%27%2F%3E%3Cpath%20fill%3D%27%231877F2%27%20d%3D%27M25%2023l.8-5H21v-3.5c0-1.4.5-2.5%202.7-2.5H26V7.4c-1.3-.2-2.7-.4-4-.4-4.1%200-7%202.5-7%207v4H10v5h5v12.7c1.6.3%202.6.3%204.2%200V23h5.8z%27%2F%3E%3C%2Fsvg%3E"
                                            alt="Facebook" class="social-icon" />
                                        Đăng nhập với Facebook
                                    </a>
                                    <a class="social-btn google" href="#" @click.prevent="handleGoogleLogin">
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                            alt="Google" class="social-icon" />
                                        Đăng nhập với Google
                                    </a>
                                </div>
                            </form>
                        </div>

                        <!-- ============ PANEL ĐĂNG KÝ ============ -->
                        <div class="form-peice" :class="{ switched: mode === 'login' }">
                            <form @submit.prevent="handleRegister">
                                <h3 class="form-title">Đăng ký</h3>

                                <div class="form-group" :class="{ hasError: errors.fullName }">
                                    <input type="text" v-model="registerForm.fullName" @focus="focusField('fullName')"
                                        @blur="blurField('fullName', registerForm.fullName)" />
                                    <label :class="{ active: registerForm.fullName || active.fullName }">Họ và
                                        tên</label>
                                    <span class="error" :style="errors.fullName ? { display: 'block' } : {}">{{
                                        errors.fullName }}</span>
                                </div>

                                <div class="form-group" :class="{ hasError: errors.email }">
                                    <input type="email" v-model="registerForm.email" @focus="focusField('email')"
                                        @blur="blurField('email', registerForm.email)" />
                                    <label :class="{ active: registerForm.email || active.email }">Địa chỉ email</label>
                                    <span class="error" :style="errors.email ? { display: 'block' } : {}">{{
                                        errors.email }}</span>
                                </div>

                                <div class="form-group" :class="{ hasError: errors.phone }">
                                    <input type="tel" v-model="registerForm.phone" @focus="focusField('phone')"
                                        @blur="blurField('phone', registerForm.phone)" />
                                    <label :class="{ active: registerForm.phone || active.phone }">Số điện thoại</label>
                                    <span class="error" :style="errors.phone ? { display: 'block' } : {}">{{
                                        errors.phone }}</span>
                                </div>

                                <div class="form-group otp-group" :class="{ hasError: errors.otp }">
                                    <input type="text" v-model="registerForm.otp" maxlength="6"
                                        @focus="focusField('otp')" @blur="blurField('otp', registerForm.otp)" />
                                    <label :class="{ active: registerForm.otp || active.otp }">Mã OTP</label>

                                    <button type="button" class="otp-btn" :disabled="otpCooldown > 0 || loading.sendOtp"
                                        @click="handleSendOtp">
                                        {{ otpCooldown > 0 ? `Gửi lại (${otpCooldown}s)` : loading.sendOtp ? 'Đang gửi...' : 'Gửi mã' }}
                                    </button>

                                    <button type="button" class="otp-btn verify-btn"
                                        :disabled="!registerForm.otp || registerForm.otp.length !== 6 || loading.verifyOtp || otpVerified"
                                        @click="handleVerifyOtp">
                                        {{ otpVerified ? 'Đã xác thực ✓' : loading.verifyOtp ? 'Đang kiểm tra...' : 'Xác thực' }}
                                    </button>

                                    <span class="error" :style="errors.otp ? { display: 'block' } : {}">{{ errors.otp
                                    }}</span>
                                </div>
                                <p v-if="otpMessage" class="otp-message" :class="{ 'otp-error': otpMessageType === 'error' }">{{ otpMessage }}</p>

                                <div class="form-group" :class="{ hasError: errors.password }">
                                    <input type="password" v-model="registerForm.password"
                                        @focus="focusField('password')"
                                        @blur="blurField('password', registerForm.password)" />
                                    <label :class="{ active: registerForm.password || active.password }">Mật
                                        khẩu</label>
                                    <span class="error" :style="errors.password ? { display: 'block' } : {}">{{
                                        errors.password }}</span>
                                </div>

                                <div class="form-group" :class="{ hasError: errors.confirmPassword }">
                                    <input type="password" v-model="registerForm.confirmPassword"
                                        @focus="focusField('confirmPassword')"
                                        @blur="blurField('confirmPassword', registerForm.confirmPassword)" />
                                    <label
                                        :class="{ active: registerForm.confirmPassword || active.confirmPassword }">Xác
                                        nhận mật khẩu</label>
                                    <span class="error" :style="errors.confirmPassword ? { display: 'block' } : {}">{{
                                        errors.confirmPassword }}</span>
                                </div>

                                <p v-if="serverError.register" class="server-error">{{ serverError.register }}</p>
                                <p v-if="registerSuccess" class="success-message">{{ registerSuccess }}</p>

                                <div class="CTA">
                                    <input type="submit" value="Đăng ký" :disabled="loading.register" />
                                    <a class="switch" href="#" @click.prevent="switchMode('login')">Đã có tài khoản</a>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authService from '../../services/user.service'
import { useUserStore } from '@/stores/user'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
console.log('CLIENT ID:', GOOGLE_CLIENT_ID)

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// mode = 'login' | 'register'
const mode = ref(route.meta?.mode === 'register' ? 'register' : 'login')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({
    fullName: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirmPassword: '',
})

const active = reactive({})
const errors = reactive({})
const serverError = reactive({ login: '', register: '' })
const loading = reactive({ login: false, register: false, sendOtp: false, verifyOtp: false })
const otpMessage = ref('')
const otpMessageType = ref('') // 'success' | 'error'
const otpCooldown = ref(0)
const otpVerified = ref(false)
const registerSuccess = ref('')
let otpTimer = null

function startOtpCooldown(seconds = 60) {
    otpCooldown.value = seconds
    clearInterval(otpTimer)
    otpTimer = setInterval(() => {
        otpCooldown.value -= 1
        if (otpCooldown.value <= 0) clearInterval(otpTimer)
    }, 1000)
}

async function handleSendOtp() {
    otpMessage.value = ''
    otpMessageType.value = ''
    errors.otp = ''
    otpVerified.value = false

    if (!registerForm.email || !validateEmail(registerForm.email)) {
        errors.email = 'Vui lòng nhập email hợp lệ trước khi gửi mã'
        return
    }

    loading.sendOtp = true
    try {
        const res = await authService.sendOtp(registerForm.email)
        otpMessageType.value = 'success'
        otpMessage.value = res?.message || 'Đã gửi mã OTP, vui lòng kiểm tra email'
        startOtpCooldown(60)
    } catch (err) {
        otpMessageType.value = 'error'
        otpMessage.value = err?.message || 'Gửi mã OTP thất bại, vui lòng thử lại'
    } finally {
        loading.sendOtp = false
    }
}

async function handleVerifyOtp() {
    errors.otp = ''
    otpMessage.value = ''
    otpMessageType.value = ''
    loading.verifyOtp = true
    try {
        await authService.verifyOtp(registerForm.email, registerForm.otp)
        otpVerified.value = true
        otpMessageType.value = 'success'
        otpMessage.value = 'Xác thực OTP thành công!'
    } catch (err) {
        otpVerified.value = false
        otpMessageType.value = 'error'
        otpMessage.value = err?.message || 'Mã OTP không đúng hoặc đã hết hạn'
    } finally {
        loading.verifyOtp = false
    }
}

// Nếu người dùng đổi email sau khi đã xác thực OTP thì phải xác thực lại
watch(
    () => registerForm.email,
    () => {
        otpVerified.value = false
    }
)

function focusField(field) {
    active[field] = true
}
function blurField(field, value) {
    if (!value) active[field] = false
}

function switchMode(next) {
    mode.value = next
    router.replace(next === 'register' ? '/register' : '/login')
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleLogin() {
    serverError.login = ''
    errors.loginEmail = !loginForm.email
        ? 'Vui lòng nhập email'
        : !validateEmail(loginForm.email)
            ? 'Email không hợp lệ'
            : ''
    errors.loginPassword = !loginForm.password ? 'Vui lòng nhập mật khẩu' : ''

    if (errors.loginEmail || errors.loginPassword) return

    loading.login = true
    try {
        const res = await authService.login({
            email: loginForm.email,
            password: loginForm.password,
        })
        userStore.setUser(res.data.user, res.data.token)
        if (res.data.user.role === 'admin') {
            router.push('/admin')
        } else {
            router.push('/home')
        }
    } catch (err) {
        serverError.login = err?.message || 'Đăng nhập thất bại, vui lòng thử lại'
    } finally {
        loading.login = false
    }
}

async function handleRegister() {
    serverError.register = ''
    registerSuccess.value = ''

    errors.fullName = !registerForm.fullName ? 'Vui lòng nhập họ tên' : ''
    errors.email = !registerForm.email
        ? 'Vui lòng nhập email'
        : !validateEmail(registerForm.email)
            ? 'Email không hợp lệ'
            : ''
    errors.phone = !registerForm.phone ? 'Vui lòng nhập số điện thoại' : ''
    errors.otp = !registerForm.otp
        ? 'Vui lòng nhập mã OTP đã gửi tới email'
        : registerForm.otp.length !== 6
            ? 'Mã OTP gồm 6 chữ số'
            : !otpVerified.value
                ? 'Vui lòng bấm "Xác thực" để kiểm tra mã OTP trước khi đăng ký'
                : ''
    errors.password = !registerForm.password
        ? 'Vui lòng nhập mật khẩu'
        : registerForm.password.length < 6
            ? 'Mật khẩu phải từ 6 ký tự'
            : ''
    errors.confirmPassword =
        registerForm.confirmPassword !== registerForm.password ? 'Mật khẩu xác nhận không khớp' : ''

    if (Object.values(errors).some(Boolean)) return

    loading.register = true
    try {
        // OTP đã được xác thực ở bước handleVerifyOtp phía trên, ở đây chỉ tạo tài khoản
        const result = await authService.register({
            fullName: registerForm.fullName,
            email: registerForm.email,
            phone: registerForm.phone,
            password: registerForm.password,
        })
        if (result?.data?.token) {
            localStorage.setItem('token', result.data.token)
            localStorage.setItem('userData', JSON.stringify(result.data.user))
        }

        registerSuccess.value = 'Đăng ký thành công!'
        setTimeout(() => {
            router.push('/login')
        }, 1500)
    } catch (err) {
        serverError.register = err?.message || 'Đăng ký thất bại, vui lòng thử lại'
    } finally {
        loading.register = false
    }
}

function initGoogleLogin() {
    if (!window.google) return
    window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredentialResponse,
    })
}

async function handleGoogleCredentialResponse(response) {
    serverError.login = ''
    loading.login = true
    try {
        const idToken = response.credential
        const res = await authService.loginWithGoogle(idToken)
        // res ở đây = { success: true, data: { user, token }, ... }
        userStore.setUser(res.data.user, res.data.token)
        router.push('/home')
    } catch (err) {
        // err ở đây = { success: false, message: "..." } nhờ interceptor
        serverError.login = err?.message || 'Đăng nhập Google thất bại, vui lòng thử lại'
    } finally {
        loading.login = false
    }
}
function handleGoogleLogin() {
    serverError.login = ''
    if (!window.google) {
        serverError.login = 'Google SDK chưa được tải, vui lòng thử lại sau'
        return
    }
    window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            serverError.login = 'Không thể hiển thị đăng nhập Google, vui lòng thử lại'
        }
    })
}

onMounted(() => {
    mode.value = route.path === '/register' ? 'register' : 'login'
    initGoogleLogin()
})
</script>

<style scoped>
.box-login {
    background: #f7edd5;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Montserrat', sans-serif;
}

.login-container {
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    justify-content: center;
}

#formHolder {
    width: 100%;
    padding: 50px 20px;
}

.row {
    position: relative;
    display: flex;
    justify-content: center;
    width: 100%;
}

/* ============ BRAND / PANEL ĐEN ============ */
.brand {
    flex: 0 0 45%;
    padding: 20px;
    background: linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)),
        url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800') center center / cover;
    color: #fff;
    min-height: 540px;
    position: relative;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.6s cubic-bezier(1, -0.375, 0.285, 0.995);
    z-index: 1;
}

.brand.active {
    flex-basis: 100%;
}

.brand .logo {
    color: #f95959;
    font-size: 20px;
    font-weight: 700;
    text-decoration: none;
    line-height: 1em;
}

.brand .logo span {
    font-size: 30px;
    color: #fff;
}

.brand .heading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    transition: all 0.6s;
    width: 100%;
}

.brand .heading.active {
    top: 100px;
    left: 100px;
    width: auto;
    transform: translate(0);
    text-align: left;
}

.brand .heading h2 {
    font-size: 60px;
    font-weight: 700;
    text-transform: uppercase;
    margin: 0 0 10px;
    color: #fff;
}

.brand .heading p {
    font-size: 13px;
    font-weight: 300;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;
}

/* ============ FORM ============ */
.form {
    flex: 0 0 55%;
    position: relative;
    min-height: 540px;
    overflow: hidden;
}

.form-peice {
    background: #fff;
    min-height: 540px;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.2);
    color: #bbbbbb;
    padding: 40px;
    transition: all 0.9s cubic-bezier(1, -0.375, 0.285, 0.995);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    box-sizing: border-box;
}

.form-peice.switched {
    transform: translateX(-120%);
    opacity: 0;
    pointer-events: none;
}

.form-title {
    color: #333;
    font-weight: 700;
    margin: 0 0 25px;
    font-size: 22px;
}

form .form-group {
    margin-bottom: 20px;
    position: relative;
}

form .form-group.hasError input {
    border-color: #f95959 !important;
}

form .form-group.hasError label {
    color: #f95959 !important;
}

form label {
    position: absolute;
    top: 8px;
    left: 0;
    font-size: 15px;
    color: #999;
    font-weight: 400;
    transition: all 0.2s;
    pointer-events: none;
}

form label.active {
    top: -14px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #f95959;
}

form input:not([type='submit']) {
    background: none;
    outline: none;
    border: none;
    display: block;
    padding: 8px 0;
    width: 100%;
    border-bottom: 1px solid #eee;
    color: #444;
    font-size: 15px;
    box-sizing: border-box;
}

form input:not([type='submit']):focus {
    border-bottom-color: #f95959;
}

form span.error {
    color: #f95959;
    font-size: 12px;
    display: none;
    margin-top: 4px;
}

.server-error {
    color: #f95959;
    font-size: 13px;
    margin: 5px 0 0;
}

.success-message {
    color: #71cd14;
    font-size: 13px;
    margin: 5px 0 0;
    font-weight: 600;
}

.otp-group {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    flex-wrap: wrap;
}

.otp-group input {
    flex: 1;
    min-width: 100px;
}

.otp-btn {
    flex-shrink: 0;
    padding: 8px 16px;
    font-size: 12px;
    text-transform: uppercase;
    border-radius: 20px;
    border: 1px solid #f95959;
    background: #fff;
    color: #f95959;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.otp-btn:hover:not(:disabled) {
    background: #f95959;
    color: #fff;
}

.otp-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    border-color: #ccc;
    color: #999;
}

.verify-btn {
    border-color: #71cd14;
    color: #71cd14;
}

.verify-btn:hover:not(:disabled) {
    background: #71cd14;
    color: #fff;
}

.otp-message {
    font-size: 12px;
    color: #71cd14;
    margin: -12px 0 15px;
}

.otp-message.otp-error {
    color: #f95959;
}

.CTA {
    margin-top: 25px;
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
}

.CTA input[type='submit'] {
    font-size: 13px;
    text-transform: uppercase;
    padding: 10px 35px;
    background: #f95959;
    color: #fff;
    border-radius: 30px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
}

.CTA input[type='submit']:hover {
    background: #e84545;
}

.CTA input[type='submit']:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.CTA a.switch {
    font-size: 13px;
    color: #bbbbbb;
    text-decoration: underline;
    transition: color 0.2s;
}

.CTA a.switch:hover {
    color: #f95959;
}

.social-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    vertical-align: middle;
}

.social-login {
    margin-top: 25px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.social-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 13px;
    text-decoration: none;
    border: 1px solid #eee;
    color: #444;
    transition: all 0.2s;
}

.social-btn.facebook {
    background: #0759c6;
    color: #fff;
    border: 1px solid #1877f2;
}

.social-btn.facebook:hover {
    background: #07489c;
    box-shadow: 0 2px 8px rgba(24, 119, 242, 0.35);
}

.social-btn.google:hover {
    background: #f3e8e8;
}

@media (max-width: 768px) {
    .row {
        flex-direction: column;
    }

    .brand,
    .form {
        flex: 0 0 100%;
        min-height: 220px;
    }

    .brand.active {
        min-height: 100vh;
    }

    .form {
        min-height: 480px;
    }

    .form-peice {
        min-height: 480px;
        padding: 30px 20px;
    }

    .form-peice.switched {
        transform: translateY(-120%);
    }
}
</style>
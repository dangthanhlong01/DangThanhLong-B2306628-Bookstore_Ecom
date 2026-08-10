import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('userData') || 'null'),
        token: localStorage.getItem('token') || null
    }),

    getters: {
        isLoggedIn: (state) => !!state.user?.id,
        fullName: (state) => state.user?.fullName || ''
    },

    actions: {
        setUser(userData, token) {
            this.user = userData
            this.token = token

            localStorage.setItem('userData', JSON.stringify(userData))
            localStorage.setItem('token', token)
        },

        logout() {
            this.user = null
            this.token = null

            localStorage.removeItem('userData')
            localStorage.removeItem('token')
        }
    }
})
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false
  },

  mutations: {
    LOGIN (state, userData) {
      state.user = userData.user
      state.token = userData.token
      state.isAuthenticated = true
      localStorage.setItem('token', userData.token)
    },

    REGISTER (state, userData) {
      state.user = userData.user
      state.token = userData.token
      state.isAuthenticated = true
      localStorage.setItem('token', userData.token)
    },

    LOGOUT (state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    }
  },

  actions: {
    async login ({ commit }, loginData) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const userData = await response.json()
      commit('LOGIN', userData)
      return userData
    },

    async register ({ commit }, registerData) {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      })

      if (!response.ok) {
        throw new Error('注册失败')
      }

      const userData = await response.json()
      commit('REGISTER', userData)
      return userData
    },

    logout ({ commit }) {
      commit('LOGOUT')
    }
  },

  getters: {
    isAuthenticated: state => state.isAuthenticated,
    currentUser: state => state.user,
    token: state => state.token
  }
})

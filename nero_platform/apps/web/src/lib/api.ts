import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001'

/**
 * Axios instance для API запросов
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

/**
 * Интерцептор для добавления токена авторизации
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Интерцептор для обработки ошибок
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Если получили 401 и это не повторный запрос
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Пытаемся обновить токен
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/v1/refresh`, {
            refreshToken,
          })

          // Backend возвращает в формате ApiResponse<T>: { success, data: { accessToken } }
          const { accessToken } = response.data.data
          
          // Сохраняем новый access token (refresh token остается прежним)
          localStorage.setItem('accessToken', accessToken)

          // Повторяем оригинальный запрос с новым токеном
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Если обновление токена не удалось, перенаправляем на логин
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * API клиент для работы с авторизацией
 */
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/v1/login', { email, password })
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/v1/logout')
    return response.data
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/v1/me')
    return response.data
  },
}

/**
 * API клиент для работы с пользователями
 */
export const usersApi = {
  getUsers: async (params?: { cursor?: string; limit?: number }) => {
    const response = await api.get('/users/v1', { params })
    return response.data
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/v1/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.put(`/users/v1/${id}`, data)
    return response.data
  },
}

/**
 * API клиент для работы с детьми
 */
export const childrenApi = {
  getChildren: async (params?: { cursor?: string; limit?: number }) => {
    const response = await api.get('/children/v1', { params })
    return response.data
  },

  getChild: async (id: string) => {
    const response = await api.get(`/children/v1/${id}`)
    return response.data
  },

  createChild: async (data: any) => {
    const response = await api.post('/children/v1', data)
    return response.data
  },

  updateChild: async (id: string, data: any) => {
    const response = await api.put(`/children/v1/${id}`, data)
    return response.data
  },
}

/**
 * API клиент для работы с диагностикой
 */
export const diagnosticsApi = {
  getSessions: async (params?: { childId?: string; status?: string; cursor?: string; limit?: number }) => {
    const response = await api.get('/diagnostics/v1/sessions', { params })
    return response.data
  },

  getSession: async (id: string) => {
    const response = await api.get(`/diagnostics/v1/sessions/${id}`)
    return response.data
  },

  createSession: async (data: any) => {
    const response = await api.post('/diagnostics/v1/sessions', data)
    return response.data
  },

  saveResponses: async (id: string, responses: any) => {
    const response = await api.post(`/diagnostics/v1/sessions/${id}/responses`, { responses })
    return response.data
  },

  completeSession: async (id: string) => {
    const response = await api.post(`/diagnostics/v1/sessions/${id}/complete`)
    return response.data
  },

  getResults: async (id: string) => {
    const response = await api.get(`/diagnostics/v1/sessions/${id}/results`)
    return response.data
  },

  getQuestionnaires: async () => {
    const response = await api.get('/diagnostics/v1/questionnaires')
    return response.data
  },

  getQuestionnaire: async (code: string) => {
    const response = await api.get(`/diagnostics/v1/questionnaires/${code}`)
    return response.data
  },
}


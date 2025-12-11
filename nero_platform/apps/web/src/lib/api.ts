import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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
  getUsers: async (params?: { cursor?: string; limit?: number; role?: string }) => {
    const response = await api.get('/users/v1', { params })
    return response.data
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/v1/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.patch(`/users/v1/${id}`, data)
    return response.data
  },

  createUser: async (data: {
    firstName: string
    lastName: string
    email: string
    role: string
    phone?: string
  }) => {
    const response = await api.post('/users/v1', data)
    return response.data
  },

  /**
   * Получить список пользователей с ролью parent
   */
  getParents: async () => {
    const response = await api.get('/users/v1', { params: { role: 'parent' } })
    return response.data
  },

  /**
   * Получить детей пользователя (для родителей и специалистов)
   */
  getUserChildren: async (userId: string) => {
    const response = await api.get(`/users/v1/${userId}/children`)
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
    const response = await api.patch(`/children/v1/${id}`, data)
    return response.data
  },

  /**
   * Добавить родителя/опекуна к ребенку
   */
  addParent: async (
    childId: string,
    data: {
      parentUserId: string
      relationship: 'mother' | 'father' | 'guardian' | 'other'
      legalGuardian?: boolean
    }
  ) => {
    const response = await api.post(`/children/v1/${childId}/parents`, data)
    return response.data
  },

  /**
   * Удалить связь родителя с ребенком
   */
  removeParent: async (childId: string, parentId: string) => {
    const response = await api.delete(`/children/v1/${childId}/parents/${parentId}`)
    return response.data
  },

  /**
   * Обновить информацию о связи родителя с ребенком
   */
  updateParent: async (
    childId: string,
    parentId: string,
    data: {
      relationship?: 'mother' | 'father' | 'guardian' | 'other'
      legalGuardian?: boolean
      guardianshipType?: string
    }
  ) => {
    const response = await api.patch(`/children/v1/${childId}/parents/${parentId}`, data)
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
    // Backend возвращает ApiResponse<{ ... } | Array<...>>
    // Здесь возвращаем весь объект ApiResponse, чтобы на уровне страницы
    // можно было использовать success/data и единый формат ошибок.
    return response.data
  },

  getQuestionnaire: async (code: string) => {
    const response = await api.get(`/diagnostics/v1/questionnaires/${code}`)
    return response.data
  },
}

/**
 * API клиент для работы с упражнениями
 */
export const exercisesApi = {
  getExercises: async (params?: {
    category?: string
    difficulty?: string
    ageMin?: number
    ageMax?: number
    status?: string
    cursor?: string
    limit?: number
  }) => {
    const response = await api.get('/exercises/v1', { params })
    return response.data
  },

  getExercise: async (id: string) => {
    const response = await api.get(`/exercises/v1/${id}`)
    return response.data
  },

  createExercise: async (data: any) => {
    const response = await api.post('/exercises/v1', data)
    return response.data
  },

  updateExercise: async (id: string, data: any) => {
    const response = await api.patch(`/exercises/v1/${id}`, data)
    return response.data
  },

  deleteExercise: async (id: string) => {
    const response = await api.delete(`/exercises/v1/${id}`)
    return response.data
  },

  publishExercise: async (id: string) => {
    const response = await api.post(`/exercises/v1/${id}/publish`)
    return response.data
  },

  unpublishExercise: async (id: string) => {
    const response = await api.post(`/exercises/v1/${id}/unpublish`)
    return response.data
  },

  getCategories: async () => {
    const response = await api.get('/exercises/v1/categories')
    return response.data
  },

  uploadMedia: async (id: string, file: File, mediaType: 'image' | 'video' | 'audio') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mediaType', mediaType)

    const response = await api.post(`/exercises/v1/${id}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

/**
 * API клиент для работы с шаблонами маршрутов
 */
export const templatesApi = {
  getTemplates: async (params?: {
    status?: string
    search?: string
    cursor?: string
    limit?: number
  }) => {
    const response = await api.get('/templates/v1', { params })
    return response.data
  },

  getTemplate: async (id: string) => {
    const response = await api.get(`/templates/v1/${id}`)
    return response.data
  },

  createTemplate: async (data: any) => {
    const response = await api.post('/templates/v1', data)
    return response.data
  },

  updateTemplate: async (id: string, data: any) => {
    const response = await api.put(`/templates/v1/${id}`, data)
    return response.data
  },

  deleteTemplate: async (id: string) => {
    const response = await api.delete(`/templates/v1/${id}`)
    return response.data
  },

  publishTemplate: async (id: string) => {
    const response = await api.post(`/templates/v1/${id}/publish`)
    return response.data
  },

  archiveTemplate: async (id: string) => {
    const response = await api.post(`/templates/v1/${id}/archive`)
    return response.data
  },

  cloneTemplate: async (id: string, title: string) => {
    const response = await api.post(`/templates/v1/${id}/clone`, { title })
    return response.data
  },

  getVersions: async (id: string) => {
    // TODO: Реализовать эндпоинт версий на бэкенде
    // Пока возвращаем пустой массив
    return { success: true, data: [] }
  },
}

/**
 * API клиент для работы с маршрутами
 */
export const routesApi = {
  getRoutes: async (params?: {
    childId?: string
    status?: string
    cursor?: string
    limit?: number
  }) => {
    const response = await api.get('/routes/v1', { params })
    return response.data
  },

  getRoute: async (id: string) => {
    const response = await api.get(`/routes/v1/${id}`)
    return response.data
  },

  createRoute: async (data: any) => {
    const response = await api.post('/routes/v1', data)
    return response.data
  },

  updateRoute: async (id: string, data: any) => {
    const response = await api.put(`/routes/v1/${id}`, data)
    return response.data
  },

  deleteRoute: async (id: string) => {
    const response = await api.delete(`/routes/v1/${id}`)
    return response.data
  },

  activateRoute: async (id: string) => {
    const response = await api.post(`/routes/v1/${id}/activate`)
    return response.data
  },

  completeRoute: async (id: string) => {
    const response = await api.post(`/routes/v1/${id}/complete`)
    return response.data
  },

  // Цели маршрута
  getGoals: async (routeId: string) => {
    const response = await api.get(`/routes/v1/${routeId}/goals`)
    return response.data
  },

  createGoal: async (routeId: string, data: any) => {
    const response = await api.post(`/routes/v1/${routeId}/goals`, data)
    return response.data
  },

  updateGoal: async (routeId: string, goalId: string, data: any) => {
    const response = await api.put(`/routes/v1/${routeId}/goals/${goalId}`, data)
    return response.data
  },

  deleteGoal: async (routeId: string, goalId: string) => {
    const response = await api.delete(`/routes/v1/${routeId}/goals/${goalId}`)
    return response.data
  },

  // Фазы маршрута
  getPhases: async (routeId: string) => {
    const response = await api.get(`/routes/v1/${routeId}/phases`)
    return response.data
  },

  createPhase: async (routeId: string, data: any) => {
    const response = await api.post(`/routes/v1/${routeId}/phases`, data)
    return response.data
  },

  updatePhase: async (routeId: string, phaseId: string, data: any) => {
    const response = await api.put(`/routes/v1/${routeId}/phases/${phaseId}`, data)
    return response.data
  },

  deletePhase: async (routeId: string, phaseId: string) => {
    const response = await api.delete(`/routes/v1/${routeId}/phases/${phaseId}`)
    return response.data
  },
}

/**
 * API клиент для работы с назначениями
 */
export const assignmentsApi = {
  getAssignments: async (params?: {
    childId?: string
    specialistId?: string
    status?: string
    startDate?: string
    endDate?: string
    cursor?: string
    limit?: number
  }) => {
    const response = await api.get('/assignments/v1', { params })
    return response.data
  },

  getAssignment: async (id: string) => {
    const response = await api.get(`/assignments/v1/${id}`)
    return response.data
  },

  createAssignment: async (data: any) => {
    const response = await api.post('/assignments/v1', data)
    return response.data
  },

  updateAssignment: async (id: string, data: any) => {
    const response = await api.put(`/assignments/v1/${id}`, data)
    return response.data
  },

  deleteAssignment: async (id: string) => {
    const response = await api.delete(`/assignments/v1/${id}`)
    return response.data
  },

  completeAssignment: async (id: string, data: { notes?: string; results?: any }) => {
    const response = await api.post(`/assignments/v1/${id}/complete`, data)
    return response.data
  },

  cancelAssignment: async (id: string, reason: string) => {
    const response = await api.post(`/assignments/v1/${id}/cancel`, { reason })
    return response.data
  },

  getCalendar: async (params: {
    specialistId?: string
    childId?: string
    startDate: string
    endDate: string
  }) => {
    const response = await api.get('/assignments/v1/calendar', { params })
    return response.data
  },

  getOverdue: async () => {
    const response = await api.get('/assignments/v1/overdue')
    return response.data
  },
}

/**
 * API клиент для работы с отчетами родителей
 */
export const reportsApi = {
  /**
   * Получить список отчетов
   */
  getReports: async (params?: {
    childId?: string
    assignmentId?: string
    status?: string
    reviewStatus?: string
    page?: number
    limit?: number
  }) => {
    const response = await api.get('/reports/v1', { params })
    return response.data
  },

  /**
   * Получить конкретный отчет по ID
   */
  getReport: async (id: string) => {
    const response = await api.get(`/reports/v1/${id}`)
    return response.data
  },

  /**
   * Создать новый отчет
   */
  createReport: async (data: {
    assignmentId: string
    status: 'completed' | 'partial' | 'failed'
    durationMinutes: number
    childMood: 'good' | 'neutral' | 'difficult'
    feedbackText: string
    media?: Array<{
      mediaId: string
      fileKey: string
      fileName: string
      fileType: string
      fileSize: number
    }>
  }) => {
    const response = await api.post('/reports/v1', data)
    return response.data
  },

  /**
   * Удалить отчет (только в течение 24ч после создания)
   */
  deleteReport: async (id: string) => {
    const response = await api.delete(`/reports/v1/${id}`)
    return response.data
  },

  /**
   * Проверить отчет (только специалисты)
   */
  reviewReport: async (id: string, data: {
    reviewStatus: 'approved' | 'needs_attention' | 'rejected'
    reviewComments?: string
    reviewScore?: number
  }) => {
    const response = await api.post(`/reports/v1/${id}/review`, data)
    return response.data
  },
}

/**
 * API клиент для работы с медиа-файлами отчетов
 */
export const mediaApi = {
  /**
   * Получить presigned URL для загрузки файла
   */
  generateUploadUrl: async (data: {
    fileName: string
    fileType: string
    fileSize: number
  }) => {
    const response = await api.post('/media/v1/upload', data)
    return response.data
  },

  /**
   * Подтвердить успешную загрузку файла
   */
  confirmUpload: async (mediaId: string, data: { fileKey: string; checksum?: string }) => {
    const response = await api.post(`/media/v1/${mediaId}/confirm`, data)
    return response.data
  },

  /**
   * Получить URL для скачивания файла
   */
  getDownloadUrl: async (mediaId: string) => {
    const response = await api.get(`/media/v1/${mediaId}/download`)
    return response.data
  },
}

/**
 * Analytics API
 * Week 2: Analytics Service endpoints
 */
export const analyticsApi = {
  /**
   * Получить статистику ребенка
   */
  getChildStats: async (childId: string, days: number = 30) => {
    const response = await api.get(`/analytics/v1/children/${childId}`, {
      params: { days },
    })
    return response.data
  },

  /**
   * Получить статистику специалиста
   */
  getSpecialistStats: async (specialistId: string, days: number = 30) => {
    const response = await api.get(`/analytics/v1/specialist/${specialistId}`, {
      params: { days },
    })
    return response.data
  },

  /**
   * Сгенерировать PDF отчет для ребенка
   */
  generateChildReportPDF: async (childId: string, days: number = 30) => {
    const response = await api.get(`/analytics/v1/pdf/child/${childId}`, {
      params: { days },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Сгенерировать PDF отчет для специалиста
   */
  generateSpecialistReportPDF: async (specialistId: string, days: number = 30) => {
    const response = await api.get(`/analytics/v1/pdf/specialist/${specialistId}`, {
      params: { days },
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Получить детальную статистику назначений
   */
  getAssignmentsStats: async (childId: string, params?: { startDate?: string; endDate?: string; exerciseCategory?: string }) => {
    const response = await api.get(`/analytics/v1/children/${childId}/assignments-stats`, { params })
    return response.data
  },

  /**
   * Получить прогресс по целям
   */
  getGoalsProgress: async (childId: string) => {
    const response = await api.get(`/analytics/v1/children/${childId}/goals-progress`)
    return response.data
  },

  /**
   * Получить временную шкалу событий
   */
  getTimeline: async (childId: string, params?: { dateFrom?: string; dateTo?: string; eventTypes?: string[] }) => {
    const response = await api.get(`/analytics/v1/children/${childId}/timeline`, { params })
    return response.data
  },

  /**
   * Получить прогресс по маршруту
   */
  getRouteProgress: async (routeId: string) => {
    const response = await api.get(`/analytics/v1/routes/${routeId}/progress`)
    return response.data
  },

  /**
   * Инвалидировать кэш (admin only)
   */
  invalidateCache: async (type: 'child' | 'specialist', id: string) => {
    const response = await api.post('/analytics/v1/cache/invalidate', { type, id })
    return response.data
  },
}

/**
 * Notifications API
 * Week 3: User notifications for in-app UI
 */
export const notificationsApi = {
  /**
   * Получить уведомления пользователя
   */
  getUserNotifications: async (params?: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
    const response = await api.get('/notifications/v1/user', { params })
    return response.data
  },

  /**
   * Получить количество непрочитанных уведомлений
   */
  getUnreadCount: async () => {
    const response = await api.get('/notifications/v1/user/unread-count')
    return response.data
  },

  /**
   * Отметить уведомление как прочитанное
   */
  markAsRead: async (notificationId: string) => {
    const response = await api.post(`/notifications/v1/user/${notificationId}/read`)
    return response.data
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  markAllAsRead: async () => {
    const response = await api.post('/notifications/v1/user/read-all')
    return response.data
  },

  /**
   * Удалить уведомление
   */
  deleteNotification: async (notificationId: string) => {
    const response = await api.delete(`/notifications/v1/user/${notificationId}`)
    return response.data
  },

  /**
   * Получить настройки уведомлений пользователя
   */
  getPreferences: async () => {
    const response = await api.get('/notifications/v1/preferences')
    return response.data
  },

  /**
   * Обновить настройки уведомлений пользователя
   */
  updatePreferences: async (data: {
    preferences?: {
      emailEnabled?: boolean
      inAppEnabled?: boolean
      assignmentReminders?: boolean
      reportUpdates?: boolean
      routeChanges?: boolean
    }
    quietHours?: {
      enabled?: boolean
      startTime?: string
      endTime?: string
    }
  }) => {
    const response = await api.patch('/notifications/v1/preferences', data)
    return response.data
  },
}

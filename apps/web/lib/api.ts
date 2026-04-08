import axios from 'axios'
import type {
  UserResponse,
  SearchEmailsRequest,
  SearchEmailsResponse,
  BulkActionRequest,
  BulkActionResponse,
  EmailPreviewResponse,
} from '@mailsweep/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Auth endpoints
export const authApi = {
  getMe: async (): Promise<UserResponse> => {
    const { data } = await api.get<UserResponse>('/auth/me')
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  getGoogleAuthUrl: (): string => {
    return `${API_URL}/auth/google`
  },
}

// Gmail endpoints
export const gmailApi = {
  searchEmails: async (params: SearchEmailsRequest): Promise<SearchEmailsResponse> => {
    const { data } = await api.post<SearchEmailsResponse>('/gmail/search', params)
    return data
  },

  trashEmails: async (ids: string[]): Promise<BulkActionResponse> => {
    const { data } = await api.post<BulkActionResponse>('/gmail/trash', { ids })
    return data
  },

  deleteEmails: async (ids: string[]): Promise<BulkActionResponse> => {
    const { data } = await api.post<BulkActionResponse>('/gmail/delete', { ids })
    return data
  },

  getEmailPreview: async (id: string): Promise<EmailPreviewResponse> => {
    const { data } = await api.get<EmailPreviewResponse>(`/gmail/preview/${id}`)
    return data
  },
}

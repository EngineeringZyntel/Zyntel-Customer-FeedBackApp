/**
 * API Client
 * 
 * Centralized API client for making requests to Next.js API routes
 * Handles authentication, error handling, and response parsing
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

// Set auth token
export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('token', token)
}

// Remove auth token
export function removeToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('token')
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }
  
  return data
}

// Auth API
export const authApi = {
  register: async (email: string, password: string) => {
    const data = await apiRequest<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) setToken(data.token)
    return data
  },
  
  login: async (email: string, password: string) => {
    const data = await apiRequest<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.token) setToken(data.token)
    return data
  },
  
  logout: () => {
    removeToken()
  },
}

// Forms API
export const formsApi = {
  create: async (formData: any) => {
    return apiRequest('/forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    })
  },
  
  getByUser: async (userId: number) => {
    return apiRequest(`/forms?userId=${userId}`)
  },
  
  getByCode: async (formCode: string) => {
    return apiRequest(`/forms/${formCode}`)
  },
  
  delete: async (formId: number) => {
    return apiRequest(`/forms/delete/${formId}`, {
      method: 'DELETE',
    })
  },
}

// Responses API
export const responsesApi = {
  submit: async (formCode: string, responseData: any) => {
    return apiRequest('/responses', {
      method: 'POST',
      body: JSON.stringify({ formCode, responseData }),
    })
  },
  
  getByForm: async (formId: number) => {
    return apiRequest(`/responses/${formId}`)
  },
}

// Analytics API
export const analyticsApi = {
  getFormAnalytics: async (formId: number) => {
    return apiRequest(`/analytics/${formId}`)
  },
}

// QR Code API
export const qrCodeApi = {
  generate: async (formCode: string, formUrl: string, logoData?: string) => {
    return apiRequest('/qrcode', {
      method: 'POST',
      body: JSON.stringify({ formCode, formUrl, logoData }),
    })
  },
}


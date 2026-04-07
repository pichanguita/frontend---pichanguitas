import { API_CONFIG } from '../../config/api.config'

const BASE = API_CONFIG.BASE_URL

export const requestPasswordReset = async (email) => {
  const response = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  return response.json()
}

export const verifyResetToken = async (token) => {
  const response = await fetch(`${BASE}/api/auth/verify-reset-token/${token}`)
  return response.json()
}

export const resetPassword = async (token, password) => {
  const response = await fetch(`${BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  })
  return response.json()
}

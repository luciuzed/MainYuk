import { apiUrl } from '../config/api'

const SESSION_TOKEN_KEY = 'mainyuk_session'

export const getSessionToken = () => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY)
  return typeof token === 'string' ? token.trim() : ''
}

export const setSessionToken = (token) => {
  if (!token) return
  localStorage.setItem(SESSION_TOKEN_KEY, String(token))
}

export const clearSessionToken = () => {
  localStorage.removeItem(SESSION_TOKEN_KEY)
}

export const withSessionAuth = (headers = {}) => {
  const token = getSessionToken()
  if (!token) return { ...headers }
  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}

export const fetchServerSession = async () => {
  const token = getSessionToken()
  if (!token) {
    throw new Error('Session token is missing')
  }

  const response = await fetch(apiUrl('/session'), {
    method: 'GET',
    headers: withSessionAuth(),
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearSessionToken()
    }
    throw new Error('Session is not valid')
  }

  const data = await response.json()
  return data?.user || null
}

export const logoutSession = async () => {
  const token = getSessionToken()

  try {
    await fetch(apiUrl('/logout'), {
      method: 'POST',
      headers: withSessionAuth(
        token
          ? {}
          : { 'Content-Type': 'application/json' }
      ),
    })
  } catch {
    // Best effort logout; local token should still be cleared.
  } finally {
    clearSessionToken()
  }
}

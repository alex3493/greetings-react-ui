import {
  AxiosDefaults,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import {
  createSessionCookies,
  getRefreshToken,
  getToken,
  REFRESH_TOKEN_API_ROUTE,
  removeSessionCookies
} from '@/utils'
import { api } from './api'
import { paths } from '@/router'

type FailedRequestQueue = {
  onSuccess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

let isRefreshing = false
let failedRequestQueue: FailedRequestQueue[] = []

type SetAuthorizationHeaderParams = {
  request: AxiosDefaults | AxiosRequestConfig
  token: string
}

export function setAuthorizationHeader(params: SetAuthorizationHeaderParams) {
  const { request, token } = params

  ;(request.headers as Record<string, unknown>)['Authorization'] =
    `Bearer ${token}`
}

function removeAuthorizationHeader(
  request: AxiosDefaults | AxiosRequestConfig
) {
  delete (request.headers as Record<string, unknown>)['Authorization']
}

function handleRefreshToken(refreshToken: string) {
  isRefreshing = true

  // API requires that there is no Authentication header in token-refresh request.
  removeAuthorizationHeader(api.defaults)
  removeSessionCookies()

  api
    .post(REFRESH_TOKEN_API_ROUTE, { refresh_token: refreshToken })
    .then((response) => {
      const { token } = response.data

      createSessionCookies({ token, refreshToken: response.data.refresh_token })
      setAuthorizationHeader({ request: api.defaults, token })

      failedRequestQueue.forEach((request) => request.onSuccess(token))
      failedRequestQueue = []
    })
    .catch((error) => {
      failedRequestQueue.forEach((request) => request.onFailure(error))
      failedRequestQueue = []

      removeSessionCookies()
    })
    .finally(() => {
      isRefreshing = false
    })
}

function onRequest(config: AxiosRequestConfig) {
  const token = getToken()

  if (token) {
    setAuthorizationHeader({ request: config, token })
  }

  return config as InternalAxiosRequestConfig
}

function onRequestError(error: AxiosError): Promise<AxiosError> {
  return Promise.reject(error)
}

function onResponse(response: AxiosResponse): AxiosResponse {
  return response
}

type ErrorCode = {
  code: string
}

function onResponseError(
  error: AxiosError<ErrorCode>
): Promise<AxiosError | AxiosResponse> {
  if (error?.response?.status === 401) {
    if (error.config?.url?.includes('/login_check')) {
      // 401 during login, no need to attempt token refresh.
      return Promise.reject(error)
    }
    // Check that error is not related to token refresh attempt.
    if (!error.config?.url?.includes('/token/refresh')) {
      // Start token refresh.
      const originalConfig = error.config as AxiosRequestConfig
      const refreshToken = getRefreshToken()

      if (!isRefreshing) {
        handleRefreshToken(refreshToken)
      }

      return new Promise((resolve, reject) => {
        failedRequestQueue.push({
          onSuccess: (token: string) => {
            setAuthorizationHeader({ request: originalConfig, token })
            resolve(api(originalConfig))
          },
          onFailure: (error: AxiosError) => {
            reject(error)
          }
        })
      })
    } else {
      // Token refresh failure.
      removeSessionCookies()
      window.location.href = paths.LOGIN_PATH
    }
  }

  // Non-401 error.
  return Promise.reject(error)
}

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
  axiosInstance.interceptors.request.use(onRequest, onRequestError)
  axiosInstance.interceptors.response.use(onResponse, onResponseError)

  return axiosInstance
}

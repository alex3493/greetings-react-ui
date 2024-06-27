import { ReactNode, useEffect, useState } from 'react'
import {
  ApiValidationContext,
  ApiValidationData,
  ApiValidationError
} from '@/contexts'
import { api } from '@/services'
import { AxiosError, AxiosResponse } from 'axios'

type Props = {
  children: ReactNode
}

function ApiValidationProvider(props: Props) {
  const { children } = props

  const [errorData, setErrorData] = useState<ApiValidationError[]>([])

  const hasErrors = (context: string, property?: string | undefined) => {
    return getErrors(context, property) !== undefined
  }

  const getErrors = (
    context: string,
    property?: string | undefined
  ): string[] | undefined => {
    const error = errorData.find(
      (e) => e.context === context && e.property === property
    )

    if (error && error.errors.length > 0) {
      return error.errors
    }

    return undefined
  }

  const removeAllErrors = () => {
    setErrorData([])
  }

  const removeErrors = (context: string, property?: string | undefined) => {
    let errors

    if (property) {
      errors = errorData.filter(
        (e) => e.context !== context || e.property !== property
      )
    } else {
      errors = errorData.filter((e) => e.context !== context)
    }

    setErrorData(errors)
  }

  const mergeErrors = (data: ApiValidationData): ApiValidationError[] => {
    const existingErrors = [...errorData]
    data.errors.forEach((error) => {
      const index = existingErrors.findIndex(
        (e) => e.context === error.context && e.property === error.property
      )
      if (index >= 0) {
        existingErrors.splice(index, 1, error)
      } else {
        existingErrors.push(error)
      }
    })

    return existingErrors
  }

  const onResponse = (response: AxiosResponse) => {
    return response
  }

  const onResponseError = (error: AxiosError<ApiValidationData>) => {
    const data = error?.response?.data

    if (data?.errors) {
      console.log('Validation errors:', data?.errors)
      // We have Api validation error.
      setErrorData(mergeErrors(data))
    } else {
      console.log(
        'Response error:',
        data?.message || 'Server error',
        data?.code
      )
      // Regular error response, e.g. 401 during login.
      // For regular error responses there is no need to merge errors:
      // we just set "General" context error.
      setErrorData([
        {
          context: 'General',
          property: undefined,
          errors: [data?.message || 'Server error']
        }
      ])
    }

    // Rethrow error after we update validation context data.
    throw error
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      onResponse,
      onResponseError
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  })

  return (
    <ApiValidationContext.Provider
      value={{
        errors: errorData,
        hasErrors: hasErrors,
        getErrors: getErrors,
        removeErrors: removeErrors,
        removeAllErrors: removeAllErrors
      }}
    >
      {children}
    </ApiValidationContext.Provider>
  )
}

export default ApiValidationProvider

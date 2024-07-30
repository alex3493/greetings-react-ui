import { ReactNode, useEffect, useReducer, useState } from 'react'
import {
  ApiValidationContext,
  ApiValidationData,
  ApiValidationError
} from '@/contexts'
import { api } from '@/services'
import { AxiosError, AxiosResponse } from 'axios'
import GreetingModel from '@/models/GreetingModel'

type Props = {
  children: ReactNode
}

function ApiValidationProvider(props: Props) {
  const { children } = props

  // const [errorData, setErrorData] = useState<ApiValidationError[]>([])

  const [errorData, dispatch] = useReducer(errorDataReducer, [])

  type errorsUpdateAction = {
    type: string
    errors?: ApiValidationError[] | undefined
    context?: string
    property?: string
  }

  function errorDataReducer(
    errorData: ApiValidationError[],
    action: errorsUpdateAction
  ) {
    console.log(
      'Error data reducer :: Dispatched action: ' + action.type,
      action.errors,
      action.context,
      action.property
    )

    let updatedErrors = [...errorData]

    switch (action.type) {
      case 'remove-all':
        return []
      case 'remove':
        if (action.property) {
          updatedErrors = errorData.filter(
            (e) =>
              e.context !== action.context || e.property !== action.property
          )
        } else {
          updatedErrors = errorData.filter((e) => e.context !== action.context)
        }

        return updatedErrors
      case 'merge':
        action.errors?.forEach((error) => {
          const index = updatedErrors.findIndex(
            (e) => e.context === error.context && e.property === error.property
          )
          if (index >= 0) {
            updatedErrors.splice(index, 1, error)
          } else {
            updatedErrors.push(error)
          }
        })

        return updatedErrors
    }

    return errorData
  }

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
    dispatch({
      type: 'remove-all'
    })
  }

  const removeErrors = (context: string, property?: string | undefined) => {
    dispatch({
      type: 'remove',
      context,
      property
    })
  }

  const mergeErrors = (data: ApiValidationData) => {
    dispatch({
      type: 'merge',
      errors: data.errors
    })
  }

  const onResponse = (response: AxiosResponse) => {
    return response
  }

  const onResponseError = (error: AxiosError<ApiValidationData>) => {
    const data = error?.response?.data

    if (data?.errors) {
      console.log('Validation errors:', data?.errors)
      // We have Api validation error.
      mergeErrors(data)
    } else {
      console.log(
        'Response error:',
        data?.message || 'Server error',
        data?.code
      )
      // Regular error response, e.g. 401 during login.
      // For regular error responses there is no need to merge errors:
      // we just set "General" context error.
      dispatch({
        type: 'merge',
        context: 'General',
        errors: [
          { errors: [data?.message || 'Server error'], context: 'General' }
        ]
      })
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

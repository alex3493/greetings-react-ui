import { ReactNode, useEffect, useReducer } from 'react'
import { BusyEndpoint, BusyIndicatorContext } from '@/contexts'
import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios'
import { api } from '@/services'

type Props = {
  children: ReactNode
}

function BusyIndicatorProvider(props: Props) {
  const { children } = props

  const [busyEndpoints, dispatch] = useReducer(busyEndpointsReducer, [])

  type BusyEndpointData = {
    url: string
    type: 'sending' | 'receiving'
  }

  type BusyIndicatorUpdateAction = {
    type: 'increment' | 'decrement' | 'reset'
    endpoint: BusyEndpointData
  }

  function busyEndpointsReducer(
    busyEndpoints: BusyEndpoint[],
    action: BusyIndicatorUpdateAction
  ) {
    const updated = [...busyEndpoints]
    let index: number

    const findBusyEndpointIndex = (url: string, type: string) =>
      busyEndpoints.findIndex((e) => e.url === url && e.type === type)

    console.log('Dispatched action :: busy indicator', action)

    switch (action.type) {
      case 'reset':
        return []
      case 'increment':
        index = findBusyEndpointIndex(action.endpoint.url, action.endpoint.type)
        if (index >= 0) {
          updated[index] = {
            ...busyEndpoints[index],
            processingCount: busyEndpoints[index].processingCount + 1
          }
        } else {
          updated.push({ ...action.endpoint, processingCount: 1 })
        }
        // console.log("***** After increment action", updated);
        return updated
      case 'decrement':
        index = findBusyEndpointIndex(action.endpoint.url, action.endpoint.type)
        if (index >= 0) {
          updated[index] = {
            ...busyEndpoints[index],
            processingCount:
              busyEndpoints[index].processingCount > 0
                ? busyEndpoints[index].processingCount - 1
                : 0
          }
          if (updated[index].processingCount === 0) {
            updated.splice(index, 1)
          }
        } else {
          // Should never be the case!
          console.log(
            '***** ***** Busy endpoint not found',
            action.endpoint.url,
            action.endpoint.type,
            busyEndpoints
          )
        }
        // console.log("***** After decrement action", updated);
        return updated
    }
  }

  useEffect(() => {
    const onRequest = (
      config: InternalAxiosRequestConfig<AxiosRequestConfig>
    ): InternalAxiosRequestConfig<AxiosRequestConfig> => {
      // console.log(
      //   'BusyIndicator onRequest',
      //   config.method,
      //   config.url,
      //   // JSON.stringify(config, null, 2),
      // );

      if (config.url && config.method) {
        dispatch({
          type: 'increment',
          endpoint: {
            url: config.url,
            type:
              config.method.toUpperCase() === 'GET' ? 'receiving' : 'sending'
          }
        })
      }

      return config
    }

    const onResponse = (response: AxiosResponse): AxiosResponse => {
      // console.log(
      //   'BusyIndicator onResponse',
      //   response.config.method,
      //   response.config.url
      //   // JSON.stringify(response, null, 2),
      // )

      if (response.config.url && response.config.method) {
        dispatch({
          type: 'decrement',
          endpoint: {
            url: response.config.url,
            type:
              response.config.method.toUpperCase() === 'GET'
                ? 'receiving'
                : 'sending'
          }
        })
      }

      return response
    }

    const onRequestError = (error: AxiosError): Promise<AxiosError> => {
      console.log(
        'BusyIndicator onRequestError',
        error.config?.method,
        error.config?.url
        // JSON.stringify(error, null, 2),
      )
      return Promise.reject(error)
    }

    const onResponseError = (error: AxiosError): Promise<AxiosError> => {
      // console.log(
      //   'BusyIndicator onResponseError',
      //   error.config?.method,
      //   error.config?.url,
      //   // JSON.stringify(error, null, 2),
      // );

      // TODO: For 401 error we may force reset busy indicator data.

      if (error.config?.url && error.config?.method) {
        dispatch({
          type: 'decrement',
          endpoint: {
            url: error.config.url,
            type:
              error.config.method.toUpperCase() === 'GET'
                ? 'receiving'
                : 'sending'
          }
        })
      } else {
        // Panic (?)
        dispatch({
          type: 'reset',
          // Fake endpoint - reset action doesn't care about the endpoint.
          // TODO: make it better.
          endpoint: {
            type: 'receiving',
            url: ''
          }
        })
      }

      return Promise.reject(error)
    }

    const requestInterceptor = api.interceptors.request.use(
      onRequest,
      onRequestError
    )

    const responseInterceptor = api.interceptors.response.use(
      onResponse,
      onResponseError
    )

    return () => {
      api.interceptors.request.eject(requestInterceptor)
      api.interceptors.response.eject(responseInterceptor)
    }
  }, [busyEndpoints])

  const loadingCount = () => {
    return busyEndpoints.filter((e) => e.type === 'receiving').length
  }

  const sendingCount = () => {
    return busyEndpoints.filter((e) => e.type === 'sending').length
  }

  const busyCount = () => {
    return loadingCount() + sendingCount()
  }

  const isBusy = (activity?: 'all' | 'sending' | 'receiving') => {
    if (!activity || activity === 'all') {
      return loadingCount() + sendingCount() > 0
    } else if (activity === 'sending') {
      return sendingCount() > 0
    } else {
      return loadingCount() > 0
    }
  }

  const isEndpointBusy = (
    endpoint: string,
    activity?: 'all' | 'sending' | 'receiving'
  ) => {
    if (!activity || activity === 'all') {
      return busyEndpoints.some((e) => e.url.split('?')[0] === endpoint)
    }
    return busyEndpoints.some(
      (e) => e.url.split('?')[0] === endpoint && e.type === activity
    )
  }

  return (
    <BusyIndicatorContext.Provider
      value={{
        busyEndpoints,
        loadingCount,
        sendingCount,
        isEndpointBusy,
        isBusy,
        busyCount
      }}
    >
      {children}
    </BusyIndicatorContext.Provider>
  )
}

export default BusyIndicatorProvider

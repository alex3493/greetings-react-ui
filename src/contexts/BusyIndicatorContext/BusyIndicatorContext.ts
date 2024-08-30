import { createContext } from 'react'

export type BusyEndpoint = {
  url: string
  type: 'sending' | 'receiving'
  processingCount: number
}

export type BusyIndicatorData = {
  busyEndpoints: BusyEndpoint[]
  loadingCount: () => number
  sendingCount: () => number
  isEndpointBusy: (
    endpoint: string,
    activity?: 'all' | 'sending' | 'receiving'
  ) => boolean
  isBusy: (activity?: 'all' | 'sending' | 'receiving') => boolean
  busyCount: () => number
}

const BusyIndicatorContext = createContext({} as BusyIndicatorData)

export default BusyIndicatorContext

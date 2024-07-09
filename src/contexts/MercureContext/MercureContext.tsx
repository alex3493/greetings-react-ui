import { createContext } from 'react'

export type MercureContextData = {
  discoverMercureHub: (hubUrl: string) => Promise<void>
  addSubscription: (
    topic: string,
    callback: (event: MessageEvent) => void
  ) => Promise<{ topic: string; eventSource: EventSource }>
  removeSubscription: (topic: string) => void
  addEventHandler: (
    topic: string,
    callback: (event: MessageEvent) => void
  ) => Promise<{ topic: string; eventSource: EventSource }>
  removeEventHandler: (
    topic: string,
    callback: (event: MessageEvent) => void
  ) => void
}

const MercureContext = createContext({} as MercureContextData)

export default MercureContext

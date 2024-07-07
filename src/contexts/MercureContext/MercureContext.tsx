import { createContext } from 'react'

export type MercureContextData = {
  discoverMercureHub: (hubUrl: string) => Promise<void>
  addSubscription: (
    topic: string,
    id: string,
    callback: (event: MessageEvent) => void
  ) => void
  removeSubscription: (topic: string, id: string) => void
}

const MercureContext = createContext({} as MercureContextData)

export default MercureContext

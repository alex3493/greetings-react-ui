import { MercureContext } from '@/contexts'
import { ReactNode, useRef } from 'react'
import { api } from '@/services'
import { EventSourcePolyfill } from 'event-source-polyfill'

type Props = {
  children: ReactNode
}

export type Subscription = {
  topic: string
  id: string
  eventSource: EventSourcePolyfill
  callback: (event: MessageEvent) => void
}

function MercureProvider(props: Props) {
  const { children } = props

  const mercureUrl = useRef<string>('')
  const mercureAuthToken = useRef<string>('')

  const subscriptions = useRef<Subscription[]>([])

  const isHubReady = () => !!mercureUrl.current && !!mercureAuthToken.current

  async function discoverMercureHub(hubUrl: string) {
    if (!isHubReady()) {
      console.log('Initialize Mercure hub', hubUrl)
      try {
        const token = await authorizeMercureHub()
        mercureUrl.current = hubUrl
        mercureAuthToken.current = token
        // console.log('Initialized mercure hub', hubUrl, token)
        // return Promise.resolve()
      } catch (error) {
        console.log('Error authorizing mercure hub', error)
        // return Promise.reject(error)
      }
    }
  }

  function authorizeMercureHub() {
    return api
      .get('/mercure-auth')
      .then(({ data }) => {
        console.log('Service response - auth', data)
        return Promise.resolve(data.token)
      })
      .catch(async (error) => {
        return Promise.reject(
          new Error('Error authorizing mercure updates ' + error.message)
        )
      })
  }

  async function addSubscription(
    topic: string,
    id: string,
    callback: (event: MessageEvent) => void
  ) {
    if (!isHubReady()) {
      return Promise.reject(
        new Error('Mercure Hub must be authorized before adding subscription')
      )
    }

    console.log('Adding subscription', topic, id)
    const existing = subscriptions.current.find(
      (s: Subscription) => s.topic === topic && s.id === id
    )
    if (!existing) {
      // Only add subscription if not yet registered.
      const encoded = encodeURIComponent(topic)
      try {
        const eventSource = new EventSourcePolyfill(
          `${mercureUrl.current}?topic=${encoded}`,
          {
            withCredentials: false, // TODO: Check this option.
            headers: {
              Authorization: `Bearer ${mercureAuthToken.current}`
            }
          }
        )

        eventSource?.addEventListener('message', callback as never)

        subscriptions.current.push({
          topic,
          id,
          eventSource,
          callback
        })

        return Promise.resolve({
          topic,
          id,
          eventSource
        })
      } catch (error) {
        return Promise.reject(error)
      }
    }

    return Promise.resolve(existing)
  }

  function removeSubscription(topic: string, id: string) {
    console.log('Removing subscription', topic)
    const existingIndex = subscriptions.current.findIndex(
      (s: Subscription) => s.topic === topic && s.id === id
    )
    if (existingIndex >= 0) {
      subscriptions.current[existingIndex].eventSource.removeEventListener(
        'message',
        subscriptions.current[existingIndex].callback as never
      )
      subscriptions.current[existingIndex].eventSource?.close()
      subscriptions.current.splice(existingIndex, 1)
    }
  }

  return (
    <MercureContext.Provider
      value={{
        discoverMercureHub,
        addSubscription,
        removeSubscription
      }}
    >
      {children}
    </MercureContext.Provider>
  )
}

export default MercureProvider

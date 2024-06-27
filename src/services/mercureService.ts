import { api } from '@/services/api'
import { EventSourcePolyfill } from 'event-source-polyfill'

type MercureHandlerCallback = {
  topic: string
  callback: (event: MessageEvent) => void
}

// TODO: check this type...
// type Subscription = {
//   topic: string
//   eventSource: EventSourcePolyfill
// }

export default class MercureService {
  static mercure: MercureService | undefined = undefined
  mercureAuthToken: string | null = null
  mercureUrl: string | null = null
  // TODO: Check correct type for subscriptions array.
  subscriptions: any[] = [] // Subscription[] = []

  static shared(): MercureService {
    if (MercureService.mercure === undefined) {
      MercureService.mercure = new MercureService()
    }

    return MercureService.mercure
  }

  isHubReady(): boolean {
    return !!this.mercureAuthToken && !!this.mercureUrl
  }

  setHubUrl(url: string) {
    this.mercureUrl = url
  }

  setToken(token: string) {
    this.mercureAuthToken = token
  }

  async discoverMercureHub(hubUrl: string): Promise<void> {
    if (!this.isHubReady()) {
      console.log('Initialize Mercure hub', hubUrl)
      try {
        const token = await this.authorizeMercureHub()
        this.setHubUrl(hubUrl)
        this.setToken(token)
        // console.log('Initialized mercure hub', hubUrl, token)
      } catch (error) {
        console.log('Error authorizing mercure hub', error)
      }
    }
  }

  authorizeMercureHub() {
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

  async addSubscription(topic: string) {
    console.log('Adding subscription', topic)
    const existing = this.subscriptions.find((s) => s.topic === topic)
    if (!existing) {
      // Only add subscription if not yet registered.
      const encoded = encodeURIComponent(topic)
      try {
        const eventSource = new EventSourcePolyfill(
          `${this.mercureUrl}?topic=${encoded}`,
          {
            withCredentials: false, // TODO: Check this option.
            headers: {
              Authorization: `Bearer ${this.mercureAuthToken}`
            }
          }
        )
        this.subscriptions.push({
          topic,
          eventSource
        })

        return Promise.resolve({
          topic,
          eventSource
        })
      } catch (error) {
        console.error('Error creating Event source', error)
      }
    }

    return Promise.resolve(existing)
  }

  removeSubscription(topic: string) {
    console.log('Removing subscription', topic)
    const existingIndex = this.subscriptions.findIndex((s) => s.topic === topic)
    if (existingIndex >= 0) {
      this.removeEventHandler(this.subscriptions[existingIndex])
      this.subscriptions[existingIndex].eventSource?.close()
      this.subscriptions.splice(existingIndex, 1)
    }
  }

  async addEventHandler(handler: MercureHandlerCallback) {
    console.log('addEventHandler action', handler)
    let subscription = this.subscriptions.find((s) => s.topic === handler.topic)
    if (!subscription) {
      subscription = await this.addSubscription(handler.topic)
    }
    subscription?.eventSource.addEventListener('message', handler.callback)
  }

  removeEventHandler(handler: MercureHandlerCallback) {
    console.log('removeEventHandler action', handler)
    const subscription = this.subscriptions.find(
      (s) => s.topic === handler.topic
    )
    subscription?.eventSource.removeEventListener('message', handler.callback)
  }
}

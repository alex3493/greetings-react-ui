import { ReactNode, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { AuthContext, SignInCredentials } from '@/contexts'
import { paths } from '@/router'
import { api, setAuthorizationHeader } from '@/services'
import {
  createSessionCookies,
  getToken,
  LOGIN_API_ROUTE,
  removeSessionCookies,
  USER_ME_API_ROUTE
} from '@/utils'
import UserModel from '@/models/UserModel'
import PusherService from '@/services/pusherService'

import toast, { Toaster } from 'react-hot-toast'
import { AdminGreetingDTO } from '@/models/types'

const pusher = PusherService.shared()

type Props = {
  children: ReactNode
}

type PusherStates = {
  previous: string
  current: string
}

function AuthProvider(props: Props) {
  const { children } = props

  const [user, setUser] = useState<UserModel>()
  const [loadingUserData, setLoadingUserData] = useState(true)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const token = getToken()
  const isAuthenticated = Boolean(token)

  async function signIn(params: SignInCredentials) {
    const { email, password } = params

    try {
      const response = await api.post(LOGIN_API_ROUTE, { email, password })
      const token = response.data.token
      const refreshToken = response.data.refresh_token

      createSessionCookies({ token, refreshToken })
      setAuthorizationHeader({ request: api.defaults, token })

      await getUserData()
    } catch (error) {
      return error as AxiosError
    }
  }

  async function getUserData() {
    setLoadingUserData(true)

    try {
      const response = await api.get(USER_ME_API_ROUTE)

      if (response?.data) {
        const { user } = response.data
        setUser(new UserModel(user))
      }
    } catch (error) {
      console.log('Error getting user data', error)
    } finally {
      setLoadingUserData(false)
    }
  }

  function signOut() {
    removeSessionCookies()
    setUser(undefined)
    setLoadingUserData(false)
    navigate(paths.LOGIN_PATH)
  }

  function updateUser(user: UserModel) {
    setUser(new UserModel(user))
  }

  useEffect(() => {
    function unsubscribePusher() {
      pusher.unsubscribe('private-greeting')
    }

    if (!token) {
      removeSessionCookies()
      setUser(undefined)
      setLoadingUserData(false)
      unsubscribePusher()
    }
  }, [navigate, pathname, token])

  const notify = (author: string, text: string) =>
    toast(
      <div>
        <b>{author}</b>
        <p>{text}</p>
      </div>,
      {
        duration: 10000
      }
    )

  useEffect(() => {
    const token = getToken()

    function subscribePusher() {
      // If we do not have a user, bail out.
      if (!user?.id) return
      try {
        const channel = pusher.subscribe('private-greeting')
        channel.unbind('message_sent')
        channel.bind('message_sent', (data: AdminGreetingDTO) => {
          console.log('Pusher message', data, data.author_id, user.id)
          notify(data.author_name, data.greeting)
        })

        // channel.bind_global((event: string, data: PusherEvent) => {
        //   console.log(
        //     `DEBUG :: Pusher event "${event}" was triggered with data ${JSON.stringify(
        //       data
        //     )}`
        //   )
        // })

        pusher.connection.bind('state_change', (states: PusherStates) => {
          console.log(
            `DEBUG :: Pusher connection state changed from ${states.previous} to ${states.current}`
          )
        })
      } catch (e) {
        console.log(e)
      }
    }

    if (token) {
      setAuthorizationHeader({ request: api.defaults, token })
      subscribePusher()
      if (!user?.id) {
        getUserData().catch((error) => {
          console.log('Error loading user data', error)
        })
      }
    }

    return () => {
      pusher.unsubscribe('message_sent')
    }
  }, [user?.id])

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loadingUserData,
        signIn,
        signOut,
        updateUser
      }}
    >
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff'
          }
        }}
      />
    </AuthContext.Provider>
  )
}

export default AuthProvider

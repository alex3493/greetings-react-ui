import { AxiosError } from 'axios'
import { createContext } from 'react'
import UserModel from '@/models/UserModel'

export type SignInCredentials = {
  email: string
  password: string
}

export type AuthContextData = {
  user?: UserModel
  isAuthenticated: boolean
  loadingUserData: boolean
  signIn: (credentials: SignInCredentials) => Promise<void | AxiosError>
  signOut: () => void
  updateUser: (user: UserModel) => void
}

const AuthContext = createContext({} as AuthContextData)

export default AuthContext

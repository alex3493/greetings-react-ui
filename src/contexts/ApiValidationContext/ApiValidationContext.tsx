import { createContext } from 'react'

export type ApiValidationError = {
  property?: string | undefined
  context: string
  errors: string[]
}

export type ApiValidationData = {
  code?: number
  message?: string
  errors: ApiValidationError[]
  hasErrors: (context: string, property?: string | undefined) => boolean
  getErrors: (
    context: string,
    property?: string | undefined
  ) => string[] | undefined
  removeErrors: (context: string, property?: string | undefined) => void
  removeAllErrors: () => void
}

const ApiValidationContext = createContext({} as ApiValidationData)

export default ApiValidationContext

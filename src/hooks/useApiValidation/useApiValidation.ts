import { useContext } from 'react'
import { ApiValidationContext } from '@/contexts'

function useApiValidation() {
  return useContext(ApiValidationContext)
}

export default useApiValidation

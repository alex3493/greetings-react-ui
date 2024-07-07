import { useContext } from 'react'
import { MercureContext } from '@/contexts'

function useMercureUpdates() {
  return useContext(MercureContext)
}

export default useMercureUpdates

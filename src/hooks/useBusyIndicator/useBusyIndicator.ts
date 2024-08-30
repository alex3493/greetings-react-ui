import { useContext } from 'react'
import { BusyIndicatorContext } from '@/contexts'

function useBusyIndicator() {
  return useContext(BusyIndicatorContext)
}

export default useBusyIndicator

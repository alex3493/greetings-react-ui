import { ReactNode } from 'react'
import { useSession } from '@/hooks'
import { validateUserPermissions } from '@/utils'
import ModelBase from '@/models/ModelBase'

type Props = {
  children: ReactNode
  permissions?: string[]
  roles?: string[]
  entity?: ModelBase
}

function CanAccess(props: Props) {
  const { children, permissions, roles, entity } = props

  const { isAuthenticated, user } = useSession()
  const { hasAllPermissions, hasAllRoles } = validateUserPermissions({
    user,
    permissions,
    roles,
    entity
  })

  if (!isAuthenticated || !hasAllPermissions || !hasAllRoles) {
    return null
  }

  return <>{children}</>
}

export default CanAccess

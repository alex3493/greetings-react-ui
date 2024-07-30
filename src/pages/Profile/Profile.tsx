import UpdateProfile from '@/components/Profile/UpdateProfile'
import ChangePassword from '@/components/Profile/ChangePassword'
import RegisteredDevices from '@/components/Profile/RegisteredDevices'
import { useApiValidation } from '@/hooks'
import { useEffect } from 'react'

function Profile() {
  const { removeErrors } = useApiValidation()

  useEffect(() => {
    removeErrors('User')
  }, [removeErrors])

  return (
    <>
      <UpdateProfile />
      <ChangePassword />
      <RegisteredDevices />
    </>
  )
}

export default Profile

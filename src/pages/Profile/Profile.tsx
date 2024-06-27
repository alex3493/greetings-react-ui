import UpdateProfile from '@/components/Profile/UpdateProfile'
import ChangePassword from '@/components/Profile/ChangePassword'
import RegisteredDevices from '@/components/Profile/RegisteredDevices'

function Profile() {
  return (
    <>
      <UpdateProfile />
      <ChangePassword />
      <RegisteredDevices />
    </>
  )
}

export default Profile

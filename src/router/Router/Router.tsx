import { Route, Routes } from 'react-router-dom'
import { useRoutePaths } from '@/hooks'
import { Greetings, Login, Profile, Register } from '@/pages'
import { PrivateRoute } from '../PrivateRoute'
import { PublicRoute } from '../PublicRoute'

function Router() {
  const { LOGIN_PATH, PROFILE_PATH, REGISTER_PATH, ROOT_PATH } = useRoutePaths()

  return (
    <Routes>
      <Route
        path={ROOT_PATH}
        element={
          <PrivateRoute
            permissions={['greetings.list']}
            redirectTo={LOGIN_PATH}
          >
            <Greetings />
          </PrivateRoute>
        }
      />

      <Route
        path={LOGIN_PATH}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path={REGISTER_PATH}
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path={PROFILE_PATH}
        element={
          <PrivateRoute redirectTo={LOGIN_PATH}>
            <Profile />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<h1>404</h1>} />
    </Routes>
  )
}

export default Router

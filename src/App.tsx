import { BrowserRouter } from 'react-router-dom'
import { NavBar } from './components'
import { AuthProvider } from './providers'
import { Router } from './router'
import Container from 'react-bootstrap/Container'
import { ApiValidationProvider } from '@/providers/ApiValidationProvider'
import { BusyIndicatorProvider } from '@/providers'

function App() {
  return (
    <BrowserRouter>
      <BusyIndicatorProvider>
        <ApiValidationProvider>
          <AuthProvider>
            <NavBar />
            <Container>
              <Router />
            </Container>
          </AuthProvider>
        </ApiValidationProvider>
      </BusyIndicatorProvider>
    </BrowserRouter>
  )
}

export default App

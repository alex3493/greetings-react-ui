import { BrowserRouter } from 'react-router-dom'
import { NavBar } from './components'
import { AuthProvider } from './providers'
import { Router } from './router'
import Container from 'react-bootstrap/Container'
import { ApiValidationProvider } from '@/providers/ApiValidationProvider'

function App() {
  return (
    <BrowserRouter>
      <ApiValidationProvider>
        <AuthProvider>
          <NavBar />
          <Container>
            <Router />
          </Container>
        </AuthProvider>
      </ApiValidationProvider>
    </BrowserRouter>
  )
}

export default App

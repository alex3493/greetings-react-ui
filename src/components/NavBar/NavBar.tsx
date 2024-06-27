import { useApiValidation, useRoutePaths, useSession } from '@/hooks'
import { Link } from 'react-router-dom'
import { CanAccess } from '../CanAccess'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { ADMIN_GREETING_API_ROUTE } from '@/utils'
import { AdminGreeting } from '@/components/AdminGreeting'
import { useState } from 'react'
import { api } from '@/services'

function NavBar() {
  const { isAuthenticated, user, signOut } = useSession()
  const { PROFILE_PATH, ROOT_PATH } = useRoutePaths()

  const [showAdminNotification, setShowAdminNotification] =
    useState<boolean>(false)

  const { removeErrors } = useApiValidation()

  const handleClose = () => {
    setShowAdminNotification(false)
    removeErrors('AdminGreetings')
  }

  const submitAdminNotification = async (greeting: string) => {
    api
      .post(ADMIN_GREETING_API_ROUTE, {
        greeting
      })
      .then(() => {
        handleClose()
      })
      .catch((error) => console.log('Error sending admin greeting', error))
  }

  return (
    <>
      <Navbar expand="lg" className="bg-body-tertiary">
        <Container>
          <Navbar.Brand as={Link} to={ROOT_PATH}>
            Greetings
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {isAuthenticated && (
                <NavDropdown title={user?.display_name} id="basic-nav-dropdown">
                  <CanAccess permissions={['adminGreeting.send']}>
                    <NavDropdown.Item
                      href="#"
                      onClick={() => setShowAdminNotification(true)}
                    >
                      Admin Greeting
                    </NavDropdown.Item>
                  </CanAccess>
                  <NavDropdown.Item as={Link} to={PROFILE_PATH}>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={signOut}>Log out</NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <AdminGreeting
        show={showAdminNotification}
        handleClose={handleClose}
        submit={(greeting) => submitAdminNotification(greeting)}
      />
    </>
  )
}

export default NavBar

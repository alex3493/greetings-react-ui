import React, { useEffect, useState } from 'react'
import { useRoutePaths } from '@/hooks'
import { Button, Card, Form, Spinner } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import { Link, useNavigate } from 'react-router-dom'
import { REGISTER_API_ROUTE } from '@/utils'
import { api } from '@/services'
import ValidatedControl from '@/components/ValidatedControl'

function initialFormValues() {
  return {
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: ''
  }
}

function Register() {
  const [values, setValues] = useState(initialFormValues)
  const [registerRequestStatus, setRegisterRequestStatus] = useState('success')
  const { LOGIN_PATH } = useRoutePaths()
  const navigate = useNavigate()

  function handleChange(value: string, name: string) {
    setValues({
      ...values,
      [name]: value
    })
  }

  async function handleSubmit() {
    setRegisterRequestStatus('loading')

    try {
      await api.post(REGISTER_API_ROUTE, values)
      navigate(LOGIN_PATH)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    } finally {
      setRegisterRequestStatus('success')
    }
  }

  useEffect(() => {
    // Clean the function to prevent memory leak.
    return () => setRegisterRequestStatus('success')
  }, [])

  return (
    <Container className="p-3 my-5 d-flex flex-column w-50">
      <Card>
        <Card.Header>Sing Up</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email address</Form.Label>
              <ValidatedControl
                name="email"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <ValidatedControl
                name="password"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <ValidatedControl
                name="password_confirmation"
                validationName="passwordConfirmation"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>First Name</Form.Label>
              <ValidatedControl
                name="first_name"
                validationName="firstName"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="text"
                  placeholder="First name"
                  autoComplete="given-name"
                />
              </ValidatedControl>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Last name</Form.Label>
              <ValidatedControl
                name="last_name"
                validationName="lastName"
                context="User"
                onInput={(value, name) => handleChange(value, name)}
              >
                <Form.Control
                  type="text"
                  placeholder="Last name"
                  autoComplete="family-name"
                />
              </ValidatedControl>
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={registerRequestStatus === 'loading'}
            >
              {registerRequestStatus === 'loading' && (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              )}{' '}
              Submit
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer>
          Already have an account? <Link to={LOGIN_PATH}>Sign In</Link>
        </Card.Footer>
      </Card>
    </Container>
  )
}

export default Register

import React, { useEffect, useState } from 'react'
import { useApiValidation, useRoutePaths, useSession } from '@/hooks'
import { Alert, Button, Card, Form, Spinner } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import { Link } from 'react-router-dom'

function initialFormValues() {
  return {
    email: '',
    password: ''
  }
}

function Login() {
  const [values, setValues] = useState(initialFormValues)
  const [loginRequestStatus, setLoginRequestStatus] = useState('success')
  const { signIn } = useSession()
  const { hasErrors, getErrors, removeErrors } = useApiValidation()
  const { REGISTER_PATH } = useRoutePaths()

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target

    setValues({
      ...values,
      [name]: value
    })

    removeErrors('General')
  }

  async function handleSubmit() {
    setLoginRequestStatus('loading')

    try {
      await signIn(values)
    } catch (error) {
      /**
       * an error handler can be added here
       */
    } finally {
      setLoginRequestStatus('success')
    }
  }

  useEffect(() => {
    // clean the function to prevent memory leak
    return () => setLoginRequestStatus('success')
  }, [])

  return (
    <Container className="p-3 my-5 d-flex flex-column w-50">
      <Card>
        <Card.Header>Sing In</Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                autoComplete="email"
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Password"
                autoComplete="current-password"
                onChange={handleChange}
              />
            </Form.Group>
            {hasErrors('General', undefined) && (
              <Alert variant="danger">{getErrors('General', undefined)}</Alert>
            )}
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loginRequestStatus === 'loading'}
            >
              {loginRequestStatus === 'loading' && (
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
          Do not have an account? <Link to={REGISTER_PATH}>Sign Up</Link>
        </Card.Footer>
      </Card>
    </Container>
  )
}

export default Login

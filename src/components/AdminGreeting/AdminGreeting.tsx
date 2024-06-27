import React, { useEffect, useState } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import ValidatedControl from '@/components/ValidatedControl'

type Props = {
  show: boolean
  disableSave: boolean
  handleClose: () => void
  submit: (greeting: string) => void
}

function AdminGreeting(props: Props) {
  const { show, disableSave, handleClose, submit } = props

  const [greeting, setGreeting] = useState<string>('')

  useEffect(() => {
    setGreeting('')
    document.getElementById('greeting')?.focus()
  }, [show])

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Admin Greeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="greeting">
            <Form.Label>Text</Form.Label>
            <ValidatedControl
              context="AdminGreetings"
              name="greeting"
              onInput={(value) => setGreeting(value)}
            >
              <Form.Control
                type="text"
                placeholder="Greeting"
                value={greeting}
              />
            </ValidatedControl>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => submit(greeting)}
            disabled={disableSave}
          >
            {disableSave && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}{' '}
            Send
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default AdminGreeting

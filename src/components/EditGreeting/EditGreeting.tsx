import GreetingModel from '@/models/GreetingModel'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  ButtonGroup,
  Form,
  Modal,
  Spinner
} from 'react-bootstrap'
import { GreetingUpdateDTO } from '@/models/types'
import { GREETING_READ_API_ROUTE } from '@/utils'
import { api } from '@/services'
import { AxiosHeaders } from 'axios'
import ValidatedControl from '@/components/ValidatedControl'
import { useMercureUpdates } from '@/hooks'

type Props = {
  greeting: GreetingModel | undefined
  show: boolean
  disableSave: boolean
  handleClose: () => void
  submit: (greeting: GreetingUpdateDTO) => void
}

const freshFormData = {
  id: '',
  text: '',
  variant: 'secondary'
}

function EditGreeting(props: Props) {
  const { greeting, show, disableSave, handleClose, submit } = props

  const [formData, setFormData] = useState<GreetingUpdateDTO>(freshFormData)

  const [updateAlert, setUpdateAlert] = useState<boolean>(false)
  const [deleteAlert, setDeleteAlert] = useState<boolean>(false)

  const [readRequestStatus, setReadRequestStatus] = useState('success')

  const [updatedGreeting, setUpdatedGreeting] = useState<
    GreetingModel | undefined
  >(undefined)

  const { discoverMercureHub, addSubscription, removeSubscription } =
    useMercureUpdates()

  useEffect(() => {
    const loadGreeting = async (id: string | number) => {
      const url = GREETING_READ_API_ROUTE.replace('{greetingId}', id.toString())

      setReadRequestStatus('loading')
      try {
        const response = await api.get(url)
        const headers = response.headers as AxiosHeaders

        const link = headers.get(
          'Link',
          /<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/
        )
        if (link && link.length === 2) {
          const hubUrl = link[1]

          await discoverMercureHub(hubUrl)

          addSubscription(
            'https://symfony.test/greeting/' + id,
            'item_updates',
            (event: MessageEvent) => {
              const data = JSON.parse(event.data)
              console.log('***** Mercure Event', data)

              // Do not show updated alert if already saving the greeting.
              if (data.reason === 'update' && !disableSave) {
                setUpdateAlert(true)
                setUpdatedGreeting(data.greeting)
              }

              if (data.reason === 'delete') {
                setDeleteAlert(true)
              }
            }
          )
        } else {
          console.log('ERROR :: Discovery link missing or invalid')
        }

        const { data } = await api.get(url)
        setFormData(new GreetingModel(data.greeting).toFormData())
      } catch (error) {
        console.log('Error loading greeting ' + id, error)
      } finally {
        setReadRequestStatus('success')
      }
    }

    setUpdateAlert(false)
    setDeleteAlert(false)

    if (greeting !== undefined) {
      // If we have the greeting to edit, load it from API.
      console.log('Edit greeting', greeting)

      loadGreeting(greeting.id).catch((error) =>
        console.log('Error loading greeting ' + greeting.id, error)
      )
    } else {
      // Set new greeting data.
      const defaultGreeting = {
        id: '',
        text: '',
        variant: 'secondary'
      }
      setFormData(defaultGreeting)
    }

    return () => {
      if (greeting) {
        removeSubscription(
          'https://symfony.test/greeting/' + greeting.id,
          'item_updates'
        )
      }
    }
  }, [
    addSubscription,
    disableSave,
    discoverMercureHub,
    greeting,
    removeSubscription,
    show
  ])

  const getButtonActiveVariant = (variant: string) => {
    return variant === formData.variant ? variant : 'outline-' + variant
  }

  const formTitle = !greeting?.id ? 'Create Greeting' : 'Edit Greeting'
  const disableControls = readRequestStatus === 'loading' || disableSave

  function handleChange(value: string, name: string) {
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const acceptUpdate = () => {
    console.log('Accepting update', updatedGreeting)
    if (updatedGreeting) {
      setFormData(new GreetingModel(updatedGreeting).toFormData())
      setUpdateAlert(false)
    }
  }

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {formTitle}{' '}
            {readRequestStatus === 'loading' && (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {updateAlert && (
            <Alert variant="warning">
              This greeting was updated by another user.
            </Alert>
          )}
          {deleteAlert && (
            <Alert variant="danger">This greeting was deleted.</Alert>
          )}
          <Form.Group className="mb-3" controlId="text">
            <Form.Label>Text</Form.Label>
            <ValidatedControl
              name="text"
              context="Greeting"
              onInput={(value, name) => handleChange(value, name)}
            >
              <Form.Control
                type="text"
                placeholder={
                  readRequestStatus === 'loading'
                    ? 'Loading...'
                    : 'Greeting text'
                }
                autoFocus
                value={formData.text}
                disabled={deleteAlert || updateAlert || disableControls}
              />
            </ValidatedControl>
          </Form.Group>
          <Form.Group className="mb-3">
            <ButtonGroup aria-label="Greeting variant">
              <Button
                variant={getButtonActiveVariant('primary')}
                value="primary"
                active={formData.variant === 'primary'}
                disabled={deleteAlert || updateAlert || disableControls}
                onClick={() => setFormData({ ...formData, variant: 'primary' })}
              >
                Primary
              </Button>
              <Button
                variant={getButtonActiveVariant('secondary')}
                value="secondary"
                active={formData.variant === 'secondary'}
                disabled={deleteAlert || updateAlert || disableControls}
                onClick={() =>
                  setFormData({ ...formData, variant: 'secondary' })
                }
              >
                Secondary
              </Button>
              <Button
                variant={getButtonActiveVariant('success')}
                value="success"
                active={formData.variant === 'success'}
                disabled={deleteAlert || updateAlert || disableControls}
                onClick={() => setFormData({ ...formData, variant: 'success' })}
              >
                Success
              </Button>
              <Button
                variant={getButtonActiveVariant('warning')}
                value="warning"
                active={formData.variant === 'warning'}
                disabled={deleteAlert || updateAlert || disableControls}
                onClick={() => setFormData({ ...formData, variant: 'warning' })}
              >
                Warning
              </Button>
            </ButtonGroup>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          {!deleteAlert &&
            (updateAlert ? (
              <Button variant="info" onClick={() => acceptUpdate()}>
                Accept Update
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={disableControls}
                onClick={() => submit(formData)}
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
                Save Changes
              </Button>
            ))}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default EditGreeting

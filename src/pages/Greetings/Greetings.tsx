import { AxiosError, AxiosHeaders } from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/services'
import {
  GREETING_CREATE_API_ROUTE,
  GREETING_DELETE_API_ROUTE,
  GREETING_UPDATE_API_ROUTE,
  GREETINGS_LIST_API_ROUTE
} from '@/utils'
import GreetingModel from '@/models/GreetingModel'
import { Button, Table } from 'react-bootstrap'
import { CanAccess, EditGreeting } from '@/components'
import { GreetingUpdateDTO } from '@/models/types'
import { useApiValidation } from '@/hooks'
import MercureService from '@/services/mercureService'

const mercureService = MercureService.shared()

function Greetings() {
  const [greetings, setGreetings] = useState<GreetingModel[]>([])

  const [greetingToEdit, setGreetingToEdit] = useState<
    GreetingModel | undefined
  >(undefined)

  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  const [dataLoaded, setDataLoaded] = useState<boolean>(false)

  const [savingGreeting, setSavingGreeting] = useState<boolean>(false)

  const hubUrl = useRef<string>('')

  const { removeAllErrors } = useApiValidation()

  const insertGreeting = useCallback(
    (greeting: GreetingModel): void => {
      if (!greetings.find((g) => g.id === greeting.id)) {
        const updated = [...greetings]
        updated.unshift(new GreetingModel(greeting))
        setGreetings(updated.slice(0, 10))
      }
    },
    [greetings]
  )

  const updateGreeting = useCallback(
    (greeting: GreetingModel): void => {
      const index = greetings.findIndex((g) => g.id === greeting.id)
      if (index >= 0) {
        const updated = [...greetings]
        updated.splice(index, 1, new GreetingModel(greeting))
        setGreetings(updated)
      }
    },
    [greetings]
  )
  const removeGreeting = useCallback(
    (id: string | number): void => {
      const index = greetings.findIndex((g) => g.id === id)
      if (index >= 0) {
        const updated = [...greetings]
        updated.splice(index, 1)
        setGreetings(updated)
      }
    },
    [greetings]
  )

  useEffect(() => {
    async function subscribeToListUpdates(hubUrl: string) {
      await mercureService.discoverMercureHub(hubUrl)
      await mercureService.addEventHandler({
        topic: 'https://symfony.test/greetings',
        callback: (event: MessageEvent) => {
          const data = JSON.parse(event.data)
          console.log('***** Mercure Event', data)

          if (data.reason === 'create') {
            console.log('greeting/addGreeting', data.greeting)
            insertGreeting(new GreetingModel(data.greeting))
          }
          if (data.reason === 'update') {
            console.log('greeting/updateGreeting', data.greeting)
            updateGreeting(data.greeting)
          }
          if (data.reason === 'delete') {
            console.log('greeting/deleteGreeting', data.greeting.id)
            removeGreeting(data.greeting.id)
          }
        }
      })
    }

    function unsubscribeFromListUpdates() {
      mercureService.removeSubscription('https://symfony.test/greetings')
    }

    if (hubUrl.current) {
      subscribeToListUpdates(hubUrl.current).catch((error) =>
        console.log('Error discovering Mercure hub', error)
      )
    }

    return () => {
      unsubscribeFromListUpdates()
    }
  }, [hubUrl, insertGreeting, removeGreeting, updateGreeting])

  useEffect(() => {
    async function loadGreetings() {
      setDataLoaded(false)

      try {
        const response = await api.get(GREETINGS_LIST_API_ROUTE)
        const data = (response?.data?.greetings || []).map(
          (g: GreetingModel) => new GreetingModel(g)
        )
        setGreetings(data)

        const headers = response.headers as AxiosHeaders

        const link = headers.get(
          'Link',
          /<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/
        )
        if (link && link.length === 2) {
          hubUrl.current = link[1]
        } else {
          console.log('ERROR :: Discovery link missing or invalid')
        }
      } catch (error) {
        return error as AxiosError
      } finally {
        setDataLoaded(true)
      }
    }

    loadGreetings().catch((error) => {
      console.log('Error loading greeting list', error)
    })

    return () => {
      setDataLoaded(false)
    }
  }, [])

  const createGreeting = () => {
    setShowEditModal(true)
  }

  const editGreeting = (greeting: GreetingModel) => {
    setGreetingToEdit(greeting)
    setShowEditModal(true)
  }

  const saveGreeting = async (data: GreetingUpdateDTO) => {
    console.log('Saving greeting', data)

    setSavingGreeting(true)

    if (!data.id) {
      // New greeting.
      api
        .post(GREETING_CREATE_API_ROUTE, data)
        .then((response) => {
          console.log('Create greeting API response', response)
          onEditGreetingClose()
          insertGreeting(response.data.greeting)
        })
        .catch((error) => console.log('Error updating greeting', error))
        .finally(() => setSavingGreeting(false))
    } else {
      // Existing greeting.
      const url = GREETING_UPDATE_API_ROUTE.replace(
        '{greetingId}',
        data.id.toString()
      )
      api
        .patch(url, data)
        .then((response) => {
          console.log('Update greeting API response', response)
          onEditGreetingClose()
          updateGreeting(response.data.greeting)
        })
        .catch((error) => console.log('Error updating greeting', error))
        .finally(() => setSavingGreeting(false))
    }
  }

  const deleteGreeting = async (greeting: GreetingModel) => {
    console.log('Deleting greeting', greeting)
    const url = GREETING_DELETE_API_ROUTE.replace(
      '{greetingId}',
      greeting.id.toString()
    )
    api
      .delete(url)
      .then(() => {
        removeGreeting(greeting.id)
        // TODO: reload greetings it order to get previous items (if any).
      })
      .catch((error) => console.log('Error deleting greeting', error))
  }

  const onEditGreetingClose = () => {
    setGreetingToEdit(undefined)
    setShowEditModal(false)
    removeAllErrors()
  }

  return (
    <div>
      <h1>Greetings</h1>

      <Table>
        <thead>
          <tr>
            <th>Created</th>
            <th>From</th>
            <th>Text</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {greetings?.length > 0 ? (
            greetings.map((greeting) => (
              <tr
                key={greeting.id}
                className={'table-' + greeting.variant.name}
              >
                <td>{greeting.getCreatedAt()}</td>
                <td>{greeting.author.display_name}</td>
                <td>{greeting.text}</td>
                <td>
                  {greeting.updated_at && (
                    <>
                      {greeting.getUpdatedAt()}
                      {/* Only show user's name here if it's distinct from greeting author */}
                      {greeting.updated_by.id !== greeting.author.id && (
                        <>
                          <br />
                          {greeting.updated_by.display_name}
                        </>
                      )}
                    </>
                  )}
                </td>
                <td>
                  <CanAccess
                    permissions={['greeting.update']}
                    entity={greeting}
                  >
                    <Button
                      className="mx-1"
                      onClick={() => editGreeting(greeting)}
                    >
                      Edit
                    </Button>
                  </CanAccess>
                  <CanAccess
                    permissions={['greeting.delete']}
                    entity={greeting}
                  >
                    <Button
                      className="mx-1"
                      onClick={() => deleteGreeting(greeting)}
                      variant="danger"
                    >
                      Delete
                    </Button>
                  </CanAccess>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5}>
                {dataLoaded ? 'Empty greeting list' : 'Loading...'}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <Button onClick={() => createGreeting()} className="mb-4">
        New Greeting
      </Button>
      <EditGreeting
        greeting={greetingToEdit}
        show={showEditModal}
        handleClose={onEditGreetingClose}
        submit={saveGreeting}
        disableSave={savingGreeting}
      />
    </div>
  )
}

export default Greetings

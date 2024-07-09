import { AxiosError, AxiosHeaders } from 'axios'
import { useCallback, useEffect, useReducer, useState } from 'react'
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
import { useApiValidation, useMercureUpdates } from '@/hooks'

function Greetings() {
  const [greetings, dispatch] = useReducer(greetingsReducer, [])

  const [greetingToEdit, setGreetingToEdit] = useState<
    GreetingModel | undefined
  >(undefined)

  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  const [dataLoaded, setDataLoaded] = useState<boolean>(false)

  const [savingGreeting, setSavingGreeting] = useState<boolean>(false)

  const {
    discoverMercureHub,
    addSubscription,
    removeSubscription
    // addEventHandler,
    // removeEventHandler
  } = useMercureUpdates()

  const { removeAllErrors } = useApiValidation()

  type GreetingUpdateAction = {
    reason: string
    payload: GreetingModel[]
  }

  function greetingsReducer(
    greetings: GreetingModel[],
    action: GreetingUpdateAction
  ) {
    console.log('Dispatched action: ' + action.reason, [...action.payload])

    if (action.reason === 'init') {
      // Payload is an array, so we use it as is.
      return action.payload
    }

    // Payload should be a single-element array at this point,
    // get the greeting entity as action subject.
    const greeting = action.payload.pop()
    if (!greeting) {
      return greetings
    }

    // Get greeting to update index (if any).
    const existingIndex = greetings.findIndex((g) => g.id === greeting.id)

    switch (action.reason) {
      case 'create': {
        if (existingIndex === -1) {
          // Only act if greeting doesn't already exist in list.
          const updated = [...greetings]
          updated.unshift(new GreetingModel(greeting))
          return updated.slice(0, 10)
        }
        return greetings
      }
      case 'update': {
        if (existingIndex >= 0) {
          // Only act if greeting exists in list.
          const updated = [...greetings]
          updated.splice(existingIndex, 1, new GreetingModel(greeting))
          return updated
        }
        return greetings
      }
      case 'delete': {
        if (existingIndex >= 0) {
          // Only act if greeting exists in list.
          const updated = [...greetings]
          updated.splice(existingIndex, 1)
          return updated
        }
        return greetings
      }
      default: {
        throw Error('Unknown action reason')
      }
    }
  }

  const subscriptionCallback = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data)
    console.log('***** Mercure Event in list update', data)

    dispatch({
      reason: data.reason,
      payload: [data.greeting]
    })
  }, [])

  useEffect(() => {
    async function loadGreetings() {
      setDataLoaded(false)

      try {
        const response = await api.get(GREETINGS_LIST_API_ROUTE)
        const data = (response?.data?.greetings || []).map(
          (g: GreetingModel) => new GreetingModel(g)
        )
        dispatch({
          reason: 'init',
          payload: data
        })

        const headers = response.headers as AxiosHeaders

        const link = headers.get(
          'Link',
          /<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/
        )

        if (link && link.length === 2) {
          console.log('Discover Mercure Hub', link[1])

          await discoverMercureHub(link[1])
          await addSubscription(
            'https://symfony.test/greetings',
            subscriptionCallback
          )
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
      removeSubscription('https://symfony.test/greetings')
    }
  }, [
    addSubscription,
    discoverMercureHub,
    removeSubscription,
    subscriptionCallback
  ])

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
          dispatch({
            reason: 'create',
            payload: [response.data.greeting]
          })
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
          dispatch({
            reason: 'update',
            payload: [response.data.greeting]
          })
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
        dispatch({
          reason: 'delete',
          payload: [greeting]
        })
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
    <>
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
            greetings.map((greeting: GreetingModel) => (
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
    </>
  )
}

export default Greetings

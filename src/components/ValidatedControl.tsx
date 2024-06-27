import React, { ReactElement, ReactNode } from 'react'
import { useApiValidation } from '@/hooks'
import { Form } from 'react-bootstrap'

type Props = {
  children: ReactNode
  name: string
  validationName?: string
  context: string
  onInput: (value: string, name: string) => void
}

function ValidatedControl(props: Props) {
  const { children, name, validationName, context, onInput } = props
  const { hasErrors, getErrors, removeErrors } = useApiValidation()
  // If validationName is not provided we fall back to name.
  // Only required if property name in request is different from validation response property name,
  // e.g. "current_password" / "currentPassword".
  const validationNameProp = validationName || name

  const childrenArray = React.Children.toArray(children)
  let control
  if (childrenArray.length !== 1) {
    console.log('ERROR :: Only single child is supported.')
    control = <></>
  } else {
    control = React.cloneElement(childrenArray[0] as ReactElement, {
      name: name,
      isInvalid: hasErrors(context, validationNameProp),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        removeErrors(context, validationNameProp)
        onInput(e.target.value, e.target.name)
      }
    })
  }
  // const control = React.Children.map(children, (child) => {
  //   if (child) {
  //     return React.cloneElement(child as ReactElement, {
  //       name: name,
  //       isInvalid: hasErrors(context, validationNameProp),
  //       onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
  //         removeErrors(context, validationNameProp)
  //         onInput(e.target.value, e.target.name)
  //       }
  //     })
  //   }
  //   return undefined
  // })

  return (
    <>
      {control}
      {getErrors(context, validationNameProp)?.map((error, index) => (
        <Form.Control.Feedback type="invalid" key={index}>
          {error}
        </Form.Control.Feedback>
      ))}
    </>
  )
}

export default ValidatedControl

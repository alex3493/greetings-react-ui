import ModelBase from '@/models/ModelBase'
import {
  GreetingAuthor,
  GreetingUpdateDTO,
  GreetingVariant
} from '@/models/types'

export default class GreetingModel extends ModelBase {
  text: string
  variant: GreetingVariant
  author: GreetingAuthor
  updated_by: GreetingAuthor

  constructor(greeting: GreetingModel) {
    super(greeting)

    this.text = greeting.text || ''
    this.variant = greeting.variant

    this.author = greeting.author
    this.updated_by = greeting.updated_by
  }

  toFormData(): GreetingUpdateDTO {
    return {
      id: this.id,
      text: this.text,
      variant: this.variant.name
    }
  }
}

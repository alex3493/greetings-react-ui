export default class ModelBase {
  id: string | number

  created_at: string
  updated_at?: string | undefined

  constructor(model: ModelBase) {
    this.id = model.id || ''
    this.created_at = model.created_at
    this.updated_at = model.updated_at || undefined
  }

  getCreatedAt() {
    const date = new Date(this.created_at)
    return date.toLocaleString()
  }

  getUpdatedAt() {
    if (!this.updated_at) return ''
    const date = new Date(this.updated_at)
    return date.toLocaleString()
  }

  isValidId(): boolean {
    return !!this.id
  }
}

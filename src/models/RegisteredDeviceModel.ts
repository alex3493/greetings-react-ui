import ModelBase from '@/models/ModelBase'

export default class RegisteredDeviceModel extends ModelBase {
  name: string
  last_used_at?: string | undefined

  constructor(device: RegisteredDeviceModel) {
    super(device)

    this.name = device.name || ''
    this.last_used_at = device.last_used_at || undefined
  }

  getLastUsedAt() {
    if (!this.last_used_at) return ''
    const date = new Date(this.last_used_at)
    return date.toLocaleString()
  }
}

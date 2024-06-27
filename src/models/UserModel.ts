import ModelBase from '@/models/ModelBase'
import RegisteredDeviceModel from '@/models/RegisteredDeviceModel'

export default class UserModel extends ModelBase {
  email: string
  first_name?: string | undefined
  last_name?: string | undefined
  display_name: string | undefined
  roles: string[]
  role: string | undefined

  auth_tokens: RegisteredDeviceModel[]

  constructor(user: UserModel) {
    super(user)

    this.email = user.email
    this.first_name = user.first_name || undefined
    this.last_name = user.last_name || undefined
    this.display_name = user.display_name || undefined
    this.roles = user.roles || []
    this.role = user.role || undefined
    this.auth_tokens = (user.auth_tokens || []).map(
      (d) => new RegisteredDeviceModel(d)
    )
  }
}

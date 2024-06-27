const ROOT_PATH = '/'
const LOGIN_PATH = '/login'
const REGISTER_PATH = '/register'
const PROFILE_PATH = '/profile'
const GREETINGS_PATH = '/greetings'
const USER_PATH = '/users/:id'

const paths = {
  ROOT_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  PROFILE_PATH,
  GREETINGS_PATH,
  USER_PATH
} as const

export default paths

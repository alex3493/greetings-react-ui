# Greetings React UI

### *This project is based on (Copyright 2021) Eder Sampaio reactjs-auth-boilerplate.*

-----

This is front-end React JS application for testing Symfony API [project](https://github.com/alex3493/greetings-api)

This application uses web-sockets to listen to **Pusher** events set from API. You have to
provide your own Pusher account data in configuration (see step 4 in installation).

## Menu structure

### Greetings (home page)

This view lists 10 latest greetings registered in API database.

User can create a new greeting, edit and delete his own greetings. If you are logged in as admin
you can edit and delete any greeting.

This application requires user login. You can create one or more users in API console (See [API project documentation](https://github.com/alex3493/greetings-api/blob/main/Readme.md))
You can also register a new user in UI following "register" link in login form. Note, that UI registration
always creates regular users (ROLE_USER). The only way to create an admin user is to run `php bin/console app:add-user` command in API docker container.

### User name

Dropdown menu with the following items:

- Admin Greeting (only available to admin users).
- Profile: allows update user first / last names and password. Also, if current user has logged in from a mobile app before, this list of his registered mobile devices
  is also displayed. (See [API project documentation](https://github.com/alex3493/greetings-api/blob/main/Readme.md) on how to create user
  mobile app logins in Swagger Docs). Then user can log out from single device or log out from all devices (sign out). **Note: this action doesn't affect
  current user WEB account.**
- Log out.

### Admin Greeting (only available to admin users)

Send a greeting to all users currently viewing the application. This is a volatile message that
is not persisted anywhere. This is a pure demo feature for Pusher connectivity.

## How to install

1. Clone this repo
2. cd to project root folder
3. cp .env.development .env.development.local
4. Edit .env.development.local file: set `REACT_APP_PUSHER_APP_KEY` and `VUE_APP_PUSHER_CLUSTER` env variables using your account data.

### Docker (prod mode)

5. Run `docker compose build`
6. Run `docker compose up -d`
7. Open http://localhost:8080 in your browser

### Local hot-reload (dev mode)

5. Run `npm install`
6. Run `npm run dev`
7. Open the link displayed in terminal when `npm run dev` is running

### *** IMPORTANT *** API is configured to accept https requests and uses self-signed SSL certificate.
**Do not forget** to visit https://symfony.test and accept browser security warning, otherwise all requests to API with fail.




## what is this?

> view it live: https://courtdibs.com

Court dibs is a simple app for making court reservations. A login is not required to view the upcoming calendar.

### features

- geofenced signup
- one click, passwordless login
- dynamic dusk calculation
- fast page loads, instant transitions

## setup

```sh
npm install
npm run setup
cp .env.example .env
```

1. signup for [Stytch](https://stytch.com/dashboard/start-now)
1. create a test project
1. plug the [API keys](https://stytch.com/docs/guides/dashboard/api-keys) into the `.env` file you just created.

## development

```sh
npm run dev
open http://localhost:3000
```

This starts the app in development mode, rebuilding assets on file changes.

If you plan on running the app somewhere other than http://localhost:3000, you'll need to supply your own Google Maps API Key.

### Connecting to your local database

i'm no SQL nerd. locally i use [TablePlus](https://tableplus.com/)

Database path: .../court-dibs/prisma/sqlite.db

# credits

https://remix.run/resources/indie-stack#quickstart

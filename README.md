## setup

```sh
npm install
npm run setup
```

## development

```sh
npm run dev
open http://localhost:3000
```

This starts the app in development mode, rebuilding assets on file changes.

### background

This is a simple app for making court reservations. A login is required to manage them, but not to view existing ones.

passwords are not stored by the app. login links are sent via email.

### Connecting to your database

i'm not a DBA, so locally i use TablePlus

Database path: .../court-dibs/prisma/sqlite.db

# more info

https://remix.run/resources/indie-stack#quickstart

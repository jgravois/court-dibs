# setup

```
npm i
npm run setup
npm run dev

open http://localhost:3000
```

## development

- Initial setup:

  ```sh
  npm install
  npm run setup
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

### background

This is a simple app for making court reservations. A login is required to create and manage reservations, but you can view existing ones anonymously.

passwords are not stored by the app. for both new and existing users, login links are sent to an existing email address.

### Connecting to your database

i'm not a DBA, so locally i use TablePlus

Database path: .../court-dibs/prisma/data.db

# more info

https://remix.run/resources/indie-stack#quickstart

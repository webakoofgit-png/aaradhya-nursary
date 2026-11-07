# MySQL setup

1. Copy `.env.example` to `.env` and replace every placeholder.
2. For a local MySQL server, run `npm run db:mysql:create` once to create the database and restricted application user.
3. Remove `MYSQL_ADMIN_PASSWORD` from `.env` after that command succeeds.
4. Keep `DATABASE_SSL=true` for a remote production database. Use `false` only for a trusted local connection. Add the provider CA path when required.
5. Run `npm run db:mysql:migrate`.
6. When upgrading an existing installation with the catalogue management features, temporarily set `MYSQL_ADMIN_PASSWORD`, run `npm run db:mysql:upgrade-catalog`, and remove the administrator password again.

The migration is repeatable: it creates missing tables and settings without deleting existing data. It creates the first administrator only when both `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set, and it never uses the insecure development default password.

The live application uses MySQL for the retail catalogue, B2B catalogue, customers, sessions, quotations, categories and offers. The old SQLite file is retained only as an offline backup and is not read by the application.

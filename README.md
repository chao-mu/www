# What Where When Guide

## Development

### Start Server

To start the server, in the root directory run:

```
$ nodemon
```

and then in another terminal run the front end:

```
$ cd client
$ nodemon
```

Finally proceed to http://localhost:3000 which will proxy server calls to 5000.

### Run migrations

```
npx sequelize-cli db:migrate
```

To delete the database

```
rm dev.sqlite3
```

## Deployment

The following environmental variables should be set in production:


SESSION\_SECRET - Used to sign our session id cookie.

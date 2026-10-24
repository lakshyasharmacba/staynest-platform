# Wanderlust

A full-stack travel listing website built with Node.js, Express, MongoDB, EJS, Bootstrap and Cloudinary.

## Features

- User signup, login and logout
- Explore travel listings
- Case-insensitive listing search
- Search auto-runs 700ms after the user stops typing
- Add, edit and delete listings
- Cloudinary image uploads
- Reviews and review deletion
- Location map and Google Maps directions
- Responsive UI

## Run locally

```bash
npm install
node app.js
```

Create a `.env` file using `.env.example`.

Keep the values in `.env.example` blank and put real credentials only in `.env` or your hosting provider's environment settings.

## Required environment variables

```text
ATLASDB_URL=
SECRET=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

For Render, add the same variables in the service Environment settings. Do not commit `.env` or real API credentials.

Required Render values are `ATLASDB_URL`, `SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET`. `PORT` is assigned by Render automatically.

## Render

Build command:

```text
npm install
```

Start command:

```text
node app.js
```

The server connects to MongoDB before accepting requests, which avoids requests reaching the app before the database connection is ready.

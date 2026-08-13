# Social Connect

A real-time social messaging platform built with React, Node.js, Express, MongoDB and Socket.io.

## Included capabilities

- Firebase Authentication with Google OAuth, verified by Firebase Admin on the server, then exchanged for a seven-day JWT. All user, message, and media routes require that session token.
- Socket.io presence, typing events and immediate recipient delivery, alongside persisted MongoDB conversations.
- Cloudinary image upload/delete API with a 5 MB limit and automatic format, quality and dimension optimization.
- 16 REST endpoints: health; register, login and Firebase session exchange; profile read/update/avatar/delete; user list/detail; message create/list/conversations/read; media upload/delete.
- Indexed messages and lean, projected reads for faster common conversation and directory queries.
- Vercel-ready React deployment configuration. Deploy `client` to Vercel and provide its URL as `CLIENT_ORIGIN`; deploy the persistent Socket.io API to a Node host (Vercel serverless functions do not support persistent Socket.io connections).

## Run locally

1. Copy `.env.example` values into `server/.env` and `client/.env`. Configure Google as a sign-in provider in Firebase and place the Firebase Admin service-account JSON on one line in `FIREBASE_SERVICE_ACCOUNT`.
2. Run `npm install` then `npm run dev` in `client`.
3. Run `npm install` then `npm run dev` in `server`.

For Vercel, set the `VITE_*` variables in the Vercel project and run the build from `client`. The Vercel config is included for a static React deployment.

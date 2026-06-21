# Office Token Generator

A simple website for generating visitor tokens based on branch, counselor availability, and location.

## Project structure
- `backend/` — Express API server for branches, counselors, availability, and token generation
- `frontend/` — Static UI that connects to the backend API

## Run locally
### Backend
1. Open a terminal in `Token Generator/backend`
2. Install dependencies: `npm install`
3. Start the backend: `npm start`
4. The API will run at `http://localhost:3000`

### Frontend
1. Open a terminal in `Token Generator/frontend`
2. Install dependencies: `npm install`
3. Start the frontend: `npm run dev`
4. Open `http://localhost:8080` in your browser

### New portal pages
- `http://localhost:8080/login` — login portal
- `http://localhost:8080/dashboard` — summary dashboard
- `http://localhost:8080/reception` — reception/walkin management
- `http://localhost:8080/walkin-form` — student walkin form with QR code

## Customize
- Edit backend/server.js to add branches, locations, counselors, or webhook logic.
- Edit frontend/pages/*.js and frontend/styles/globals.css to change the portal UI.

## Production Deployment (Vercel)
Ensure the following environment variables are set in the Vercel Project Settings:
- `DATABASE_URL`: Production PostgreSQL connection string (e.g. `postgresql://...`).
- `BACKEND_URL`: The base URL of the backend API (e.g. `https://[your-app].vercel.app/_/backend`).
- `JWT_SECRET`: Secret key for session token signing (should match backend).
- `NEXT_PUBLIC_APP_URL`: The frontend public URL (for QR code generation).


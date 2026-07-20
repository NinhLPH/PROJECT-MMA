# FlexFit Backend

Express + TypeScript API for FlexFit, backed by MongoDB and protected with JWT.

## Setup

Install dependencies, then create `FlexFit-backend/.env` with all required values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/flexfit
JWT_SECRET=replace-with-a-long-random-secret
```

`PORT`, `MONGO_URI`, and `JWT_SECRET` are required. The server connects to MongoDB before it starts listening.

```bash
npm run dev
npm run build
npm start
```

`GET /health` returns `{ "status": "ok" }` once the API is running.

## Authentication

Register with `POST /api/auth/register` using `email`, `password`, `fullName`, and `phoneNumber`. Login with `POST /api/auth/login`, then supply the returned token as:

```http
Authorization: Bearer <token>
```

Admin endpoints are under `/api/admin` and require a token for a user whose role is `admin`.

## API groups

- Public: `GET /api/trainers`, `GET /api/trainers/:id/schedules?date=YYYY-MM-DD`. The schedules endpoint returns only available slots by default; add `&includeBooked=true` to return all slots, including booked ones.
- Customer bookings: `POST /api/bookings`, `GET /api/bookings/user/:userId`, `PUT /api/bookings/:id/cancel`
- Admin trainer CRUD: `/api/admin/trainers`
- Admin schedule CRUD: `/api/admin/schedules`
- Admin bookings: `GET /api/admin/bookings`, `PUT /api/admin/bookings/:id/confirm`, `PUT /api/admin/bookings/:id/cancel`

Booking prices are calculated by the server from the selected schedule duration and the trainer's `pricePerHour`.

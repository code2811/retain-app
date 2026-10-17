# Retain: A Personal Expense & Budget Manager

Retain helps me track my personal expenses and stay within a monthly budget.
I built it for my ALU Summative Project and the project helped me practise
connecting a React frontend to a Node and MongoDB backend.

**Live app:** https://retain-app-lyart.vercel.app

**Backend API:** https://retain-backend-oy9l.onrender.com

> Note: the backend runs on Render's free tier, so the first request can take
> up to a minute while it wakes up. Please give it a moment.

## What I built

**As a user**

- Sign up, sign in and sign out
- Add, edit and delete personal expenses
- Search, filter and sort expenses with pagination
- Set a monthly budget and see how much is left
- Use the app on a phone, tablet or laptop

**As an admin**

- Create, edit and delete categories
- See platform insights about users, expenses and spending by category

## Tech I used

- **Frontend:** React, TypeScript, Vite, Material UI, React Router, Axios,
  React Hook Form, Yup, Recharts
- **State:** React Context for authentication, Redux Toolkit for expense
  filters and results
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken) and bcryptjs
- **Hosting:** Vercel for the frontend and Render for the backend

## How it works

- Authentication lives in React Context. It holds the user, token and role,
  and protects the routes.
- Filters live in Redux. When a filter or sort option changes, Redux calls the
  API, and the backend performs the search, filtering, sorting and pagination.
  This means the browser does not load every expense at once.
- Users only get their own expenses and budgets. Admin routes are protected on
  the backend with `protect` and `authorize('admin')`.
- When an admin deletes a category, its expenses move to `Uncategorized` so
  they are not left without a category.

## Run it locally

I use Node.js 18 or newer, npm, Git and a MongoDB database.

```bash
git clone https://github.com/code2811/retain-app.git
cd retain-app
```

### Backend

```bash
cd backend
npm install
# Create a .env file with the variables listed below.
npm run build
npm run seed
npm start
```

For development, I use:

```bash
npm run dev
```

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
# Create a .env file with VITE_API_URL.
npm run dev
```

### Environment variables

These are the environment variable names used by the application:

- **Backend:** `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, `PORT`,
  `FRONTEND_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Frontend:** `VITE_API_URL`

The seed command creates or updates the admin account using
`ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## API

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Expenses

- `GET /api/expenses`
- `GET /api/expenses/:id`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Budgets

- `GET /api/budgets`
- `POST /api/budgets`
- `GET /api/budgets/summary`

### Categories

- `GET /api/categories`
- `POST /api/categories` (admin only)
- `PUT /api/categories/:id` (admin only)
- `DELETE /api/categories/:id` (admin only)

### Admin

- `GET /api/admin/insights` (admin only)

## Things I know could be better

- The admin role is given to whoever registers with `ADMIN_EMAIL`. For a
  real product, I would use invitations or verified admin accounts.
- Expenses store the category name, not an ID, so renaming a category would
  need extra handling.
- There are no automated tests yet.

## What was hard

The hardest part was keeping authentication in React Context while using
Redux for expense filtering, sorting and pagination. I also had to make sure
the backend applied the logged-in user's ID to every personal data query.

## What I would add next

I would add automated tests for authentication, ownership checks and admin
routes. I would also add export to CSV and recurring expenses.

## Author

Frida Kayiranga, final-year Software Engineering student at ALU.

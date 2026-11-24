# Simple MERN Stack Notes App with Authentication (MVC Architecture)

A full-stack Notes application built using the **MERN Stack** following the clean **MVC (Model-View-Controller)** pattern:
- **Authentication**: Register & Login with `username`, `email` (Gmail), and hashed `password`.
- **Security**: Passwords hashed with `bcryptjs`, authenticated with `jsonwebtoken` (JWT).
- **Personal Notes**: Each user has their own private notes.
- **Database**: MongoDB Atlas with automatic local MongoDB fallback, configured through `backend/.env`.

---

## 📁 MVC Architecture

```
backend/
├── models/                     # [M] Models: Database schemas
│   ├── User.js                 # User schema (username, email, hashed password)
│   └── Note.js                 # Note schema (linked to User ID)
│
├── controllers/                # [C] Controllers: Business logic
│   ├── authController.js       # Register (hash password) & Login logic
│   └── noteController.js       # Notes CRUD logic
│
├── routes/                     # Route endpoints
│   ├── authRoutes.js           # /api/auth/register, /api/auth/login
│   └── noteRoutes.js           # /api/notes (Protected with auth middleware)
│
├── middleware/
│   └── authMiddleware.js       # JWT token verification
│
├── package.json
└── server.js                   # Express server entry point

frontend/                       # [V] Views: React Frontend
├── src/
│   ├── App.jsx                 # Login/Register view & Notes dashboard
│   ├── App.css                 # Clean CSS styling
│   └── main.jsx
├── index.html
└── package.json
```

---

## 🚀 How to Run the Application

### 1. Configure MongoDB
Copy `backend/.env.example` to `backend/.env`, then replace `<db_username>` and
`<db_password>` with your Atlas database user's credentials. URL-encode any
reserved characters in the username or password.

The backend tries Atlas first. If Atlas is unavailable, it connects to local
MongoDB at `mongodb://127.0.0.1:27017/notesdb`. Make sure the local MongoDB
service is installed and running for the fallback to work. You can override
that address with `LOCAL_MONGODB_URI` in `backend/.env`.

### 2. Start the Backend Server
```bash
cd backend
npm start
```
The server will run at: **http://localhost:5001**

### 3. Start the Frontend (React)
In another terminal:
```bash
cd frontend
npm run dev
```
Open your browser at: **http://localhost:5173**

---

## ⚡ API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (password is hashed) | `{ username, email, password }` |
| `POST` | `/api/auth/login` | Login user & receive JWT token | `{ email, password }` |

### 📝 Notes (`/api/notes`) *(Requires Authorization: Bearer `<token>`)*
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notes` | Get all notes for the logged-in user |
| `POST` | `/api/notes` | Create a note (`{ title, content }`) |
| `PUT` | `/api/notes/:id` | Update a note |
| `DELETE` | `/api/notes/:id` | Delete a note |

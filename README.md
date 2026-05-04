# 🗂️ Taskflow — Team Task Manager

A production-ready full-stack team task management application with RBAC, Kanban board, and real-time dashboard.

---

## 📸 Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control** — Global roles (admin/member) + per-project roles
- **Project Management** — Create projects, add/remove members, color-coded organization
- **Kanban Task Board** — Drag-friendly task cards with status columns (Todo / In Progress / Done)
- **Dashboard** — Live stats: total, completed, in-progress, overdue tasks with progress bar
- **Dark Mode** — System-aware, persistable theme toggle
- **Filters & Search** — Filter by status, priority, assignee; debounced search
- **Toast Notifications** — Feedback on all user actions
- **Pagination** — Backend-supported paginated queries

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS, Axios, React Router v6 |
| Backend | Node.js, Express |
| Database | PostgreSQL + Sequelize ORM |
| Auth | JWT + bcryptjs |
| Validation | express-validator |
| Dev | nodemon, concurrently |

---

## 📂 Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/
│   │   └── database.js          # Sequelize connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── auth.js              # verifyToken, checkRole, checkProjectRole
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── index.js             # Associations
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── ProjectMember.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── validators/
│   │   └── index.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js         # Axios instance with interceptors
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── AuthPage.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── projects/
│   │   │   │   ├── ProjectsPage.jsx
│   │   │   │   └── ProjectDetailPage.jsx
│   │   │   ├── tasks/
│   │   │   │   ├── TaskBoard.jsx       # Kanban columns
│   │   │   │   ├── TasksPage.jsx       # List view with filters
│   │   │   │   ├── CreateTaskModal.jsx
│   │   │   │   └── EditTaskModal.jsx
│   │   │   └── ui/
│   │   │       ├── index.jsx           # Avatar, Badge, Modal, Spinner, etc.
│   │   │       ├── Sidebar.jsx
│   │   │       └── Layout.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── hooks/
│   │   │   └── index.js               # useFetch, useDebounce
│   │   ├── utils/
│   │   │   └── index.js               # formatDate, statusConfig, etc.
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── package.json                        # Root: concurrently scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** v14+ running locally
- **npm** v9+

### 1. Clone the repository

```bash
git clone <repo-url>
cd team-task-manager
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE team_task_manager;
```

### 3. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=team_task_manager
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### 4. Install all dependencies

From the **root** directory:

```bash
npm install
npm run install:all
```

Or manually:

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Start the development servers

From the **root** directory:

```bash
npm run dev
```

This starts:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:3000`

The database tables are auto-created via Sequelize's `sync({ alter: true })` on startup.

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (protected) |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member (admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (supports filters) |
| POST | `/api/tasks` | Create task (project admin) |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (project admin) |
| GET | `/api/tasks/dashboard` | Dashboard stats |

**Query params for GET /api/tasks:**
- `status=todo|in_progress|done`
- `priority=low|medium|high`
- `assignedTo=<userId>` or `assignedTo=me`
- `projectId=<id>`
- `search=<string>`
- `page=1&limit=50`

---

## 🛡️ RBAC Rules

| Action | Global Admin | Project Admin | Project Member |
|--------|-------------|---------------|----------------|
| Create project | ✅ | ✅ | ✅ |
| Delete project | - | ✅ (own) | ❌ |
| Add/remove members | - | ✅ | ❌ |
| Create/delete tasks | - | ✅ | ❌ |
| Assign tasks | - | ✅ | ❌ |
| Update task status | - | ✅ | ✅ (assigned) |
| View project | - | ✅ | ✅ |

---

## 🗄️ Database Schema

```
users              projects           project_members    tasks
────────────       ────────────       ───────────────    ────────────
id (UUID PK)       id (UUID PK)       id (UUID PK)       id (UUID PK)
name               name               userId → users     title
email (unique)     description        projectId →        description
password (hash)    color              projects           status
role               createdBy →        role               priority
avatar             users              [unique:           assignedTo →
createdAt                             userId+projectId]  users
updatedAt          createdAt          createdAt          projectId →
                   updatedAt          updatedAt          projects
                                                         createdBy →
                                                         users
                                                         dueDate
                                                         createdAt
                                                         updatedAt
```

---

## 🧪 Test Accounts (after signup)

Create accounts via the signup form. The first user to join a project as admin has full control.

**Suggested test flow:**
1. Sign up as User A → create a project → you are project admin
2. Sign up as User B → User A adds User B by email → User B is a member
3. User A creates tasks, assigns to User B
4. User B can update status of their assigned tasks

---

## 🔧 Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 5000 | Server port |
| DB_HOST | Yes | localhost | PostgreSQL host |
| DB_PORT | No | 5432 | PostgreSQL port |
| DB_NAME | Yes | - | Database name |
| DB_USER | Yes | - | DB username |
| DB_PASSWORD | Yes | - | DB password |
| JWT_SECRET | Yes | - | JWT signing key |
| JWT_EXPIRES_IN | No | 7d | Token expiry |
| FRONTEND_URL | No | http://localhost:3000 | CORS origin |

---

## 📦 Production Build

```bash
# Build frontend
cd frontend && npm run build

# The build output is in frontend/build/
# Serve it with any static file server or configure Express to serve it
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

MIT
# Office-Task-Manager

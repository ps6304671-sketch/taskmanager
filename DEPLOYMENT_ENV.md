# Vercel Deployment Environment Variables

Use these tables to configure your environment variables in the Vercel Dashboard for each project.

## 1. Backend Project Settings
**Root Directory:** `backend`

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `5000` | Optional, defaults to 5000 |
| `SUPABASE_URL` | `https://your-project.supabase.co` | |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | **KEEP SECRET** |
| `JWT_SECRET` | `your-random-secret-string` | Used for local token signing |

---

## 2. Frontend Project Settings
**Root Directory:** `frontend`

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` | **SAFE FOR PUBLIC** |
| `VITE_API_URL` | `https://your-backend-url.vercel.app/api` | Your deployed backend URL |

### ⚠️ Security Warning
Do **NOT** put the `SUPABASE_SERVICE_ROLE_KEY` in the frontend settings. This key bypasses all security rules and should only be used in the backend.

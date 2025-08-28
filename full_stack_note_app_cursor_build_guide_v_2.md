# Full-Stack Note-Taking App — Cursor Build Guide (React TS + Node TS + MongoDB)

**Goal:** Build a production-style, mobile-first note-taking app with **Email+OTP** or **Google login**, JWT-protected **create/delete notes**, robust validation & error handling, and commits after each feature.

**You will:**
- Implement **Email + OTP signup/login** and **Google login** (GIS).
- Show **clear validation + server error messages** for all auth flows.
- After login, show a **Welcome** view with user info + **Create/Delete notes**.
- Use **JWT (httpOnly cookie)** to authorize notes APIs.
- Make UI **mobile-first** and closely match the provided design.
- **Commit after each feature** using Conventional Commits.

---

## 0) Repository & Monorepo Layout

```bash
mkdir notes-app && cd notes-app
mkdir client server
git init -b main
```

Create root files:
- `.gitignore`
```gitignore
node_modules
*.env
.env*
dist
coverage
```
- `README.md` (high-level run instructions)

**Commit:** `chore: initialize repo with client and server workspaces`

---

## 1) Backend (server) — Scaffolding

```bash
cd server
pnpm init -y # or npm/yarn
pnpm add express zod cors mongoose jsonwebtoken bcryptjs dotenv cookie-parser morgan helmet nodemailer rate-limiter-flexible google-auth-library
pnpm add -D typescript ts-node-dev @types/express @types/node @types/jsonwebtoken @types/cookie-parser @types/morgan eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npx tsc --init
```

**`tsconfig.json` minimal edits:**
- `"target": "ES2020"`
- `"module": "CommonJS"`
- `"rootDir": "src"`, `"outDir": "dist"`
- `"esModuleInterop": true`

**`package.json` scripts:**
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "lint": "eslint ."
  }
}
```

**Folders**
```
server/
  src/
    config/
      env.ts
      db.ts
    core/
      errors.ts
      http.ts
      rateLimit.ts
    features/
      auth/
        auth.routes.ts
        auth.controllers.ts
        auth.schemas.ts
        auth.service.ts
        otp.service.ts
        google.service.ts
      users/
        user.model.ts
      notes/
        note.model.ts
        notes.routes.ts
        notes.controllers.ts
        notes.schemas.ts
      otp/
        otp.model.ts
    middleware/
      requireAuth.ts
      errorHandler.ts
    utils/
      jwt.ts
      email.ts
      logger.ts
    index.ts
```

**Env sample** `server/.env.example`
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/notes_app
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=supersecret
JWT_EXPIRES_IN=7d
COOKIE_SECURE=false
EMAIL_FROM="Notes App <no-reply@notesapp.dev>"
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Commit:** `chore(server): scaffold express typescript project`

---

## 2) Backend — Core Bootstrap

Create **`src/config/env.ts`** to load & export env safely.
Create **`src/config/db.ts`** to connect mongoose (`strictQuery: true`).

Create **`src/core/errors.ts`**
- `export class ApiError extends Error { status: number; details?: any }`

Create **`src/middleware/errorHandler.ts`**
- Catch `ApiError` and zod errors → JSON `{ success:false, message, code?, details? }`.

Create **`src/utils/logger.ts`** for morgan.
Create **`src/utils/jwt.ts`** `signAccessToken(userId)`, `verifyToken(token)`.
Create **`src/utils/email.ts`** Nodemailer transport (dev: log OTP to console).
Create **`src/core/http.ts`** helper `ok(res, data, status=200)`.
Create **`src/core/rateLimit.ts`** using `rate-limiter-flexible`.

**`src/index.ts`**
- Load env → connect DB → express app with `helmet`, `cors({ origin: CLIENT_ORIGIN, credentials: true })`, `cookieParser()`, `express.json()`, `morgan('dev')`.
- Routes: `/api/health`, `/api/auth`, `/api/notes`.
- Error handler last.

**Commit:** `feat(server): bootstrap express app, middleware, helpers`

---

## 3) Backend — Models

**`user.model.ts`**
```ts
import { Schema, model } from 'mongoose';
const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  name: { type: String },
  provider: { type: String, enum: ['email','google'], required: true },
  googleId: { type: String },
}, { timestamps: true });
export default model('User', userSchema);
```

**`note.model.ts`**
```ts
import { Schema, model, Types } from 'mongoose';
const noteSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 100 },
  body: { type: String, default: '' },
}, { timestamps: true });
export default model('Note', noteSchema);
```

**`otp.model.ts`**
```ts
import { Schema, model } from 'mongoose';
const otpSchema = new Schema({
  email: { type: String, index: true },
  codeHash: String,
  expiresAt: Date,
  attempts: { type: Number, default: 0 },
}, { timestamps: true });
export default model('Otp', otpSchema);
```

**Commit:** `feat(server): add mongoose models for user, note, otp`

---

## 4) Backend — Zod Schemas

**`features/auth/auth.schemas.ts`**
```ts
import { z } from 'zod';
export const requestOtpSchema = z.object({ email: z.string().email() });
export const verifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().length(6) });
export const googleLoginSchema = z.object({ idToken: z.string().min(10) });
```

**`features/notes/notes.schemas.ts`**
```ts
import { z } from 'zod';
export const createNoteSchema = z.object({
  title: z.string().min(1).max(100),
  body: z.string().max(5000).optional(),
});
export const deleteNoteSchema = z.object({ id: z.string().length(24) });
```

**Commit:** `feat(server): add zod validation for auth and notes`

---

## 5) Backend — Email + OTP Auth

**`features/auth/otp.service.ts`**
- Generate 6-digit OTP, hash with `bcrypt`, save with 10-min expiry, reset attempts.

**`features/auth/auth.service.ts`**
- `issueSession(userId)` → sign JWT, return token.

**`features/auth/auth.controllers.ts`** (key handlers)
- `requestOtp`: validate → create OTP → send email/log → return 200.
- `verifyOtp`: validate → get latest otp for email; if expired/invalid → 400 with codes `OTP_EXPIRED`/`OTP_INVALID` → on success: upsert user `{ provider: 'email' }`, issue JWT, set **httpOnly cookie** `access_token` (Secure in prod), clear OTPs, return user profile.
- `me`: read JWT from cookie → return user.
- `logout`: clear cookie.

**`features/auth/auth.routes.ts`**
```ts
import { Router } from 'express';
import * as c from './auth.controllers';
const r = Router();
r.post('/request-otp', c.requestOtp);
r.post('/verify-otp', c.verifyOtp);
r.get('/me', c.me);
r.post('/logout', c.logout);
export default r;
```

**Commit:** `feat(auth): implement email otp flow with httpOnly jwt cookie`

---

## 6) Backend — Google Login

**`features/auth/google.service.ts`** verify ID token with `google-auth-library`.

**Controller:** `googleLogin`
- Validate `{ idToken }` with zod.
- Verify token, extract `{ email, name, sub: googleId }`.
- Upsert user `{ provider: 'google', googleId }`.
- Issue JWT httpOnly cookie, return profile.

**Route:** `POST /api/auth/google` → `googleLogin`.

**Commit:** `feat(auth): google id token verification endpoint`

---

## 7) Backend — JWT & Notes CRUD

**`middleware/requireAuth.ts`**
- Get token from cookie `access_token` (or `Authorization: Bearer` fallback for tests) → `req.user = { id }` else 401.

**`features/notes/notes.controllers.ts`**
- `listNotes`: find by `userId = req.user.id` (sorted desc `createdAt`).
- `createNote`: zod validate → insert `{ userId, title, body }`.
- `deleteNote`: zod validate `id` → deleteOne `{ _id:id, userId }`; if 0 deleted → 404.

**`features/notes/notes.routes.ts`**
```ts
import { Router } from 'express';
import * as c from './notes.controllers';
import requireAuth from '../../middleware/requireAuth';
const r = Router();
r.use(requireAuth);
r.get('/', c.listNotes);
r.post('/', c.createNote);
r.delete('/:id', c.deleteNote);
export default r;
```

Mount routes in **`src/index.ts`**:
```ts
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
```

**Commit:** `feat(notes): jwt-protected list/create/delete`

---

## 8) Backend — Error/Rate Limits & Health

- Map common failures with codes/messages for UI: `INVALID_INPUT`, `OTP_EXPIRED`, `OTP_INVALID`, `TOKEN_INVALID`, `NOT_FOUND`.
- Add per-IP/email rate limits to `/api/auth/*`.
- Add `GET /api/health` → `{ status:'ok' }`.

**Commit:** `feat(server): standardized errors, rate-limits, health`

---

## 9) Frontend (client) — Scaffolding

```bash
cd ../client
pnpm create vite@latest . -- --template react-ts
pnpm add react-router-dom axios zod react-hook-form @hookform/resolvers zustand
pnpm add -D tailwindcss postcss autoprefixer eslint prettier
npx tailwindcss init -p
```

**Tailwind:** `tailwind.config.js` `content` includes `./index.html`, `./src/**/*.{ts,tsx}`. Add to `src/styles/globals.css` Tailwind base/components/utilities.

**Structure**
```
client/
  src/
    app/
      axios.ts
      router.tsx
      store.ts
    components/
      ErrorBanner.tsx
      FormInput.tsx
      GoogleButton.tsx
      Loader.tsx
      Navbar.tsx
      NoteCard.tsx
      EmptyState.tsx
    features/
      auth/
        pages/
          Signup.tsx
          VerifyOtp.tsx
          Login.tsx
        api.ts
        schemas.ts
        useAuthStore.ts
      notes/
        pages/
          Notes.tsx
        api.ts
        schemas.ts
        useNotesStore.ts
      welcome/
        Welcome.tsx
    App.tsx
    main.tsx
    styles/globals.css
```

**Env** `client/.env.example`
```
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**`src/app/axios.ts`**
```ts
import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
```

**Commit:** `chore(client): scaffold vite react ts with tailwind and axios`

---

## 10) Frontend — Validation Schemas & API Contracts

**Auth Schemas** `features/auth/schemas.ts`
```ts
import { z } from 'zod';
export const emailSchema = z.object({ email: z.string().email('Enter a valid email') });
export const otpSchema = z.object({ email: z.string().email(), otp: z.string().length(6, '6-digit code') });
export const googleSchema = z.object({ idToken: z.string().min(10) });
```

**Notes Schemas** `features/notes/schemas.ts`
```ts
import { z } from 'zod';
export const createNoteSchema = z.object({
  title: z.string().min(1,'Title required').max(100,'Max 100 chars'),
  body: z.string().max(5000,'Max 5000 chars').optional(),
});
```

**API Module** `features/auth/api.ts`
```ts
import { api } from '../../app/axios';
export const requestOtp = (email:string) => api.post('/auth/request-otp', { email });
export const verifyOtp  = (email:string, otp:string) => api.post('/auth/verify-otp', { email, otp });
export const googleLogin = (idToken:string) => api.post('/auth/google', { idToken });
export const me = () => api.get('/auth/me');
export const logout = () => api.post('/auth/logout');
```

**Notes API** `features/notes/api.ts`
```ts
import { api } from '../../app/axios';
export const listNotes = () => api.get('/notes');
export const createNote = (payload:{title:string; body?:string}) => api.post('/notes', payload);
export const deleteNote = (id:string) => api.delete(`/notes/${id}`);
```

**Commit:** `feat(client): api modules and zod schemas`

---

## 11) Frontend — Global State & Routing

**Auth Store** `features/auth/useAuthStore.ts`
- `user: { id, email, name, provider } | null`
- actions: `setUser`, `clearUser`, `fetchMe()`

**Notes Store** `features/notes/useNotesStore.ts`
- `notes: Note[]`, `loading`, `error`
- actions: `loadNotes`, `addNote`, `removeNote`

**Router** `app/router.tsx`
- Routes: `/signup`, `/verify-otp`, `/login`, `/welcome`, `/notes`
- Guard: if no `user` redirect to `/signup` (except auth pages).

**App** wraps Router + `Navbar`.

**Commit:** `feat(client): routing and zustand stores`

---

## 12) Frontend — UI Components & Error States

- `FormInput`: RHF-compatible input + label + error text.
- `ErrorBanner`: prominent error with a friendly message and optional `code`.
- `GoogleButton`: renders Google One Tap or button using GIS. On click → get `credential` idToken → call `googleLogin`.
- `Loader`: small spinner.
- `NoteCard`: shows title/body and delete button.
- `EmptyState`: show when no notes exist.
- `Navbar`: left brand, right user email + logout.

**Commit:** `feat(client): reusable UI components with mobile styles`

---

## 13) Frontend — Auth Pages

**Signup.tsx**
- Form (email) → `requestOtp`. Show success + link to `/verify-otp?email=...`.
- Handle API validation & failure messages (OTP send errors, rate limit).

**VerifyOtp.tsx**
- Read `email` from query or input.
- Form (email+otp) → `verifyOtp` → on success `setUser`, navigate to `/welcome`.
- Display backend codes `OTP_EXPIRED` / `OTP_INVALID` clearly.

**Login.tsx**
- If design includes email login via OTP (same as signup) you can reuse **VerifyOtp** for returning users.
- Also show **Google login** if user used Google before; otherwise copy states from design: if user did not sign up with Google, show a hint like *"Use OTP login"*.
- Implement **Google One Tap** or a button: load GIS script, render button, handle credential callback → `googleLogin`.

**Commit:** `feat(client): signup, verify-otp, and login pages with validation`

---

## 14) Frontend — Post-Login: Welcome + Notes

**Welcome.tsx**
- Fetch `me()` on mount (or use store). Show **welcome message + user info** (email/name/provider), CTA to **Go to Notes**.

**Notes.tsx**
- On mount: `loadNotes()`.
- Create form using `createNoteSchema` with RHF.
- List cards (`NoteCard`) with delete buttons. Confirm before delete.
- Handle API failures and display `ErrorBanner`.

**Commit:** `feat(client): welcome and notes screens with create/delete`

---

## 15) Frontend — Mobile-First Styling & Design Parity

- Use a **single-column** layout under 640px. Card paddings `p-4`, rounded `rounded-2xl`, shadows `shadow-sm`.
- Sticky top `Navbar`, content padding `pt-16 pb-24 px-4`.
- Inputs: full-width, larger tap targets (`h-11`), error text small/red beneath.
- Primary buttons: full-width on mobile.
- Test on 360×640, iPhone SE/12, and 768px tablet.
- If a design link specifies fonts/colors, add them in `globals.css` and Tailwind config.

**Commit:** `style(client): implement mobile-first styles to match design`

---

## 16) Security, Cookies & CORS

- Backend CORS: `origin: CLIENT_ORIGIN`, `credentials: true`.
- Set JWT **httpOnly**, `sameSite: 'lax'` (dev), `secure: true` in prod with HTTPS.
- Sanitize note strings (trim) and limit lengths via zod.
- Rate limit `/api/auth/*` and OTP attempts.
- Do not expose precise failure reason for `me` and `notes` when token invalid → respond 401 `TOKEN_INVALID`.

**Commit:** `chore(security): hardened cors, cookies, limits`

---

## 17) API Contract (for QA in Cursor)

**Auth**
- `POST /api/auth/request-otp` → `{ email }` → `200 { success:true }`
- `POST /api/auth/verify-otp` → `{ email, otp }` → `200 { user }` + sets cookie
- `POST /api/auth/google` → `{ idToken }` → `200 { user }` + sets cookie
- `GET /api/auth/me` → cookie → `200 { user }` or `401 TOKEN_INVALID`
- `POST /api/auth/logout` → clears cookie → `204`

**Notes** (cookie required)
- `GET /api/notes` → `200 { notes: Note[] }`
- `POST /api/notes` `{ title, body? }` → `201 { note }`
- `DELETE /api/notes/:id` → `204` or `404 NOT_FOUND`

**Error shape**
```json
{ "success": false, "message": "...", "code": "OTP_INVALID", "details": { /* zod issues */ } }
```

---

## 18) Testing Plan (Manual + Minimal Automated)

**Manual**
1. Request OTP with invalid email → see inline validation.
2. Request OTP with valid email → see success; dev console logs OTP.
3. Verify with wrong OTP (twice) → `OTP_INVALID`.
4. Verify with expired OTP → `OTP_EXPIRED`.
5. Google sign-in happy path → user created; cookie set.
6. `GET /api/notes` without cookie → 401.
7. Create note → appears in list; refresh persists.
8. Delete note → removed; 404 when deleting twice.

**Automated (optional)**
- Add `vitest` or `jest` for unit tests on controllers and zod.

**Commit:** `test: add minimal tests for auth and notes`

---

## 19) Dev & Run Scripts

**Server**
```bash
cd server
cp .env.example .env
pnpm dev
```

**Client**
```bash
cd client
cp .env.example .env
pnpm dev
```

Open `http://localhost:5173`.

**Commit:** `docs: add run instructions`

---

## 20) Production Considerations

- Use MongoDB Atlas; set `MONGO_URI`.
- Serve client via static hosting (Vercel/Netlify) and server on Render/Railway/Fly/Heroku.
- Set CORS `CLIENT_ORIGIN` to deployed domain.
- Enforce `COOKIE_SECURE=true`, `sameSite:'none'`, HTTPS.
- Replace console email with SMTP provider (Brevo/SendGrid) in `utils/email.ts`.
- Rotate `JWT_SECRET`, set reasonable `JWT_EXPIRES_IN` (e.g., `7d`).

**Commit:** `chore: production env & security hardening notes`

---

## 21) Git Commit Milestones (copy/paste as you go)

1. `chore: initialize repo with client and server folders`
2. `chore(server): scaffold express typescript project`
3. `feat(server): bootstrap express app, middleware, helpers`
4. `feat(server): add mongoose models for user, note, otp`
5. `feat(server): add zod validation for auth and notes`
6. `feat(auth): email otp flow with httpOnly jwt cookie`
7. `feat(auth): google id token verification endpoint`
8. `feat(notes): jwt-protected list/create/delete`
9. `feat(server): standardized errors, rate-limits, health`
10. `chore(client): scaffold vite react ts with tailwind and axios`
11. `feat(client): api modules and zod schemas`
12. `feat(client): routing and zustand stores`
13. `feat(client): reusable UI components`
14. `feat(client): signup, verify-otp, login pages`
15. `feat(client): welcome and notes screens`
16. `style(client): mobile-first design parity`
17. `chore(security): hardened cors, cookies, limits`
18. `test: add minimal tests`
19. `docs: add run instructions`

---

## 22) Cursor Tasks Checklist

- [ ] Create server scaffolding and env loader
- [ ] Implement models (User, Note, Otp)
- [ ] Implement zod schemas
- [ ] Implement OTP endpoints (request/verify)
- [ ] Implement Google login endpoint
- [ ] Implement JWT middleware
- [ ] Implement Notes CRUD endpoints
- [ ] Standard error handler + rate limit
- [ ] Spin up client, add axios + env
- [ ] Build auth + notes APIs on client
- [ ] Build stores and router with guards
- [ ] Build UI components
- [ ] Implement signup → verify → welcome flow
- [ ] Implement Google login
- [ ] Implement notes page (list/create/delete)
- [ ] Add mobile styles to match design
- [ ] QA manual tests

---

## 23) Snippets You Can Paste Quickly

**Load Google Script (index.html)**
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

**Render Google Button (GoogleButton.tsx)**
```tsx
import { useEffect, useRef } from 'react';
import { googleLogin } from '../features/auth/api';

export default function GoogleButton(){
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const cid = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if(!(window as any).google || !ref.current) return;
    const google = (window as any).google;
    google.accounts.id.initialize({
      client_id: cid,
      callback: async (resp:any) => { await googleLogin(resp.credential); }
    });
    google.accounts.id.renderButton(ref.current, { type: 'standard', size: 'large', shape: 'pill' });
  },[]);
  return <div ref={ref} className="w-full"/>;
}
```

**RequireAuth Route Guard (router.tsx)**
```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';

function Protected({ children }: { children: JSX.Element }){
  const user = useAuthStore(s=>s.user);
  if (!user) return <Navigate to="/signup" replace/>;
  return children;
}

// ...define routes using <Protected> for /welcome and /notes
```

**Logout Action (Navbar.tsx)**
```tsx
import { logout } from '../features/auth/api';
import { useAuthStore } from '../features/auth/useAuthStore';
export default function Navbar(){
  const clear = useAuthStore(s=>s.clearUser);
  const onLogout = async()=>{ await logout(); clear(); window.location.href='/signup'; };
  return (
    <nav className="fixed top-0 inset-x-0 h-14 bg-white/80 backdrop-blur shadow-sm flex items-center justify-between px-4">
      <div className="font-semibold">Notes</div>
      <button onClick={onLogout} className="text-sm underline">Logout</button>
    </nav>
  );
}
```

---

## 24) Done When

- [ ] Email OTP signup/login works end-to-end with proper messages.
- [ ] Google login works when user signed up with Google.
- [ ] `/welcome` shows user info and navigation to `/notes`.
- [ ] `/notes` lists, creates, and deletes notes; only owner can modify.
- [ ] All protected APIs require JWT cookie.
- [ ] Mobile view matches given design closely.
- [ ] Each feature landed with a commit.

> Tip: Keep the server & client consoles open to surface validation and API errors early.


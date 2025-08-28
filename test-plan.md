# Testing Plan

## Manual Testing Checklist

### Authentication Flow
- [ ] Request OTP with invalid email → see inline validation
- [ ] Request OTP with valid email → see success; dev console logs OTP
- [ ] Verify with wrong OTP (twice) → `OTP_INVALID`
- [ ] Verify with expired OTP → `OTP_EXPIRED`
- [ ] Google sign-in happy path → user created; cookie set

### Protected Routes
- [ ] `GET /api/notes` without cookie → 401
- [ ] `POST /api/notes` without cookie → 401
- [ ] `DELETE /api/notes/:id` without cookie → 401

### Notes Functionality
- [ ] Create note → appears in list; refresh persists
- [ ] Delete note → removed; 404 when deleting twice
- [ ] List notes → shows only user's notes
- [ ] Form validation → title required, max lengths enforced

### UI/UX
- [ ] Mobile responsive (test on 360×640, iPhone SE/12, 768px tablet)
- [ ] Error messages display clearly with codes
- [ ] Loading states show during API calls
- [ ] Navigation works between all routes
- [ ] Logout clears session and redirects

### Security
- [ ] JWT tokens stored in httpOnly cookies
- [ ] CORS properly configured for client origin
- [ ] Rate limiting prevents abuse
- [ ] Input validation on both client and server

## Test Commands

### Backend
```bash
cd server
npm run dev
```

### Frontend
```bash
cd client
npm run dev
```

### Health Check
```bash
curl http://localhost:4000/api/health
```

## Expected Results

- Email OTP signup/login works end-to-end with proper messages
- Google login works when user signed up with Google
- `/welcome` shows user info and navigation to `/notes`
- `/notes` lists, creates, and deletes notes; only owner can modify
- All protected APIs require JWT cookie
- Mobile view matches design closely

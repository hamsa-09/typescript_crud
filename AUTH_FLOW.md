# Authentication Flow - HashedIn Meme Forum

## ✅ Changes Made

### 1. **Protected All Routes**
All routes now require authentication except login and register pages:

```typescript
// Public routes (no auth required)
- /auth/login
- /auth/register

// Protected routes (require login)
- /feed (requires authGuard)
- /post/:id (requires authGuard)
- /compose (requires authGuard)
- /edit/:id (requires authGuard)
- /me/* (requires authGuard)
- /admin/moderation (requires adminGuard - admin only)
```

### 2. **Default Route Behavior**
- App now redirects to `/auth/login` by default
- After successful login, users are redirected to `/feed`
- If user tries to access protected route, they're redirected to login with `returnUrl` parameter

## 🔐 Authentication Flow

### Step 1: User Registration
```
1. User visits /auth/register
2. Fills form: email, password, name
3. POST /register → json-server-auth
4. Server creates user in db.json
5. Returns: { accessToken: "...", user: {...} }
6. AuthService stores token in localStorage
7. Auto-redirect to /feed
```

### Step 2: User Login
```
1. User visits /auth/login (or gets redirected here)
2. Fills form: email, password
3. POST /login → json-server-auth
4. Server validates credentials from db.json
5. Returns: { accessToken: "JWT_TOKEN", user: {...} }
6. AuthService stores:
   - localStorage.setItem('token', accessToken)
   - localStorage.setItem('user', JSON.stringify(user))
7. Redirect to /feed (or returnUrl if set)
```

### Step 3: Accessing Protected Routes
```
1. User navigates to /feed
2. authGuard checks: authService.isLoggedIn()
3. If token exists → Allow access
4. If no token → Redirect to /auth/login?returnUrl=/feed
```

### Step 4: API Requests
```
1. Component calls memeService.loadPosts()
2. HTTP request to GET /posts
3. AuthInterceptor adds header:
   Authorization: Bearer <JWT_TOKEN>
4. json-server-auth validates token
5. Returns posts data
6. Component displays memes
```

### Step 5: User-Specific Data
```
Each user sees:
- All posts (from all users)
- Their own likes/bookmarks highlighted
- Only their own posts can be edited/deleted
- Admins can see deleted posts and moderation panel
```

## 🧪 Test Credentials

```javascript
// Regular User
Email: user1@example.com
Password: password

// Admin User
Email: admin@example.com
Password: admin
```

## 🚀 How to Test

1. **Start Backend**:
   ```bash
   node server.js
   ```

2. **Start Frontend**:
   ```bash
   ng serve
   ```

3. **Test Flow**:
   - Open http://localhost:4200
   - Should redirect to /auth/login
   - Try logging in with test credentials
   - After login, you'll see the feed with all memes
   - Token is stored in browser localStorage
   - Refresh page → Still logged in (token persists)
   - Logout → Token cleared, redirected to login

## 📊 Data Flow

```
User Login
    ↓
Token Generated (Backend)
    ↓
Token Stored (localStorage)
    ↓
Protected Routes Accessible
    ↓
API Calls Include Token
    ↓
Backend Validates Token
    ↓
User-Specific Data Returned
```

## 🔒 Security Features

✅ JWT token-based authentication
✅ Protected routes with guards
✅ Automatic token injection via interceptor
✅ 401 error handling (auto-logout)
✅ Role-based access (admin vs user)
✅ Return URL preservation
✅ Token persistence across page refreshes

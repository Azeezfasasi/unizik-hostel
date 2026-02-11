# Authentication API Quick Reference

## Base URL
`http://localhost:3000/api` (development)

## Auth Endpoints

### 1. Register User
```
POST /auth/register
Content-Type: application/json

Request Body:
{
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match password)"
}

Response (201):
{
  "success": true,
  "message": "Registration successful. Please check your email to verify.",
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "email": "...",
    "role": "user",
    "isEmailVerified": false,
    "isActive": true
  }
}
```

### 2. Login User
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "string (required)",
  "password": "string (required)"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {...}
}

Error Responses:
- 401: Invalid credentials
- 423: Account locked (5 failed attempts)
- 403: Account disabled/suspended
```

### 3. Verify Email
```
POST /auth/verify-email
Content-Type: application/json

Request Body:
{
  "token": "string (required, from email link)"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully"
}

Error:
- 400: Invalid or expired token
```

### 4. Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "string (required)"
}

Response (200):
{
  "success": true,
  "message": "Password reset email sent. Check your inbox."
}

Error:
- 404: User not found
```

### 5. Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Request Body:
{
  "token": "string (required, from email)",
  "password": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match)"
}

Response (200):
{
  "success": true,
  "message": "Password reset successful",
  "token": "eyJhbGc...",
  "user": {...}
}

Error:
- 400: Invalid/expired token or passwords don't match
```

### 6. Get User Profile
```
GET /auth/profile
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "user": {...}
}

Error:
- 401: No token/Invalid token
- 404: User not found
```

### 7. Update User Profile
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

Request Body (all optional):
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "company": "string",
  "department": "string",
  "position": "string",
  "avatar": "string"
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {...}
}
```

### 8. Change Password
```
POST /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)",
  "confirmPassword": "string (required, must match)"
}

Response (200):
{
  "success": true,
  "message": "Password updated successfully"
}

Error:
- 401: Current password incorrect
```

### 9. Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

## User Management Endpoints (Admin Only)

### 10. Get All Users
```
GET /users?page=1&limit=10&role=user&isActive=true
Authorization: Bearer {admin_token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- role: "user" | "admin" | "manager" (optional)
- isActive: "true" | "false" (optional)

Response (200):
{
  "success": true,
  "total": 25,
  "page": 1,
  "pages": 3,
  "users": [
    {
      "id": "...",
      "firstName": "...",
      "lastName": "...",
      "email": "...",
      "role": "user",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "..."
    },
    ...
  ]
}

Error:
- 403: Not admin
```

### 11. Get User By ID
```
GET /users/{userId}
Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "user": {...}
}

Error:
- 404: User not found
- 403: Not admin
```

### 12. Update User (Admin)
```
PUT /users/{userId}
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body (all optional, cannot update password/email):
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "company": "string",
  "department": "string",
  "position": "string",
  "avatar": "string",
  "notes": "string"
}

Response (200):
{
  "success": true,
  "message": "User updated successfully",
  "user": {...}
}
```

### 13. Change User Role
```
PUT /users/{userId}/role
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "role": "user" | "admin" | "manager" (required),
  "permissions": ["create_blog", "edit_blog", ...] (optional)
}

Available Permissions:
- create_blog
- edit_blog
- delete_blog
- view_users
- manage_users
- manage_quotes
- manage_contacts
- view_reports
- admin_panel

Response (200):
{
  "success": true,
  "message": "User role updated successfully",
  "user": {...}
}
```

### 14. Toggle User Status
```
PUT /users/{userId}/status
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "isActive": true | false (required)
}

Response (200):
{
  "success": true,
  "message": "User enabled/disabled successfully",
  "user": {...}
}
```

### 15. Admin Reset Password
```
POST /users/{userId}/reset-password
Authorization: Bearer {admin_token}
Content-Type: application/json

Request Body:
{
  "newPassword": "string (required, min 6 chars)"
}

Response (200):
{
  "success": true,
  "message": "User password reset successfully",
  "temporaryPassword": "newPassword123"
}

Note: Email sent to user with temporary password
```

### 16. Delete User (Soft Delete)
```
DELETE /users/{userId}
Authorization: Bearer {admin_token}

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}

Note: Marks user as deleted but doesn't remove from database
```

## Error Response Format
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (optional)"
}
```

## HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (invalid/missing token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (email exists)
- 423: Locked (account locked)
- 500: Server Error

## Authentication Header Format
All protected endpoints require:
```
Authorization: Bearer {jwt_token}
```

## Pagination
For endpoints with pagination:
- Default page: 1
- Default limit: 10
- Response includes: total, page, pages, data array

Example:
```javascript
const response = await fetch(
  "/api/users?page=2&limit=20&role=admin",
  {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  }
);
```

## Rate Limiting (Recommended Implementation)
Consider implementing:
- Login attempts: 5 per 15 minutes per IP
- Password reset: 3 per hour per email
- General API: 100 requests per minute per user

## Security Headers (Recommended)
Add to Next.js:
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HTTPS only)

## Token Expiration
- Default: 7 days
- Configurable via JWT_EXPIRE env variable
- Format: 7d, 24h, 1w, etc. (ms library format)

## Session Management
- Tokens are stateless (JWT)
- No server-side session storage
- Client must store token (localStorage/sessionStorage/httpOnly cookie)
- Logout just removes token from client

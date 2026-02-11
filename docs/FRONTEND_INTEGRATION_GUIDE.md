# Frontend Integration Guide - Authentication System

## Quick Start

### 1. Install Required Dependencies
```bash
npm install jsonwebtoken axios
# OR
yarn add jsonwebtoken axios
```

### 2. Create Authentication Context
Create `src/context/AuthContext.js`:

```javascript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
      fetchUserProfile(savedToken);
    }
    setLoading(false);
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (firstName, lastName, email, password, confirmPassword) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
```

### 3. Wrap App with AuthProvider
Update `src/app/layout.js`:

```javascript
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Rayob Engineering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Create Login Component
Update or create `src/components/home-component/LoginComponent.js`:

```javascript
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginComponent() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### 5. Create Registration Component
Create `src/components/auth/RegisterComponent.js`:

```javascript
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterComponent() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const result = await register(
      formData.firstName,
      formData.lastName,
      formData.email,
      formData.password,
      formData.confirmPassword
    );

    if (result.success) {
      router.push("/verify-email");
    } else {
      setError(result.message || "Registration failed");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      {error && <div className="error">{error}</div>}
      
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
```

### 6. Create Protected Route Component
Create `src/components/auth/ProtectedRoute.js`:

```javascript
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    } else if (!loading && requiredRole && user?.role !== requiredRole) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, loading, requiredRole, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return children;
}
```

### 7. Usage Examples

**In a Page:**
```javascript
"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1>Welcome, {user?.firstName}!</h1>
        <button onClick={logout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
```

**Admin Only Page:**
```javascript
"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Admin Dashboard</div>
    </ProtectedRoute>
  );
}
```

## API Usage Examples

### Login
```javascript
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "password" }),
});
const data = await response.json();
// data: { success: true, token: "...", user: {...} }
```

### Protected Request
```javascript
const response = await fetch("/api/auth/profile", {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});
```

### Get All Users (Admin)
```javascript
const response = await fetch("/api/users?page=1&limit=10", {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});
```

### Change User Role (Admin)
```javascript
const response = await fetch("/api/users/userId/role", {
  method: "PUT",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    role: "manager",
    permissions: ["view_users", "manage_users"],
  }),
});
```

## Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Security Tips

1. **Token Storage**: Currently using localStorage. For enhanced security, consider:
   - HTTP-only cookies via Set-Cookie header
   - SessionStorage for temporary tokens
   - IndexedDB for larger data

2. **CORS**: Configure CORS in Next.js if needed

3. **Rate Limiting**: Implement rate limiting on auth endpoints

4. **HTTPS**: Always use HTTPS in production

5. **Token Refresh**: Implement refresh token rotation (optional)

## Troubleshooting

**Issue**: "No token provided" error
- Solution: Ensure token is being sent in Authorization header with "Bearer " prefix

**Issue**: "Invalid token" error
- Solution: Check JWT_SECRET matches between backend and frontend

**Issue**: Email not sending
- Solution: Check SMTP credentials in .env.local and email service settings

**Issue**: CORS errors
- Solution: Ensure API routes are in `/api` directory for Next.js to handle CORS automatically

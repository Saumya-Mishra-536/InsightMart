import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import './auth.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Login failed')

      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      const role = data?.user?.role || 'customer'
      if (role === 'seller') {
        navigate('/seller/dashboard')
      } else {
        navigate('/customer/home')
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server not reachable' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page animate-fade-in">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue to InsightMart</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <div className="form-actions">
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn-auth"
              isLoading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            className="social-btn"
            onClick={() => {
              window.location.href = `${API_BASE}/api/auth/google`
            }}
          >
            <span className="icon">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="#000" fillRule="evenodd">
                  <path d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.42 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" fill="#EA4335" />
                  <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.08-1.84 2.66l2.84 2.2c2.01-1.85 3.17-4.57 3.17-7.36z" fill="#4285F4" />
                  <path d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" fill="#FBBC05" />
                  <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z" fill="#34A853" />
                </g>
              </svg>
            </span>
            <span>Continue with Google</span>
          </button>

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="link-primary">Create an account</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

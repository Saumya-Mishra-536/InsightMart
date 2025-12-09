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

          <div className="auth-footer">
            <span>Don't have an account?</span>
            <Link to="/signup" className="link-primary">Create an account</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import './auth.css'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'customer' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('Please fill all required fields')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role })
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Signup failed')

      // Automatically log in the user after successful signup
      if (data?.token && data?.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        const role = data.user.role || 'customer'
        if (role === 'seller') {
          navigate('/seller/dashboard')
        } else {
          navigate('/customer/home')
        }
      } else {
        // Fallback: if token is not provided, redirect to login
        navigate('/login')
      }
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Server not reachable' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ show }) => (
    show ? (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ) : (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    )
  )

  return (
    <div className="auth-page animate-fade-in">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <Card className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Join InsightMart today</p>
          </div>

          <button
            className="social-btn"
            onClick={() => {
              const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
              window.location.href = `${apiUrl}/api/auth/google`
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
            <span>Sign up with Google</span>
          </button>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={update('name')}
              required
            />

            <div className="input-group">
              <label className="input-label">I am a</label>
              <select
                className="input-field"
                value={form.role}
                onChange={update('role')}
                style={{ appearance: 'none', backgroundImage: 'none' }}
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={update('email')}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                }
              />
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.confirm}
                onChange={update('confirm')}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                }
              />
            </div>

            <div className="policy" style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <input id="agree" type="checkbox" required style={{ accentColor: 'var(--primary)' }} />
              <label htmlFor="agree">I agree to the Terms and Privacy Policy</label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="btn-auth"
              isLoading={loading}
            >
              Create Account
            </Button>
          </form>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="link-primary">Sign in</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

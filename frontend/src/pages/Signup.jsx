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
      console.log(API_BASE)
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

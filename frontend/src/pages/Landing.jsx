import React, { useEffect } from 'react'
import './landing.css'
import { Link, useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to products if already logged in
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/products')
    }
  }, [navigate])

  return (
    <div className="landing">
      <header className="nav">
        <div className="nav__brand">
          <div className="nav__logo" aria-hidden="true">⋔</div>
          <span className="nav__title">InsightMart</span>
        </div>
      </header>

      <main className="hero">
        <h1 className="hero__title">
          Your e-commerce dashboard for smarter, data-driven selling.
        </h1>
        <div className="hero__actions">
          <Link to="/login" className="btn btn--primary">Get Started</Link>
        </div>
      </main>

      <div className="bg bg--glow-1" />
      <div className="bg bg--glow-2" />
      <div className="bg bg--sheen" />
    </div>
  )
}



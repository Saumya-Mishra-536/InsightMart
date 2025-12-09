import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import './cart.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [])

  async function fetchCart() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/cart/my-cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load cart')
      setCart(data.cart || { items: [] })
    } catch (err) {
      setError(err.message || 'Failed to load cart')
      setCart({ items: [] })
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(productId, quantity) {
    if (quantity < 1) return
    try {
      const res = await fetch(`${API_BASE}/api/cart/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Failed to update cart')
        return
      }
      await fetchCart() // Re-fetch to get populated product data
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to update cart')
    }
  }

  async function removeItem(productId) {
    try {
      const res = await fetch(`${API_BASE}/api/cart/remove`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to remove item')
      setCart(data.cart)
    } catch (err) {
      setError(err.message || 'Failed to remove item')
    }
  }

  async function placeOrder() {
    if (!cart || !cart.items || cart.items.length === 0) return
    try {
      setPlacingOrder(true)
      setError('')
      const products = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }))
      const res = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ products })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to place order')

      // Cart is cleared server-side after order; refresh it
      await fetchCart()
      navigate('/customer/orders')
    } catch (err) {
      setError(err.message || 'Failed to place order')
    } finally {
      setPlacingOrder(false)
    }
  }

  const items = cart?.items || []
  const total = items.reduce((sum, item) => {
    const p = item.product
    if (!p) return sum
    const finalPrice = p.price * (1 - (p.discount || 0) / 100)
    return sum + finalPrice * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page animate-fade-in">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="cart-container">
        <div className="cart-header">
          <h1 className="page-title">My Cart</h1>
          <Link to="/customer/home" className="btn-link">← Continue Shopping</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {items.length === 0 ? (
          <Card className="empty-cart-card">
            <div className="empty-state">
              <span className="emoji-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </span>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added anything to your cart yet.</p>
              <Link to="/customer/home">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map(item => {
                const p = item.product
                if (!p) return null
                const finalPrice = p.price * (1 - (p.discount || 0) / 100)
                return (
                  <Card key={p._id} className="cart-item-card">
                    <div className="cart-item-image">
                      {p.image ? (
                        <img src={p.image} alt={p.name} />
                      ) : (
                        <span className="emoji-icon-small">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <h3 className="cart-item-title">{p.name}</h3>
                        <span className="cart-item-price">${finalPrice.toFixed(2)}</span>
                      </div>
                      <div className="cart-item-meta">
                        <span>SKU: {p.sku}</span>
                        <span>{p.category}</span>
                      </div>

                      <div className="cart-item-actions">
                        <div className="quantity-selector small">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(p._id, item.quantity - 1)}
                          >−</button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(p._id, item.quantity + 1)}
                          >+</button>
                        </div>
                        <button
                          className="btn-remove"
                          onClick={() => removeItem(p._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">
                      ${(finalPrice * item.quantity).toFixed(2)}
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="cart-summary">
              <Card className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button
                  variant="primary"
                  className="btn-checkout"
                  onClick={placeOrder}
                  isLoading={placingOrder}
                  disabled={items.length === 0}
                >
                  Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './products.css'

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
      if (!res.ok) throw new Error(data.message || 'Failed to update cart')
      setCart(data.cart)
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

  return (
    <div className="products-page">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <header className="products-header">
        <div className="header-content">
          <h1 className="header-title">My Cart</h1>
          <div className="header-actions">
            <Link to="/customer/home" className="btn-dashboard">← Continue Shopping</Link>
          </div>
        </div>
      </header>

      <main className="products-main">
        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading cart...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty.</p>
            <Link to="/customer/home" className="btn-visualize">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {items.map(item => {
                const p = item.product
                if (!p) return null
                const finalPrice = p.price * (1 - (p.discount || 0) / 100)
                return (
                  <div key={p._id} className="product-card">
                    <div className="product-header">
                      <h3 className="product-name">{p.name}</h3>
                    </div>
                    <div className="product-sku">SKU: {p.sku}</div>
                    <div className="product-category">{p.category}</div>
                    <div className="product-price">
                      ${finalPrice.toFixed(2)} x {item.quantity}
                    </div>
                    <div className="product-price">
                      Line total: ${(finalPrice * item.quantity).toFixed(2)}
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn-clear"
                        onClick={() => updateQuantity(p._id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span style={{ margin: '0 8px' }}>{item.quantity}</span>
                      <button
                        className="btn-clear"
                        onClick={() => updateQuantity(p._id, item.quantity + 1)}
                      >
                        +
                      </button>
                      <button
                        className="btn-logout"
                        style={{ marginLeft: 'auto' }}
                        onClick={() => removeItem(p._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pagination" style={{ justifyContent: 'space-between' }}>
              <div className="pagination-info">
                Total: ${total.toFixed(2)}
              </div>
              <button
                className="pagination-btn"
                onClick={placeOrder}
                disabled={placingOrder || items.length === 0}
              >
                {placingOrder ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}



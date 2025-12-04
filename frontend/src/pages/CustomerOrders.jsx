import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './products.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function CustomerOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load orders')
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="products-page">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <header className="products-header">
        <div className="header-content">
          <h1 className="header-title">My Orders</h1>
          <div className="header-actions">
            <Link to="/customer/home" className="btn-dashboard">← Back to Products</Link>
          </div>
        </div>
      </header>

      <main className="products-main">
        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>You have no orders yet.</p>
            <Link to="/customer/home" className="btn-visualize">Start Shopping</Link>
          </div>
        ) : (
          <div className="products-grid">
            {orders.map(order => (
              <div key={order._id} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">Order #{order._id.slice(-6)}</h3>
                </div>
                <div className="product-category">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="product-price">
                  Total: ${order.totalAmount?.toFixed(2) ?? '0.00'}
                </div>
                <div className="sales-list">
                  {order.products?.map((item, idx) => (
                    <div key={idx} className="sales-item" style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const productId = item.product?._id || item.product
                        if (productId) navigate(`/customer/products/${productId}`)
                      }}
                    >
                      <span className="sales-month">
                        {item.product?.name || 'Product'}
                      </span>
                      <span className="sales-amount">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}



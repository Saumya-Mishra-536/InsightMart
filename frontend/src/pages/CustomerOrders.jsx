import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import './orders.css'

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

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page animate-fade-in">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="orders-container">
        <div className="orders-header">
          <h1 className="page-title">My Orders</h1>
          <Link to="/customer/home" className="btn-link">← Back to Products</Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {orders.length === 0 ? (
          <Card className="empty-orders-card">
            <div className="empty-state">
              <span className="emoji-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </span>
              <h3>You have no orders yet</h3>
              <p>Start shopping to see your orders here.</p>
              <Link to="/customer/home">
                <Button variant="primary">Start Shopping</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <Card key={order._id} className="order-card" hover>
                <div className="order-header">
                  <div className="order-id">
                    <span className="label">Order ID</span>
                    <span className="value">#{order._id.slice(-6)}</span>
                  </div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="order-items">
                  {order.products?.map((item, idx) => (
                    <div
                      key={idx}
                      className="order-item"
                      onClick={() => {
                        const productId = item.product?._id || item.product
                        if (productId) navigate(`/customer/products/${productId}`)
                      }}
                    >
                      <div className="item-info">
                        <span className="item-name">{item.product?.name || 'Product'}</span>
                        <span className="item-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    <span className="label">Total Amount</span>
                    <span className="value">${order.totalAmount?.toFixed(2) ?? '0.00'}</span>
                  </div>
                  <div className="order-status">
                    <span className="status-badge">Completed</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



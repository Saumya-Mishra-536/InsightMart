import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './productDetail.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch product')

      setProduct(data.product)
    } catch (err) {
      setError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      setDeleting(true)
      const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete product')

      navigate('/seller/products')
    } catch (err) {
      setError(err.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading">Loading product...</div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="error">{error || 'Product not found'}</div>
        <Link to="/products" className="btn-back">Back to Products</Link>
      </div>
    )
  }

  const finalPrice = product.price * (1 - (product.discount || 0) / 100)

  return (
    <div className="product-detail-page">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="detail-container">
        <div className="detail-header">
          <Link to="/seller/products" className="btn-back">← Back to Products</Link>
          {user?.role === 'seller' && (
            <div className="detail-actions">
              <Link to={`/seller/products/${id}/edit`} className="btn-edit">Edit</Link>
              <button onClick={handleDelete} disabled={deleting} className="btn-delete">
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <div className="detail-content">
          <div className="detail-main">
            <div className="product-title-section">
              <h1 className="product-title">{product.name}</h1>
              {product.discount > 0 && (
                <span className="discount-badge-large">-{product.discount}% OFF</span>
              )}
            </div>

            <div className="product-info-grid">
              <div className="info-item">
                <label>SKU</label>
                <div className="info-value">{product.sku}</div>
              </div>

              <div className="info-item">
                <label>Category</label>
                <div className="info-value">{product.category}</div>
              </div>

              <div className="info-item">
                <label>Rating</label>
                <div className="info-value">
                  {'⭐'.repeat(Math.floor(product.rating || 0))} {product.rating || 0}/5
                </div>
              </div>

              <div className="info-item">
                <label>Reviews</label>
                <div className="info-value">{product.reviews || 0}</div>
              </div>
            </div>

            <div className="price-section">
              <div className="price-final">${finalPrice.toFixed(2)}</div>
              {product.discount > 0 && (
                <div className="price-original">${product.price.toFixed(2)}</div>
              )}
              {product.discount > 0 && (
                <div className="discount-amount">You save ${(product.price - finalPrice).toFixed(2)}</div>
              )}
            </div>

            {product.monthlySales && product.monthlySales.length > 0 && (
              <div className="sales-section">
                <h3>Monthly Sales</h3>
                <div className="sales-list">
                  {product.monthlySales.map((sale, idx) => (
                    <div key={idx} className="sales-item">
                      <span className="sales-month">{sale.month}</span>
                      <span className="sales-amount">{sale.sales} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="meta-info">
              <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
              <div>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


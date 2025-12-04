import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import './productDetail.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function CustomerProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [cartLoading, setCartLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)

  const [reviews, setReviews] = useState([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [reviewError, setReviewError] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    fetchProduct()
    fetchReviews()
  }, [id])

  async function fetchProduct() {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/products/public/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch product')
      setProduct(data.product)
    } catch (err) {
      setError(err.message || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  async function fetchReviews() {
    try {
      setReviewLoading(true)
      setReviewError('')
      const res = await fetch(`${API_BASE}/api/reviews/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews')
      setReviews(data.reviews || [])
    } catch (err) {
      setReviewError(err.message || 'Failed to load reviews')
      setReviews([])
    } finally {
      setReviewLoading(false)
    }
  }

  async function handleAddToCart() {
    try {
      setCartLoading(true)
      setError('')
      const res = await fetch(`${API_BASE}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: id, quantity: Number(quantity) || 1 })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to add to cart')
    } catch (err) {
      setError(err.message || 'Failed to add to cart')
    } finally {
      setCartLoading(false)
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    try {
      setSubmittingReview(true)
      setReviewError('')
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: id,
          rating: Number(rating),
          comment
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to submit review')
      setComment('')
      await fetchReviews()
      await fetchProduct()
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete review')
      await fetchReviews()
      await fetchProduct()
    } catch (err) {
      setReviewError(err.message || 'Failed to delete review')
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
        <Link to="/customer/home" className="btn-back">Back to Products</Link>
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
          <Link to="/customer/home" className="btn-back">← Back to Products</Link>
          <div className="detail-actions">
            <Link to="/customer/cart" className="btn-edit">Go to Cart</Link>
          </div>
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

            <div className="meta-info">
              <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
              <div>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
            </div>

            <div className="price-section" style={{ marginTop: '24px' }}>
              <label>
                Quantity:{' '}
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  style={{ width: '80px', marginLeft: '8px' }}
                />
              </label>
              <button
                className="btn-edit"
                style={{ marginLeft: '16px' }}
                onClick={handleAddToCart}
                disabled={cartLoading}
              >
                {cartLoading ? 'Adding…' : 'Add to Cart'}
              </button>
            </div>

            {/* Reviews section */}
            <div className="sales-section" style={{ marginTop: '32px' }}>
              <h3>Customer Reviews</h3>

              {reviewError && <div className="error">{reviewError}</div>}

              {reviewLoading ? (
                <div className="loading">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <p>No reviews yet. Be the first to review this product.</p>
              ) : (
                <div className="sales-list">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="sales-item">
                      <span className="sales-month">
                        {rev.user?.name || 'Anonymous'} – {'⭐'.repeat(rev.rating)} ({rev.rating}/5)
                      </span>
                      <span className="sales-amount">
                        {rev.comment || ''}
                        {rev.user?._id === user?.id && (
                          <button
                            className="btn-clear"
                            style={{ marginLeft: '8px' }}
                            onClick={() => handleDeleteReview(rev._id)}
                          >
                            Delete
                          </button>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmitReview} style={{ marginTop: '16px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <label>
                    Rating:{' '}
                    <select value={rating} onChange={e => setRating(e.target.value)}>
                      {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <textarea
                    rows={3}
                    placeholder="Write your review..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <button
                  className="btn-edit"
                  type="submit"
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



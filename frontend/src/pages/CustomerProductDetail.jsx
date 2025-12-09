import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
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
      navigate('/customer/cart')
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
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="alert alert-error">{error || 'Product not found'}</div>
        <Link to="/customer/home" className="btn btn-secondary">Back to Products</Link>
      </div>
    )
  }

  const finalPrice = product.price * (1 - (product.discount || 0) / 100)

  return (
    <div className="product-detail-page animate-fade-in">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <div className="detail-container">
        <div className="detail-header">
          <Link to="/customer/home" className="btn-back">← Back to Products</Link>
        </div>

        <div className="detail-content-grid">
          {/* Product Image & Info */}
          <Card className="product-main-card">
            <div className="product-header-row">
              <h1 className="product-title">{product.name}</h1>
              {product.discount > 0 && (
                <span className="discount-badge-large">-{product.discount}% OFF</span>
              )}
            </div>

            <div className="product-meta-row">
              <span className="product-category-tag">{product.category}</span>
              <span className="product-sku">SKU: {product.sku}</span>
            </div>

            <div className="product-rating-large">
              {'⭐'.repeat(Math.floor(product.rating || 0))}
              <span className="rating-text">({product.reviews || 0} reviews)</span>
            </div>

            <div className="price-section">
              <div className="price-row">
                <span className="price-final">${finalPrice.toFixed(2)}</span>
                {product.discount > 0 && (
                  <span className="price-original">${product.price.toFixed(2)}</span>
                )}
              </div>
              {product.discount > 0 && (
                <div className="discount-amount">You save ${(product.price - finalPrice).toFixed(2)}</div>
              )}
              <div className="stock-info">
                {product.stock === 0 ? (
                  <span className="out-of-stock-text">Sorry, this item is currently out of stock</span>
                ) : (
                  <span className="in-stock-text">
                    {product.stock <= 5
                      ? `Only ${product.stock} left in stock - order soon!`
                      : `${product.stock} in stock`}
                  </span>
                )}
              </div>
            </div>

            <div className="add-to-cart-section">
              {product.stock > 0 ? (
                <>
                  <div className="quantity-selector">
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >−</button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="qty-input"
                    />
                    <button
                      className="qty-btn"
                      onClick={() => setQuantity(quantity + 1)}
                    >+</button>
                  </div>
                  <Button
                    variant="primary"
                    className="btn-add-cart"
                    onClick={handleAddToCart}
                    isLoading={cartLoading}
                  >
                    Add to Cart
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="btn-add-cart btn-disabled"
                  disabled
                >
                  Out of Stock
                </Button>
              )}
            </div>

            <div className="meta-info">
              <div>Created: {new Date(product.createdAt).toLocaleDateString()}</div>
              <div>Last Updated: {new Date(product.updatedAt).toLocaleDateString()}</div>
            </div>
          </Card>

          {/* Reviews Section */}
          <div className="reviews-section">
            <Card className="reviews-card">
              <h3>Customer Reviews</h3>

              {reviewError && <div className="alert alert-error">{reviewError}</div>}

              <div className="reviews-list">
                {reviewLoading ? (
                  <div className="loading-small">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to review this product.</p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="review-item">
                      <div className="review-header">
                        <span className="review-author">{rev.user?.name || 'Anonymous'}</span>
                        <span className="review-rating">{'⭐'.repeat(rev.rating)}</span>
                      </div>
                      <p className="review-comment">{rev.comment}</p>
                      {rev.user?._id === user?.id && (
                        <button
                          className="btn-delete-review"
                          onClick={() => handleDeleteReview(rev._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmitReview} className="review-form">
                <h4>Write a Review</h4>
                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-select">
                    {[5, 4, 3, 2, 1].map(r => (
                      <label key={r} className={`rating-option ${rating === r ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="rating"
                          value={r}
                          checked={rating === r}
                          onChange={() => setRating(r)}
                        />
                        {r} ⭐
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="input-field textarea"
                  />
                </div>
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={submittingReview}
                  disabled={!comment.trim()}
                >
                  Submit Review
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



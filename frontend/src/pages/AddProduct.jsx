import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './addProduct.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    price: '',
    discount: '',
    category: '',
    rating: '',
    reviews: '',
  })
  const [errors, setErrors] = useState({})

  const token = localStorage.getItem('token')

  React.useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  function update(field) {
    return (e) => {
      const value = e.target.value
      setForm({ ...form, [field]: value })
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: '' })
      }
      setError('')
    }
  }

  function validateForm() {
    const newErrors = {}
    
    if (!form.name.trim()) {
      newErrors.name = 'Product name is required'
    }
    
    if (!form.sku.trim()) {
      newErrors.sku = 'SKU is required'
    } else if (form.sku.length < 3) {
      newErrors.sku = 'SKU must be at least 3 characters'
    }
    
    if (!form.price || parseFloat(form.price) <= 0) {
      newErrors.price = 'Valid price is required (must be greater than 0)'
    }
    
    if (form.discount && (parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100)) {
      newErrors.discount = 'Discount must be between 0 and 100'
    }
    
    if (!form.category.trim()) {
      newErrors.category = 'Category is required'
    }
    
    if (form.rating && (parseFloat(form.rating) < 0 || parseFloat(form.rating) > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5'
    }
    
    if (form.reviews && parseInt(form.reviews) < 0) {
      newErrors.reviews = 'Reviews cannot be negative'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) {
      setError('Please fix the errors below')
      return
    }

    try {
      setLoading(true)
      const productData = {
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        price: parseFloat(form.price),
        discount: form.discount ? parseFloat(form.discount) : 0,
        category: form.category.trim(),
        rating: form.rating ? parseFloat(form.rating) : 0,
        reviews: form.reviews ? parseInt(form.reviews) : 0,
      }

      const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to create product')

      setSuccess(true)
      setTimeout(() => {
        navigate('/seller/products')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product-page">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <main className="add-product-card">
        <div className="card-header">
          <Link to="/seller/products" className="btn-back">
            <span className="back-icon">←</span> Back to Products
          </Link>
          <div className="title-section">
            <h1 className="title">Add New Product</h1>
            <p className="subtitle">Fill in the details to add a new product to your inventory</p>
          </div>
        </div>

        {success && (
          <div className="success-message">
            <span className="success-icon">✓</span>
            Product created successfully! Redirecting...
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <label className={`field ${errors.name ? 'field-error' : ''}`}>
              <span className="label-text">
                Product Name <span className="required">*</span>
              </span>
              <input
                type="text"
                placeholder="e.g., Premium Wireless Headphones"
                className="input"
                value={form.name}
                onChange={update('name')}
                required
              />
              {errors.name && <span className="field-error-text">{errors.name}</span>}
            </label>

            <label className={`field ${errors.sku ? 'field-error' : ''}`}>
              <span className="label-text">
                SKU (Stock Keeping Unit) <span className="required">*</span>
              </span>
              <input
                type="text"
                placeholder="e.g., PROD-001"
                className="input"
                value={form.sku}
                onChange={update('sku')}
                required
                style={{ textTransform: 'uppercase' }}
              />
              {errors.sku && <span className="field-error-text">{errors.sku}</span>}
            </label>

            <label className={`field ${errors.category ? 'field-error' : ''}`}>
              <span className="label-text">
                Category <span className="required">*</span>
              </span>
              <input
                type="text"
                placeholder="e.g., Electronics, Clothing, Books"
                className="input"
                value={form.category}
                onChange={update('category')}
                required
              />
              {errors.category && <span className="field-error-text">{errors.category}</span>}
            </label>
          </div>

          <div className="form-section">
            <h3 className="section-title">Pricing & Discount</h3>
            
            <div className="row two-cols">
              <label className={`field ${errors.price ? 'field-error' : ''}`}>
                <span className="label-text">
                  Price ($) <span className="required">*</span>
                </span>
                <div className="input-wrapper">
                  <span className="input-prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="input input-with-prefix"
                    value={form.price}
                    onChange={update('price')}
                    min="0"
                    required
                  />
                </div>
                {errors.price && <span className="field-error-text">{errors.price}</span>}
              </label>

              <label className={`field ${errors.discount ? 'field-error' : ''}`}>
                <span className="label-text">Discount (%)</span>
                <div className="input-wrapper">
                  <input
                    type="number"
                    placeholder="0"
                    className="input"
                    value={form.discount}
                    onChange={update('discount')}
                    min="0"
                    max="100"
                  />
                  <span className="input-suffix">%</span>
                </div>
                {errors.discount && <span className="field-error-text">{errors.discount}</span>}
              </label>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Ratings & Reviews</h3>
            
            <div className="row two-cols">
              <label className={`field ${errors.rating ? 'field-error' : ''}`}>
                <span className="label-text">Rating (0-5)</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="input"
                  value={form.rating}
                  onChange={update('rating')}
                  min="0"
                  max="5"
                />
                {errors.rating && <span className="field-error-text">{errors.rating}</span>}
              </label>

              <label className={`field ${errors.reviews ? 'field-error' : ''}`}>
                <span className="label-text">Number of Reviews</span>
                <input
                  type="number"
                  placeholder="0"
                  className="input"
                  value={form.reviews}
                  onChange={update('reviews')}
                  min="0"
                />
                {errors.reviews && <span className="field-error-text">{errors.reviews}</span>}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/seller/products" className="btn-cancel">
              Cancel
            </Link>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="btn-icon">+</span>
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

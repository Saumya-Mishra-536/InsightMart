import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './products.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function CustomerHome() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minDiscount, setMinDiscount] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [rating, setRating] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 8

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const prevFilters = useRef('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const currentFilters = `${search}-${category}-${minPrice}-${maxPrice}-${minDiscount}-${maxDiscount}-${rating}-${sortBy}-${sortOrder}`

    if (prevFilters.current && prevFilters.current !== currentFilters) {
      setPage(1)
    }

    prevFilters.current = currentFilters
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, minPrice, maxPrice, minDiscount, maxDiscount, rating, sortBy, sortOrder, page, token])

  async function fetchProducts() {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)
      if (minDiscount) params.append('minDiscount', minDiscount)
      if (maxDiscount) params.append('maxDiscount', maxDiscount)
      if (rating) params.append('rating', rating)
      if (sortBy) params.append('sortBy', sortBy)
      if (sortOrder) params.append('sortOrder', sortOrder)
      params.append('page', page)
      params.append('limit', limit)

      const res = await fetch(`${API_BASE}/api/products/public?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products')

      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  function clearFilters() {
    setSearch('')
    setCategory('')
    setMinPrice('')
    setMaxPrice('')
    setMinDiscount('')
    setMaxDiscount('')
    setRating('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setPage(1)
  }

  const categories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  )

  return (
    <div className="products-page">
      <div className="orb orb--pink" />
      <div className="orb orb--gray" />

      <header className="products-header">
        <div className="header-content">
          <h1 className="header-title">Browse Products</h1>
          <div className="header-actions">
            <Link to="/customer/cart" className="btn-dashboard">🛒 Cart</Link>
            <Link to="/customer/orders" className="btn-add">📦 My Orders</Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.name || 'Customer'}</span>
        </div>
      </header>

      <main className="products-main">
        <div className="filters-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name or SKU..."
              className="input-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filters-grid">
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Price"
              className="filter-input"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
            />

            <input
              type="number"
              placeholder="Max Price"
              className="filter-input"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
            />

            <input
              type="number"
              placeholder="Min Discount %"
              className="filter-input"
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
              min="0"
              max="100"
            />

            <input
              type="number"
              placeholder="Max Discount %"
              className="filter-input"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
              min="0"
              max="100"
            />

            <select
              className="filter-select"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>

            <select
              className="filter-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <option value="createdAt-desc">Latest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-asc">Rating: Low to High</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>

            <button onClick={clearFilters} className="btn-clear">Clear Filters</button>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found.</p>
          </div>
        ) : (
          <>
            <div className="products-grid">
              {products.map(product => (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => navigate(`/customer/products/${product._id}`)}
                >
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    {product.discount > 0 && (
                      <span className="discount-badge">-{product.discount}%</span>
                    )}
                  </div>
                  <div className="product-sku">SKU: {product.sku}</div>
                  <div className="product-category">{product.category}</div>
                  <div className="product-rating">
                    {'⭐'.repeat(Math.floor(product.rating || 0))} {product.rating || 0}/5
                  </div>
                  <div className="product-price">
                    ${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
                    {product.discount > 0 && (
                      <span className="original-price">${product.price.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="product-reviews">{product.reviews || 0} reviews</div>
                </div>
              ))}
            </div>

            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}



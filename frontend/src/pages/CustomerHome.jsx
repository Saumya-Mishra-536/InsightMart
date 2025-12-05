import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
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
    <div className="products-page animate-fade-in">
      <div className="dashboard-header-section">
        <div>
          <h1 className="page-title">Browse Products</h1>
          <p className="page-subtitle">Discover amazing deals and new arrivals</p>
        </div>
        <div className="header-actions">
          <Link to="/customer/cart" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            View Cart
          </Link>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <Card className="filters-card">
            <div className="filters-header">
              <h3>Filters</h3>
              <button onClick={clearFilters} className="btn-link">Clear All</button>
            </div>

            <div className="filter-group">
              <label>Search</label>
              <Input
                type="text"
                placeholder="Name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="range-inputs">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Discount %</label>
              <div className="range-inputs">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(e.target.value)}
                  min="0"
                  max="100"
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Rating</label>
              <select
                className="input-field"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                className="input-field"
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
            </div>
          </Card>
        </aside>

        {/* Product Grid */}
        <div className="products-content">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products found matching your criteria.</p>
              <Button variant="secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => (
                  <Card key={p._id} className="product-card" hover>
                    <div className="product-image-container">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="product-image" />
                      ) : (
                        <div className="product-placeholder">
                          <span className="emoji-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                              <line x1="3" y1="6" x2="21" y2="6"></line>
                              <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                          </span>
                        </div>
                      )}
                      {p.discount > 0 && (
                        <span className="discount-badge">-{p.discount}%</span>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{p.name}</h3>
                      <p className="product-category">{p.category}</p>
                      <div className="product-price-row">
                        <span className="price">${(p.price * (1 - (p.discount || 0) / 100)).toFixed(2)}</span>
                        {p.discount > 0 && <span className="original-price">${p.price}</span>}
                      </div>
                      <Link to={`/customer/products/${p._id}`}>
                        <Button variant="primary" className="btn-view">View Details</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="pagination">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}




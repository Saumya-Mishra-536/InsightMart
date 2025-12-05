import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'
import Input from '../components/Input'
import './seller-products.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

export default function Products() {
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
  const limit = 6

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

      const res = await fetch(`${API_BASE}/api/products/filter?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

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

  const [categories, setCategories] = useState([])

  useEffect(() => {
    async function fetchCategories() {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        const data = await res.json()
        if (data.success && data.products) {
          const uniqueCategories = [...new Set(data.products.map(p => p.category).filter(Boolean))]
          setCategories(uniqueCategories)
        }
      } catch (err) {
        // Ignore errors for categories
      }
    }
    fetchCategories()
  }, [token])

  return (
    <div className="products-page animate-fade-in">
      <div className="dashboard-header-section">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="page-subtitle">Manage your inventory and track performance</p>
        </div>
        <div className="header-actions">
          <Link to="/seller/products/add" className="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Product
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
                <option value="rating-desc">Highest Rated</option>
              </select>
            </div>
          </Card>
        </aside>

        {/* Products Content */}
        <div className="products-content">
          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or add a new product.</p>
              <Link to="/seller/products/add">
                <Button variant="primary">Add Product</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <Card key={product._id} className="product-card" hover onClick={() => navigate(`/seller/products/${product._id}`)}>
                    <div className="product-header">
                      <h3 className="product-name">{product.name}</h3>
                      {product.discount > 0 && (
                        <span className="discount-badge">-{product.discount}%</span>
                      )}
                    </div>

                    <div className="product-meta">
                      <span className="meta-item">
                        <span className="meta-label">SKU:</span> {product.sku}
                      </span>
                      <span className="meta-item">
                        <span className="meta-label">Category:</span> {product.category || 'N/A'}
                      </span>
                    </div>

                    <div className="product-price">
                      ${(product.price * (1 - (product.discount || 0) / 100)).toFixed(2)}
                      {product.discount > 0 && (
                        <span className="original-price">${product.price.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="product-footer">
                      <div className="rating">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{product.rating || 0}</span>
                        <span className="reviews-count">({product.reviews || 0} reviews)</span>
                      </div>
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

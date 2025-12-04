import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AuthCallback from './pages/AuthCallback'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import AddProduct from './pages/AddProduct'
import EditProduct from './pages/EditProduct'
import Dashboard from './pages/Dashboard'
import CustomerHome from './pages/CustomerHome'
import Cart from './pages/Cart'
import CustomerOrders from './pages/CustomerOrders'
import CustomerProductDetail from './pages/CustomerProductDetail'

// Basic auth check
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

function SellerRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'seller') {
    return <Navigate to="/customer/home" replace />
  }
  return children
}

function CustomerRoute({ children }) {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'customer') {
    return <Navigate to="/seller/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Seller routes */}
        <Route
          path="/seller/products"
          element={
            <SellerRoute>
              <Products />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/products/add"
          element={
            <SellerRoute>
              <AddProduct />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/products/:id"
          element={
            <SellerRoute>
              <ProductDetail />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/products/:id/edit"
          element={
            <SellerRoute>
              <EditProduct />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/dashboard"
          element={
            <SellerRoute>
              <Dashboard />
            </SellerRoute>
          }
        />

        {/* Customer routes */}
        <Route
          path="/customer/home"
          element={
            <CustomerRoute>
              <CustomerHome />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/cart"
          element={
            <CustomerRoute>
              <Cart />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/orders"
          element={
            <CustomerRoute>
              <CustomerOrders />
            </CustomerRoute>
          }
        />
        <Route
          path="/customer/products/:id"
          element={
            <CustomerRoute>
              <CustomerProductDetail />
            </CustomerRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

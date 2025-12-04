import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard.css";

import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const DashboardAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [salesPerProduct, setSalesPerProduct] = useState([]);
  const [mostOrdered, setMostOrdered] = useState([]);
  const [orderCount, setOrderCount] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalUnits: 0,
    totalProductsWithSales: 0,
    totalOrderDays: 0,
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchAnalytics();
  }, [token]);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");

      setSalesPerProduct(data.salesPerProduct || []);
      setMostOrdered(data.mostOrdered || []);
      setOrderCount(data.orderCount || []);
      setCategoryBreakdown(data.categoryBreakdown || []);
      setSummary({
        totalRevenue: data.summary?.totalRevenue || 0,
        totalUnits: data.summary?.totalUnits || 0,
        totalProductsWithSales: data.summary?.totalProductsWithSales || (data.salesPerProduct?.length || 0),
        totalOrderDays: data.summary?.totalOrderDays || (data.orderCount?.length || 0),
      });
    } catch (err) {
      setError(err.message || "Failed to load analytics");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // Chart options
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "rgba(255,255,255,0.8)" },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "rgba(255,255,255,0.8)", padding: 15 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "rgba(255,255,255,0.8)" },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.7)" },
        grid: { color: "rgba(255,255,255,0.1)" },
      },
    },
  };

  return (
    <div className="analytics-page">
      {/* ORBS */}
      <div className="orb orb--pink"></div>
      <div className="orb orb--gray"></div>

      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="header-title">Analytics Dashboard</h1>
          <div className="header-actions">
            <Link to="/seller/products" className="btn-nav">Products</Link>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
        <div className="user-info">
          <span>Welcome, {user?.name || "User"}</span>
        </div>
      </header>

      <main className="analytics-main">
        <div className="analytics-card">
          <div className="analytics-header">
            <h2 className="title">Product & Order Insights</h2>
            <p className="subtitle">Visual overview of your business analytics</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-state">Loading analytics...</div>
          ) : (
            <div className="analytics-sections">
              {/* SECTION 1: SALES PER PRODUCT */}
              <section className="analytics-section">
                <h3 className="section-title">Sales Per Product</h3>
                <div className="chart-box">
                  {salesPerProduct.length > 0 ? (
                    <Bar
                      data={{
                        labels: salesPerProduct.map((p) => p.name || "Unknown"),
                        datasets: [
                          {
                            label: "Quantity Sold",
                            data: salesPerProduct.map((p) => p.totalQuantity || 0),
                            backgroundColor: "rgba(168, 85, 247, 0.6)",
                            borderColor: "rgba(168, 85, 247, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={barOptions}
                    />
                  ) : (
                    <p className="chart-placeholder">No sales data available</p>
                  )}
                </div>
              </section>

              {/* SECTION 2: TOP ORDERED PRODUCTS */}
              <section className="analytics-section">
                <h3 className="section-title">Top Ordered Products</h3>
                <div className="chart-box">
                  {mostOrdered.length > 0 ? (
                    <Pie
                      data={{
                        labels: mostOrdered.map((p) => p.name || "Unknown"),
                        datasets: [
                          {
                            label: "Orders",
                            data: mostOrdered.map((p) => p.totalQuantity || 0),
                            backgroundColor: [
                              "rgba(168, 85, 247, 0.6)",
                              "rgba(244, 114, 182, 0.6)",
                              "rgba(59, 130, 246, 0.6)",
                              "rgba(34, 197, 94, 0.6)",
                              "rgba(251, 191, 36, 0.6)",
                            ],
                            borderColor: [
                              "rgba(168, 85, 247, 1)",
                              "rgba(244, 114, 182, 1)",
                              "rgba(59, 130, 246, 1)",
                              "rgba(34, 197, 94, 1)",
                              "rgba(251, 191, 36, 1)",
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={pieOptions}
                    />
                  ) : (
                    <p className="chart-placeholder">No order data available</p>
                  )}
                </div>
              </section>

              {/* SECTION 3: ORDER COUNT OVER TIME */}
              <section className="analytics-section">
                <h3 className="section-title">Orders Over Time (Daily)</h3>
                <div className="chart-box">
                  {orderCount.length > 0 ? (
                    <Line
                      data={{
                        labels: orderCount.map((o) => o._id || "Unknown"),
                        datasets: [
                          {
                            label: "Orders",
                            data: orderCount.map((o) => o.count || 0),
                            borderColor: "rgba(244, 114, 182, 1)",
                            backgroundColor: "rgba(244, 114, 182, 0.1)",
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointRadius: 5,
                            pointHoverRadius: 7,
                          },
                        ],
                      }}
                      options={lineOptions}
                    />
                  ) : (
                    <p className="chart-placeholder">No order history available</p>
                  )}
                </div>
              </section>

              {/* SECTION 4: SUMMARY STATS */}
              <section className="analytics-section stats-section">
                <h3 className="section-title">Quick Stats</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{summary.totalProductsWithSales}</div>
                    <div className="stat-label">Products with Sales</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      {summary.totalUnits}
                    </div>
                    <div className="stat-label">Total Units Sold</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">
                      ${summary.totalRevenue.toFixed(2)}
                    </div>
                    <div className="stat-label">Total Revenue</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{summary.totalOrderDays}</div>
                    <div className="stat-label">Days with Orders</div>
                  </div>
                </div>
              </section>

              {/* SECTION 5: CATEGORY-WISE SALES */}
              <section className="analytics-section">
                <h3 className="section-title">Category-wise Sales</h3>
                <div className="chart-box">
                  {categoryBreakdown.length > 0 ? (
                    <Bar
                      data={{
                        labels: categoryBreakdown.map((c) => c.category || "Unknown"),
                        datasets: [
                          {
                            label: "Revenue",
                            data: categoryBreakdown.map((c) => c.totalSales || 0),
                            backgroundColor: "rgba(59, 130, 246, 0.6)",
                            borderColor: "rgba(59, 130, 246, 1)",
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={barOptions}
                    />
                  ) : (
                    <p className="chart-placeholder">No category breakdown available</p>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardAnalytics;

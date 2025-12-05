import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import Card from "../components/Card";
import "./Dashboard.css";

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

  // Chart options
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "rgba(255,255,255,0.7)", font: { family: "'Inter', sans-serif" } },
      },
      tooltip: {
        backgroundColor: "rgba(11, 11, 12, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255,255,255,0.6)", font: { family: "'Inter', sans-serif" } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: "rgba(255,255,255,0.6)", font: { family: "'Inter', sans-serif" } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  };

  const pieOptions = {
    ...commonOptions,
    scales: {}, // Pie charts don't have scales
    plugins: {
      ...commonOptions.plugins,
      legend: {
        position: "bottom",
        labels: { color: "rgba(255,255,255,0.7)", padding: 20, font: { family: "'Inter', sans-serif" } },
      },
    },
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header-section">
        <div>
          <h1 className="page-title">Analytics Overview</h1>
          <p className="page-subtitle">Track your business performance and growth</p>
        </div>
        <div className="header-actions">
          <Link to="/seller/products" className="btn btn-primary">Manage Products</Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          {/* Summary Stats */}
          <div className="stats-grid">
            <Card className="stat-card" hover>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${summary.totalRevenue.toFixed(2)}</div>
              <div className="stat-trend positive">↗ +12.5%</div>
            </Card>
            <Card className="stat-card" hover>
              <div className="stat-label">Units Sold</div>
              <div className="stat-value">{summary.totalUnits}</div>
              <div className="stat-trend positive">↗ +5.2%</div>
            </Card>
            <Card className="stat-card" hover>
              <div className="stat-label">Active Products</div>
              <div className="stat-value">{summary.totalProductsWithSales}</div>
              <div className="stat-trend neutral">− 0%</div>
            </Card>
            <Card className="stat-card" hover>
              <div className="stat-label">Order Days</div>
              <div className="stat-value">{summary.totalOrderDays}</div>
              <div className="stat-trend positive">↗ +2.1%</div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="charts-row">
            <Card className="chart-card wide">
              <h3 className="card-title">Sales Per Product</h3>
              <div className="chart-container">
                {salesPerProduct.length > 0 ? (
                  <Bar
                    data={{
                      labels: salesPerProduct.map((p) => p.name || "Unknown"),
                      datasets: [
                        {
                          label: "Quantity Sold",
                          data: salesPerProduct.map((p) => p.totalQuantity || 0),
                          backgroundColor: "rgba(124, 58, 237, 0.7)",
                          borderRadius: 4,
                          hoverBackgroundColor: "rgba(124, 58, 237, 0.9)",
                        },
                      ],
                    }}
                    options={commonOptions}
                  />
                ) : (
                  <div className="empty-state">No sales data available</div>
                )}
              </div>
            </Card>

            <Card className="chart-card">
              <h3 className="card-title">Top Products</h3>
              <div className="chart-container pie-container">
                {mostOrdered.length > 0 ? (
                  <Pie
                    data={{
                      labels: mostOrdered.map((p) => p.name || "Unknown"),
                      datasets: [
                        {
                          data: mostOrdered.map((p) => p.totalQuantity || 0),
                          backgroundColor: [
                            "rgba(124, 58, 237, 0.7)",
                            "rgba(236, 72, 153, 0.7)",
                            "rgba(59, 130, 246, 0.7)",
                            "rgba(16, 185, 129, 0.7)",
                            "rgba(245, 158, 11, 0.7)",
                          ],
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={pieOptions}
                  />
                ) : (
                  <div className="empty-state">No data available</div>
                )}
              </div>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="charts-row">
            <Card className="chart-card">
              <h3 className="card-title">Orders Trend</h3>
              <div className="chart-container">
                {orderCount.length > 0 ? (
                  <Line
                    data={{
                      labels: orderCount.map((o) => o._id || "Unknown"),
                      datasets: [
                        {
                          label: "Daily Orders",
                          data: orderCount.map((o) => o.count || 0),
                          borderColor: "#ec4899",
                          backgroundColor: "rgba(236, 72, 153, 0.1)",
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true,
                          pointBackgroundColor: "#ec4899",
                        },
                      ],
                    }}
                    options={commonOptions}
                  />
                ) : (
                  <div className="empty-state">No trend data available</div>
                )}
              </div>
            </Card>

            <Card className="chart-card">
              <h3 className="card-title">Category Performance</h3>
              <div className="chart-container">
                {categoryBreakdown.length > 0 ? (
                  <Bar
                    data={{
                      labels: categoryBreakdown.map((c) => c.category || "Unknown"),
                      datasets: [
                        {
                          label: "Revenue",
                          data: categoryBreakdown.map((c) => c.totalSales || 0),
                          backgroundColor: "rgba(59, 130, 246, 0.7)",
                          borderRadius: 4,
                          hoverBackgroundColor: "rgba(59, 130, 246, 0.9)",
                        },
                      ],
                    }}
                    options={commonOptions}
                  />
                ) : (
                  <div className="empty-state">No category data available</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardAnalytics;

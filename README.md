# InsightMart – Smart E-Commerce Product Insights Dashboard

InsightMart is a full-stack dashboard that helps e-commerce sellers understand how pricing, discounts, customer ratings, and sales trends influence product performance. It also provides customers with a personalized dashboard to visualize their purchase history and spending patterns.

## 1. Overview

E-commerce sellers often struggle to understand how their pricing decisions affect sales. Without insights, they rely on guesswork and risk low profits.

InsightMart solves this by:
- Providing an interactive seller dashboard
- Displaying product trends in clean visual charts
- Offering search, sort, filter, and pagination tools
- Providing customers with purchase analytics and visualization

This project is ideal for small & medium online sellers, customers who want to track their purchases, data enthusiasts, and developers learning full-stack development.

## 2. System Architecture

```
Frontend (React) 
       ↓
Backend API (Node.js + Express)
       ↓
Database (MongoDB with Mongoose)
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router, Vanilla CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT, Google OAuth |
| Charts | Chart.js |
| Hosting | Vercel (Frontend), Render (Backend), MongoDB Atlas |

## 3. Features

### 🔐 Authentication & Authorization
- JWT-secured login & signup
- Google OAuth integration
- Protected dashboard & API routes
- Role-based access (Seller/Customer)

### 📦 Product Management (CRUD) - Seller
- Add new products
- Edit details → price, discount, rating, stock, etc.
- Delete products
- View all products

### 🔍 Product Tools
- Pagination (e.g., 10 items per page)
- Searching (name, category, SKU)
- Sorting (price, rating, date)
- Filtering (category, rating, discount range)

### 📊 Seller Dashboard & Data Visualization
- Interactive charts for sales trends
- Revenue analytics
- Product performance metrics
- Stock management overview

### 🛒 Customer Features
- Browse and search products
- Add to cart functionality
- Place orders
- View order history
- **Customer Dashboard** with chart visualizations based on purchased products:
  - Spending trends over time
  - Category-wise purchase breakdown
  - Order history analytics

### ⭐ Reviews & Ratings
- Customers can leave product reviews
- Star rating system
- Review management

### 🌐 Deployment
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

## 4. Folder Structure

```
InsightMart/
 ├── frontend/          # React frontend
 │   ├── src/
 │   │   ├── components/  # Reusable UI components
 │   │   ├── pages/       # Page components
 │   │   └── index.css    # Global styles
 │   └── public/
 ├── backend/           # Node.js backend
 │   ├── models/        # Mongoose schemas
 │   ├── route/         # Express routes
 │   ├── controllers/   # Route handlers
 │   ├── middleware/    # Auth middleware
 │   ├── config/        # Passport config
 │   └── utils/         # Utility functions
 ├── README.md
 └── vercel.json
```

## 5. API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register new user |
| POST | /api/auth/login | Login & get JWT |
| GET | /api/auth/google | Google OAuth login |
| GET | /api/auth/google/callback | Google OAuth callback |

### Product APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | Fetch all products (search, filter, sort, paginate) |
| GET | /api/products/public | Public product listing for customers |
| GET | /api/products/:id | Get a single product |
| POST | /api/products | Add product (Seller only) |
| PUT | /api/products/:id | Update product (Seller only) |
| DELETE | /api/products/:id | Delete product (Seller only) |

### Cart APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart/my-cart | Get user's cart |
| POST | /api/cart/add | Add item to cart |
| PUT | /api/cart/update | Update cart item quantity |
| DELETE | /api/cart/remove/:productId | Remove item from cart |

### Order APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/orders/my-orders | Get user's orders |
| POST | /api/orders/place | Place an order |

### Review APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reviews/:productId | Get reviews for a product |
| POST | /api/reviews | Add a review |
| DELETE | /api/reviews/:id | Delete a review |

### Analytics APIs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | Get seller dashboard analytics |
| GET | /api/analytics/customer | Get customer purchase analytics |

## 6. Installation & Setup

### Clone repo
```bash
git clone https://github.com/Saumya-Mishra-536/InsightMart.git
cd InsightMart
```

### Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```env
MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
BACKEND_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
```

Start the server:
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Create `.env`:
```env
VITE_API_BASE_URL=http://localhost:5001
```

## 7. Live Demo

- **Frontend**: [Vercel Deployment](https://insight-mart.vercel.app)
- **Backend**: [Render Deployment](https://insightmart1.onrender.com)

## 8. Future Scope

- Dynamic pricing recommendations
- Competitor price tracking
- Real-time dashboards with WebSocket
- Email notifications for orders
- Advanced customer analytics
- Wishlist functionality

## 9. Expected Outcome

Using InsightMart:

**Sellers can:**
- Make smart pricing & discount decisions
- Identify high-performing & underperforming products
- Track sales trends and revenue
- Use a clean dashboard instead of manual spreadsheets

**Customers can:**
- Browse and purchase products easily
- Track their order history
- View purchase analytics and spending patterns
- Make informed buying decisions based on their history

---

## License

MIT License - Feel free to use and modify for your own projects.

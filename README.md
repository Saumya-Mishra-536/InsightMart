InsightMart – Smart E-Commerce Product Insights Dashboard

InsightMart is a full-stack dashboard that helps e-commerce sellers understand how pricing, discounts, customer ratings, and sales trends influence product performance.
It also includes a lightweight machine learning prediction module that forecasts future sales based on product attributes.

1. Overview
E-commerce sellers often struggle to understand how their pricing decisions affect sales. Without insights, they rely on guesswork and risk low profits.
InsightMart solves this by:
*Providing an interactive dashboard
*Displaying product trends in clean visual charts
*Offering search, sort, filter, and pagination tools
*Running a simple ML model to predict future performance
This project is ideal for small & medium online sellers, data enthusiasts, and developers learning full-stack + ML integration.

2. System Architecture
Frontend (React) 
       ↓
Backend API (Node.js + Express)
       ↓
Database (MongoDB with Mongoose)
       ↓
ML Layer (Python or TF.js Prediction Model)

Tech Stack
Layer	Technology
Frontend	React.js, React Router, Axios, TailwindCSS
Backend	Node.js, Express.js
Database	MongoDB + Mongoose
Authentication	JWT
Charts	Chart.js / Recharts
Machine Learning	Python (Scikit-learn) or TensorFlow.js
Hosting	Vercel (Frontend), Render (Backend), MongoDB Atlas



3. Features
Authentication & Authorization
JWT-secured login & signup
Protected dashboard & API routes
Product Management (CRUD)
Add new products
Edit details → price, discount, rating, etc.
Delete products
View all products

🔍 Product Tools
*Pagination (e.g., 10 items per page)
*Searching (name, category, SKU)
*Sorting (price, rating, date)
*Filtering (category, rating, discount range)

📊 Data Visualization
Interactive line charts for sales trends
Comparison of price vs. sales

🤖 ML Prediction (10% Component)
Predicts future sales or purchase likelihood

Model trained on CSV data
Regression model (Linear Regression/Random Forest)

🌐 Deployment
Frontend → Vercel / Netlify
Backend → Render / Railway
Database → MongoDB Atlas

4. Folder Structure 
InsightMart/
 ├── client/          # React frontend
 │   ├── src/
 │   └── public/
 ├── server/          # Node.js backend
 │   ├── models/      # Mongoose schemas
 │   ├── routes/      # Express routes
 │   ├── controllers/
 │   ├── middleware/
 │   └── ml/          # Python model or TF.js model
 ├── README.md
 └── .env

🔌 5. API Endpoints
Authentication
Method	Endpoint	Description
POST	/api/auth/signup	Register new seller
POST	/api/auth/login	Login & get JWT
Product APIs
Method	Endpoint	Description
GET	/api/products	Fetch all products (search, filter, sort, paginate)
GET	/api/products/:id	Get a single product
POST	/api/products	Add product
PUT	/api/products/:id	Update product
DELETE	/api/products/:id	Delete product
Prediction API
Method	Endpoint	Description
GET	/api/predict/:id	Predict future sales using ML model
📘 6. Machine Learning Component
 Goal
=>Predict future sales based on:
=>Price
=>Discount %
=>Rating
=>Number of reviews
=>Past sales data

 Input Dataset
Sample CSV from Kaggle or mock dataset with fields:
price, discount, rating, reviews, past_month_sales

🔗 Integration

The backend calls the ML script:
GET /api/predict/:id
The ML script returns a predicted number, e.g.:

{
  "predicted_sales": 145
}

7. Installation & Setup
Clone repo
git clone https://github.com/yourusername/InsightMart.git
cd InsightMart

Backend Setup
cd server
npm install


Create .env:

MONGO_URI=your_mongodb_atlas_url
JWT_SECRET=your_secret


Start the server:

npm run dev

Frontend Setup
cd ../client
npm install
npm start

 8. Future Scope

Market Basket Analysis (product bundle suggestions)
Dynamic pricing recommendations
Competitor price tracking
Real-time dashboards
Automated discount optimization

9. Expected Outcome
=>Using InsightMart, sellers can:
=>Make smart pricing & discount decisions
=>Identify high-performing & underperforming products
=>Predict how changes affect future sales
=>Use a clean dashboard instead of manual spreadsheets

InsightMart – Smart E-Commerce Product Insights Dashboard

InsightMart is a full-stack web application designed to help small and medium e-commerce sellers make data-driven product decisions instead of relying on guesswork.

Sellers can track how price, discount, ratings, and sales trends affect product performance, while a lightweight ML model predicts how future sales might change based on pricing or discount adjustments.

🚀 Key Features
Category	Feature
🔐 Authentication	User signup & login (JWT secure)
📦 Product Management	Add, edit, delete & view products
🔍 Smart Filters	Search, sort & filter by category, rating, price, etc.
📊 Data Visualization	Interactive sales trend charts
🤖 Machine Learning	Predict future sales based on price, discount, rating
🌐 Deployment	Fully hosted frontend, backend & database
🏗️ Tech Stack
Layer	Technology
Frontend	React.js, React Router, Axios, TailwindCSS
Backend	Node.js + Express.js
Database	MySQL with Prisma ORM
Auth	JWT (JSON Web Token)
Machine Learning	Python (scikit-learn) / TensorFlow.js
Hosting	Vercel (Frontend) • Render/Railway (Backend) • Railway/Aiven (DB)
🧠 Machine Learning Component (10%)

The system includes an ML model trained on product datasets to predict future sales probability based on:

Price

Discount percentage

Customer rating

Past monthly sales

Number of reviews

Output Example:

"Predicted units next month: 120"
"Purchase probability: 0.78"

📌 Project Status (Milestones)

✅ Milestone 1 – Auth + Hosting (Login/Signup, DB connected)
🔄 Milestone 2 – Product CRUD + Pagination
🔄 Milestone 3 – Interactive Charts & Analytics
🔄 Milestone 4 – ML Model Integration
🔄 Milestone 5 – Final polish + Docs + Deployment

🛠️ Project Structure
InsightMart/
├── backend/      # Node.js + Prisma API
├── frontend/     # React dashboard
└── ml-service/   # (optional) Python ML model

📄 Future Scope

🔁 Dynamic price suggestions
🛒 Market basket analysis (product bundling)
📈 Real-time analytics
🔍 Competitor-based pricing recommendations

# RazorGrow AI 🚀

AI-Powered Business Intelligence Dashboard for small and growing businesses.

## 📌 Project Overview

RazorGrow AI is a full-stack business intelligence platform that helps merchants monitor their sales, products, inventory, orders, and business performance from a single dashboard.

The platform combines a React frontend, FastAPI backend, PostgreSQL database, sales analytics, and local AI-powered business recommendations.

## 🎯 Project Objectives

- Monitor business revenue and orders
- Manage products and inventory
- Track stock levels
- Create and manage customer orders
- Display real-time sales analytics
- Visualize daily revenue and order trends
- Identify low-stock products
- Generate AI-powered business recommendations
- Provide a responsive business dashboard

## 🛠️ Technologies Used

### Frontend
- React
- Vite
- Bootstrap
- Recharts
- Axios
- Lucide React

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic

### Database
- PostgreSQL

### AI
- Ollama
- Qwen3:4b

## ✨ Main Features

### 📊 Business Dashboard
Displays:
- Total Revenue
- Total Orders
- Products
- Inventory
- Average Order Value
- Units Sold

### 📈 Sales Analytics

The dashboard provides:
- Total revenue
- Total orders
- Units sold
- Average order value
- Daily revenue visualization

### 📦 Product Management

Merchants can:
- Add products
- Set product prices
- Set categories
- Manage stock
- View inventory levels

### 🛒 Order Management

The system supports:
- Creating orders
- Selecting products
- Setting quantities
- Calculating order totals
- Updating inventory after successful orders
- Viewing recent orders

### ⚠️ Inventory Monitoring

The dashboard monitors inventory and identifies products with low stock levels so merchants can take action before products run out.

### 🤖 AI Business Intelligence

RazorGrow AI uses locally hosted Qwen3 through Ollama to analyze business data and generate practical recommendations.

The AI considers information such as:
- Revenue
- Orders
- Units sold
- Average order value
- Inventory
- Product count

## 🏗️ Project Structure

```text
razorgrow-ai/
│
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md


🚀 Running the Project
Backend

Navigate to the backend:

cd backend

Create and activate a virtual environment:

python -m venv .venv

Windows:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start FastAPI:

uvicorn app.main:app --reload --port 8000

Backend API:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs
Frontend

Open another terminal:

cd frontend

Install dependencies:

npm.cmd install

Start the development server:

npm.cmd run dev

Frontend:

http://localhost:5173
🤖 Running Local AI

Install Ollama and make sure the Qwen3 model is available:

ollama run qwen3:4b

The FastAPI backend communicates with the local Ollama service to generate business recommendations.

🔐 Environment Variables

Sensitive configuration should be stored in .env.

The .env file is intentionally excluded from Git using .gitignore.

Do not upload passwords, database credentials, API keys, or other secrets to GitHub.

📊 Example Analytics

The analytics API provides information such as:

Total Orders
Total Revenue
Units Sold
Average Order Value
Daily Revenue

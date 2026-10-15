# Municipal Digital Twins (पालिका डिजिटल जुम्ल्याहा)

A comprehensive, integrated "Digital Twin" enterprise system designed for the Local Governments of Nepal. 
This system centralizes fragmented municipal operations into a unified, modular, and AI-driven architecture.

## 🚀 Features & Modules (Phases 1-14)

1. **Master Data Management (MDM):** Core foundation (Wards, Households, Citizen 360).
2. **E-Office & Tippani:** Digital correspondence (Darta, Chalani, Memos).
3. **Project Lifecycle:** Infrastructure project tracking (Proposals, Budgets, Contracts, Execution).
4. **Digital Sifaris (E-Service):** Online citizen service portal and certificate issuance.
5. **Electronic Building Permit System (EBPS):** House map approval workflows.
6. **Asset & GIS Spatial Twin:** Digital registry of public properties and GIS mapping.
7. **Analytics & Executive Dashboard:** Command center for Mayor/CAO with real-time KPIs.
8. **AI Assistant & RAG:** NLP Chatbot for querying municipal policies and data.

## 🛠 Technology Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React, TypeScript, Vite, CSS Modules (Custom Glassmorphism Design)

## 📦 Getting Started

### 1. Start the Backend (FastAPI)
```bash
cd fastapi-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
API Documentation available at: `http://localhost:8000/docs`

### 2. Start the Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```
Access the application at: `http://localhost:8080/app/admin` (or the port specified by Vite).

## 🗂 Directory Structure
- `/fastapi-backend`: Contains the Python backend (APIs, Database Models, Schemas).
- `/frontend`: Contains the React frontend (UI Components, CSS, Pages).

## 📄 License
Proprietary / Government Use Only.

FinTrack
A comprehensive personal finance tracking application built with Spring Boot (backend) and React (frontend). Track your income, expenses, budgets, and savings goals in one place.

Features
User Authentication: Secure registration and login with JWT-based authentication
Transaction Management: Add, edit, delete, and categorize income and expense transactions
Budget Planning: Set monthly spending limits per category with real-time tracking of spent amounts
Savings Goals: Create and track progress towards financial goals with contribution tracking
Dashboard Analytics: View financial summaries, balance calculations, and spending insights
Responsive Design: Modern, mobile-friendly user interface
Tech Stack
Backend
Framework: Spring Boot 3.2.4
Language: Java 17
Database: SQLite with JPA/Hibernate
Security: Spring Security with JWT authentication
Build Tool: Maven
Frontend
Framework: React 19.2.5
Build Tool: Vite
Language: JavaScript (ES6+)
Styling: CSS with custom components
Prerequisites
Java 17 or higher
Node.js 16 or higher
Maven 3.6 or higher
Installation
Backend Setup
Navigate to the backend directory:

cd backend
Install dependencies and build the project:

mvn clean install
Run the application:

mvn spring-boot:run
The backend will start on http://localhost:8080

Frontend Setup
Navigate to the frontend directory:

cd frontend
Install dependencies:

npm install
Start the development server:

npm run dev
The frontend will start on http://localhost:5173

Usage
Open your browser and go to http://localhost:5173
Register a new account or login with existing credentials
Start adding your transactions, setting budgets, and creating savings goals
View your financial dashboard for insights
API Documentation
The backend provides RESTful APIs for all operations. All endpoints require authentication via JWT token in the Authorization header.

Authentication Endpoints
POST /api/auth/register - Register a new user
POST /api/auth/login - Login and receive JWT token
GET /api/auth/me - Get current user information
DELETE /api/auth/me - Delete user account
Transaction Endpoints
GET /api/transactions - List all transactions (optional ?type=income|expense)
POST /api/transactions - Create a new transaction
PUT /api/transactions/{id} - Update a transaction
DELETE /api/transactions/{id} - Delete a transaction
GET /api/transactions/summary - Get financial summary (income, expense, balance)
Budget Endpoints
GET /api/budgets?month={month}&year={year} - List budgets for a specific month
POST /api/budgets - Create or update a budget
PUT /api/budgets/{id} - Update a budget limit
DELETE /api/budgets/{id} - Delete a budget
Goal Endpoints
GET /api/goals - List all savings goals
POST /api/goals - Create a new savings goal
PUT /api/goals/{id} - Update a goal
POST /api/goals/{id}/contribute - Add contribution to a goal
DELETE /api/goals/{id} - Delete a goal
Project Structure
fintrack/
├── backend/
│   ├── src/main/java/com/fintrack/
│   │   ├── FinTrackApplication.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── BudgetController.java
│   │   │   ├── GoalController.java
│   │   │   └── TransactionController.java
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   └── security/
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── hooks/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── diagrams/
│   ├── ER_Diagram.puml
│   ├── ER Diagram.png
│   ├── Class_Diagram.puml
│   ├── Class Diagram.png
│   ├── Sequence_Diagram_Login.puml
│   ├── Sequence Diagram - User Login.png
│   ├── Activity_Diagram_Add_Transaction.puml
│   └── Activity Diagram - Add Transaction.png
└── README.md
Diagrams
The diagrams/ folder contains both PlantUML source files and generated PNG visuals.

ER_Diagram.puml → ER Diagram.png
Class_Diagram.puml → Class Diagram.png
Sequence_Diagram_Login.puml → Sequence Diagram - User Login.png
Activity_Diagram_Add_Transaction.puml → Activity Diagram - Add Transaction.png
These PNG files are the actual diagram images, ready to open.

Configuration
Backend Configuration
The application uses SQLite as the database. Configuration can be found in backend/src/main/resources/application.properties.

Frontend Configuration
API base URL and other settings are configured in frontend/src/services/api.js.

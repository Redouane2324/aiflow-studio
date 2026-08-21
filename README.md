AIFlow Studio

AIFlow Studio is a modern CRM SaaS MVP for managing leads, sales pipelines and business analytics.

## Features

- User registration and login
- JWT authentication
- PostgreSQL database
- Lead management
- Add, edit and delete leads
- Lead search
- Status filtering
- Sales pipeline
- Dashboard analytics
- Responsive interface
- REST API
- Security middleware
- Rate limiting
- Production deployment support

## Technology Stack

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- Vanilla JavaScript
- HTML5
- CSS3

## Project Structure

```text
aiflow-studio/
├── index.html
├── style.css
├── app.js
├── server.js
├── package.json
└── README.md
Requirements
Node.js 20+
PostgreSQL database
npm
Environment Variables
Create the following environment variables:
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
NODE_ENV=production
Installation
Clone the project and install dependencies:
npm install
Run Locally
npm start
The application will run on:
http://localhost:10000
Database
The application automatically creates the required database tables when the server starts.
The main tables are:
users
leads
API
Authentication
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
Leads
GET /api/leads
POST /api/leads
PUT /api/leads/:id
DELETE /api/leads/:id
Dashboard
GET /api/dashboard
Health
GET /api/health
Deployment
AIFlow Studio can be deployed on Render or another Node.js hosting platform.
Set the following environment variables on the hosting platform:
DATABASE_URL
JWT_SECRET
NODE_ENV=production
Build Command
npm install
Start Command
npm start
Security
The application includes:
Password hashing with bcrypt
JWT authentication
Helmet security headers
API rate limiting
User-specific lead access
PostgreSQL parameterized queries
License
Commercial license.
The buyer may use and customize the software according to the license terms provided with the purchase.
Support
For installation, deployment and customization support, contact the seller through the platform where the product was purchased.


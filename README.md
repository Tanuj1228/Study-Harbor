# Study Harbour ⚓

**Live Demo:** [https://study-harbor-1.onrender.com](https://study-harbor-1.onrender.com)

## Overview
Study Harbour is a centralized academic hub designed to help students organize their academic year. It resolves the problem of scattered academic resources by providing a unified platform where students can track calendar events, access drive resources categorized by year and subject, and view pinned alerts in real-time.

## 🚀 Tech Stack
* **Frontend:** React.js, Tailwind CSS, Framer Motion, Lucide Icons, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas
* **Authentication:** Google OAuth 2.0, JSON Web Tokens (JWT)
* **Email Services:** SendGrid API / Nodemailer
* **Deployment:** Render (Decoupled Static Site Frontend & Web Service Backend)

## ✨ Features

### 🔐 Authentication & Authorization
* **Google Single Sign-On (SSO):** Seamless one-click login utilizing Google OAuth 2.0 Identity Services.
* **JWT Authentication:** Secure token-based session management for traditional logins.
* **Role-Based Access Control (RBAC):** Distinct privileges for `admin` and `user` roles to secure management endpoints.

### 🛡️ Admin Dashboard
A comprehensive, secure portal for administrators to manage all platform content:
* **Years & Subjects Management:** Dynamically create, edit, and delete academic years and their associated subjects (including subject codes and descriptions).
* **Resource Management:** Attach Google Drive WebView links (notes, syllabi, videos, references) to specific subjects. Includes tag support and descriptions.
* **Announcements System:** Publish and manage alerts categorized by type (Exam/Academic, Event, General). Features include priority "pinning" to the top and optional event registration links.
* **Holiday Calendar:** Add and track academic holidays and breaks.
* **Dynamic Quotes:** Add motivational quotes and manually set the active "Quote of the Day" for the user dashboard.
* **Centralized Content Search:** Real-time search filtering across subjects, announcements, holidays, and years within the management tab.

### 📧 Email Integration
* **Automated Notifications:** Integrated with SendGrid to handle platform emails, administrative alerts, and user communications.

## 🛠️ Local Development Setup

### Prerequisites
* Node.js (v16+)
* MongoDB Atlas cluster or local MongoDB instance
* Google Cloud Console account (for OAuth credentials)
* SendGrid account (for Email API key)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tanuj1228/study-harbour.git
   cd study-harbour
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=1d
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   SENDGRID_API_KEY=SG.your_sendgrid_api_key
   EMAIL_FROM_ADDRESS=supersetofficial01@gmail.com
   ADMIN_EMAILS=your_admin_email@gmail.com
   ```

   Start the backend development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

   Start the frontend development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
This project is configured for cloud deployment on Render:
* **Frontend:** Deployed as a Static Site.
* **Backend:** Deployed as a Web Service.
* **CORS & Origins:** Configured to handle strict Cross-Origin Resource Sharing and Google OAuth authorized JavaScript origins between the decoupled live environments.

## 👨‍💻 Author
Tanuj Thour

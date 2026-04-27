<div align="center">
  <img src="https://via.placeholder.com/150/000000/FFFFFF/?text=MockDrop" alt="MockDrop Logo" width="120" height="120">
  <h1>MockDrop</h1>
  <p><b>A Fast, Local-First Mock API & Payload Generator</b></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://reactjs.org/)
  [![PHP](https://img.shields.io/badge/Backend-PHP%208.x-purple)](https://www.php.net/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL-orange)](https://www.mysql.com/)
</div>

<br />

**MockDrop** is a robust tool designed to let frontend developers and testers generate instant, ephemeral mock APIs. Build and orchestrate your payloads locally with a modern React UI, then instantly deploy them to a lightweight, highly-performant LAMP stack backend for your application to consume via HTTP.

---

## ✨ Features

### Frontend (React / Vite)
- **Local-First Speed:** Workspaces, endpoint records, and logs are persisted seamlessly via IndexedDB before pushing to the cloud.
- **Monaco Editor Integration:** Write, format, and validate complex JSON payloads directly in the browser with full syntax highlighting.
- **Dynamic Endpoint Configuration:** Adjust HTTP status codes (200, 404, 500), customize custom response delays, toggle CORS policies, and set precise endpoint expiry intervals.
- **Code Snippet Generator:** Instantly copy copy-paste ready `fetch`, `axios`, or `curl` snippets for your newly generated mock API.

### Backend (PHP / MySQL)
- **Ultra-Fast Routing:** Slim PHP 8.x endpoints optimized to return unencoded JSON instantaneously.
- **Persistent Mocks:** Saves mock configurations, delay parameters, and payloads securely via PDO prepared statements.
- **Analytics & IP Monitoring:** Logs requests, timestamps, actual response latency, and safely masks remote IP addresses for privacy limits.
- **Self-Healing Cron Jobs:** Automatically cleans up endpoints surpassing their specified expiry time.

---

## 🏗️ Architecture & Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React, Vite, Tailwind CSS, IndexedDB (`idb`), Monaco Editor |
| **Backend API** | PHP 8.x, Vanilla Routing, `.htaccess` standard redirects |
| **Database** | MySQL / MariaDB |
| **Hosting** | Any typical LAMP Stack, cPanel, or DigitalOcean Droplet |

---

## 🚀 Quick Setup

### 1. Backend / Database
1. Copy the `/backend` folder to your server's web root (e.g., `/public_html` or `/var/www/html/backend`).
2. Import `backend/db/schema.sql` into your MySQL instance via phpMyAdmin or the CLI.
3. Rename `backend/.env.example` to `backend/.env` and update your database credentials.
4. Set up the cleanup Cron Job on your server (runs every minute):
   ```cron
   * * * * * php /path/to/your/backend/cron/cleanup.php >> /dev/null 2>&1
   ```

### 2. Frontend
1. Open the project root in your terminal and install dependencies:
   ```bash
   npm install
   ```
2. Link the frontend to your newly hosted backend by editing `src/lib/mockdrop/store.ts`:
   ```typescript
   // Change this to reflect your active PHP domain
   export const endpointUrl = (id: string) => `https://yourdomain.com/backend/api/${id}`;
   ```
3. Run the development server (or build for production):
   ```bash
   npm run dev
   # or
   npm run build
   ```

---

## 🔌 Core Backend API Overview

Once the backend is live, it exposes these endpoints under the `api/` route constraint:

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/create` | Consumes JSON schema to establish a mock entry. Returns a unique 10-character hash ID. |
| `GET` | `/api/{hash}` | Serves the mock JSON payload exactly as configured (including artificial delays & HTTP headers). |
| `GET` | `/api/{hash}/logs` | Returns the recent 50 interaction logs mapped to this endpoint ID. |
| `DELETE` | `/api/{hash}` | Secure internal endpoint to drop an active mock immediately, requires `X-Secret-Token`. |

---

## 🛡️ Security Restrictions
- Direct directory access for `/db`, `/config`, and `/cron` is blocked via strict Apache rules.
- SQL Injection vectors are neutralized utilizing raw PDO prepared statements parameters.
- Built-in Rate limiting (max 60 hits / min per distinct IP per endpoint).

---

> Built with ❤️ by developers, for developers.

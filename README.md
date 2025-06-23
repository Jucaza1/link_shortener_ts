# Typescript link shortener with express and sqlite
## PREVIEW without backend! -> [https://linkshare0.pages.dev/](https://linkshare0.pages.dev/)
## Set up
```sh
git clone https://github.com/Jucaza1/link_shortener_ts
cd link_shortener_ts
```
# A) Docker compose
```sh
docker compose up --build
```
App is available at http://0.0.0.0:3000

# 📘 API Documentation – Link Shortener Service

## 🛠️ Base URL

All routes are prefixed under `/api/v1` except for the redirection ones (link serving).

---

## 🔐 Authentication

### Register

**POST** `/api/v1/users`
Register a new user.
**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "username": "yourname",
  "email": "you@example.com",
  "password": "yourpassword"
}
```

---

### Login

**POST** `/api/v1/login`
Login with email and password.
**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "email": "you@example.com",
  "password": "yourpassword"
}
```

**Response Header:**
Returns a JWT token in header `x-authorization`, which must be used to authenticate further requests.

---

## ⚠️ Rate-Limited Anonymous Link Creation

### Create a Guest Link (Unauthenticated)

**POST** `/api/v1/guestlinks`
Rate-limited to 5 requests every 15 minutes per IP.
**Headers:** `Content-Type: application/json`
**Body:**

```json
{
  "url": "https://example.com"
}
```

---

## 🔒 Authenticated Routes

All routes below **require** the `x-authorization` JWT header.

### Header Example

```http
x-authorization: your.jwt.token
```

---

### 🔗 Links

* **POST** `/api/v1/links/` – Create a link.
* **GET** `/api/v1/links/:id` – Get a link by ID.
* **DELETE** `/api/v1/links/:id` – Soft delete a link.
* **DELETE** `/api/v1/links/:id/delete` – ⚠️ Admin only: Hard delete a link.

---

### 👤 Users

* **GET** `/api/v1/users/:id` – Get user by ID.
* **GET** `/api/v1/users/email/:email` – Get user by email.
* **GET** `/api/v1/users/username/:username` – Get user by username.
* **DELETE** `/api/v1/users/:id` – Cancel (soft delete) user by ID.
* **GET** `/api/v1/users/:id/link` – Get all links created by user.
* **GET** `/api/v1/me` – Get the current logged-in user info.

---

### 🛡️ Admin-Only Routes

* **GET** `/api/v1/users` – List all users.
* **POST** `/api/v1/users/admin` – Create a new admin user.
* **DELETE** `/api/v1/users/:id/delete` – Hard delete a user by ID.
* **DELETE** `/api/v1/links/:id/delete` – Hard delete a link.

> These routes require an authenticated user with admin privileges.

---

## 🔁 Link Redirection

### Serve a Short Link

**GET** `/:short`
Redirects the user to the original URL behind the short link.

Example:

```http
GET /1234abcd
→ 302 Redirect to https://example.com
```

---

# B) Local instalation
### Install dependencies
```sh
npm install
npm run build
npm run test
npm run dev
```
#### script to populate the db
```sh
npm run script
```

# 🧪 Queue Management System - Testing Guide

Complete guide to test all APIs of the Smart Queue Management System.

---

## 📋 Table of Contents

1. [Setup](#1-setup)
2. [Import Postman Collection](#2-import-postman-collection)
3. [Seed Database](#3-seed-database)
4. [Complete Test Flow](#4-complete-test-flow)
5. [API Reference](#5-api-reference)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Setup

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or MongoDB Atlas
- Postman (for API testing)

### Start the Server

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
# MONGO_URI=mongodb://localhost:27017/queue_management
# JWT_SECRET=your_secret_key
# PORT=5000

# Start server
npm start
```

### Verify Server is Running

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-14T10:00:00.000Z"
}
```

---

## 2. Import Postman Collection

1. Open Postman
2. Click **Import** button
3. Select file: `testing/queue-management.postman_collection.json`
4. Collection "Queue Management System" will appear

### Variables (Auto-configured)

| Variable     | Description                     |
| ------------ | ------------------------------- |
| `baseUrl`    | http://localhost:5000/api       |
| `token`      | JWT token (auto-saved on login) |
| `serviceId`  | Service ID (auto-saved)         |
| `branchId`   | Branch ID (auto-saved)          |
| `categoryId` | Category ID (auto-saved)        |
| `tokenId`    | Token ID (auto-saved)           |

---

## 3. Seed Database

Run the seed script to populate sample data:

```bash
node testing/seed.js
```

This creates:

- 1 Admin user
- 1 Staff user
- 1 Customer user
- 2 Services (Banking, Government)
- 2 Branches per service
- 3 Categories per branch

---

## 4. Complete Test Flow

Follow this step-by-step flow to test the entire system:

---

### Step 1: Health Check

**Request:**

```
GET http://localhost:5000/health
```

**Response:**

```json
{
  "success": true,
  "status": "healthy"
}
```

---

### Step 2: Signup Customer

**Request:**

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Customer",
  "email": "john@test.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "John Customer",
      "email": "john@test.com",
      "role": "CUSTOMER"
    }
  }
}
```

📌 **Save the token** for next requests!

---

### Step 3: Signup Staff (for queue operations)

**Request:**

```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Staff User",
  "email": "staff@test.com",
  "password": "password123",
  "role": "STAFF"
}
```

---

### Step 4: Login Customer

**Request:**

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@test.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890abcdef12345",
      "name": "John Customer",
      "email": "john@test.com",
      "role": "CUSTOMER"
    }
  }
}
```

---

### Step 5: Get Services

**Request:**

```
GET http://localhost:5000/api/services
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f111111111111111111111",
      "name": "Banking Services",
      "description": "All banking related services"
    },
    {
      "_id": "65f222222222222222222222",
      "name": "Government Services",
      "description": "Passport, Aadhaar, etc."
    }
  ]
}
```

📌 **Copy serviceId** (e.g., `65f111111111111111111111`)

---

### Step 6: Get Branches

**Request:**

```
GET http://localhost:5000/api/branches?serviceId=65f111111111111111111111
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "65f333333333333333333333",
      "name": "Main Branch - Jaipur",
      "address": "MI Road, Jaipur",
      "service": "65f111111111111111111111"
    },
    {
      "_id": "65f444444444444444444444",
      "name": "City Branch - Delhi",
      "address": "Connaught Place, Delhi",
      "service": "65f111111111111111111111"
    }
  ]
}
```

📌 **Copy branchId** (e.g., `65f333333333333333333333`)

---

### Step 7: Get Categories

**Request:**

```
GET http://localhost:5000/api/categories?branchId=65f333333333333333333333
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "65f555555555555555555555",
      "name": "Cash Deposit",
      "branch": "65f333333333333333333333"
    },
    {
      "_id": "65f666666666666666666666",
      "name": "Cash Withdrawal",
      "branch": "65f333333333333333333333"
    }
  ]
}
```

📌 **Copy categoryId** (e.g., `65f555555555555555555555`)

---

### Step 8: Preview Slot (Before Booking)

**Request:**

```
GET http://localhost:5000/api/slots/65f333333333333333333333/65f555555555555555555555
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2026-02-14T00:00:00.000Z",
    "totalTokens": 0,
    "nextTokenNumber": 1,
    "nextDisplayNumber": "A-001",
    "waitingCount": 0,
    "estimatedWaitTime": 0,
    "queueStatus": "OPEN",
    "averageServiceTime": 5
  }
}
```

---

### Step 9: Book Token

**Request:**

```
POST http://localhost:5000/api/tokens
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "serviceId": "65f111111111111111111111",
  "branchId": "65f333333333333333333333",
  "categoryId": "65f555555555555555555555"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token booked successfully",
  "data": {
    "tokenId": "65f777777777777777777777",
    "tokenNumber": 1,
    "displayNumber": "A-001",
    "scheduledDate": "2026-02-14T00:00:00.000Z",
    "queueId": "65f888888888888888888888",
    "status": "WAITING",
    "position": 1,
    "estimatedWaitTime": 0,
    "service": { "name": "Banking Services" },
    "branch": { "name": "Main Branch - Jaipur" },
    "category": { "name": "Cash Deposit" }
  }
}
```

📌 **Save tokenId** for later operations!

---

### Step 10: Check Token Details

**Request:**

```
GET http://localhost:5000/api/tokens/65f777777777777777777777
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "tokenId": "65f777777777777777777777",
    "tokenNumber": 1,
    "displayNumber": "A-001",
    "status": "WAITING",
    "scheduledDate": "2026-02-14T00:00:00.000Z",
    "position": 1,
    "peopleAhead": 0,
    "estimatedWaitTime": 0,
    "service": { "name": "Banking Services" },
    "branch": { "name": "Main Branch - Jaipur", "address": "MI Road" },
    "category": { "name": "Cash Deposit" }
  }
}
```

---

### Step 11: Get My Tokens

**Request:**

```
GET http://localhost:5000/api/tokens/my?grouped=true
Authorization: Bearer <your_token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "upcoming": {
      "count": 1,
      "tokens": [
        {
          "tokenNumber": 1,
          "displayNumber": "A-001",
          "status": "WAITING",
          "position": 1,
          "estimatedWaitTime": 0
        }
      ]
    },
    "completed": {
      "count": 0,
      "tokens": []
    }
  }
}
```

---

### Step 12: Check Live Queue (Public)

**Request:**

```
GET http://localhost:5000/api/queue/65f333333333333333333333/65f555555555555555555555
```

**Response:**

```json
{
  "success": true,
  "data": {
    "queueId": "65f888888888888888888888",
    "date": "2026-02-14T00:00:00.000Z",
    "status": "OPEN",
    "branch": { "name": "Main Branch - Jaipur" },
    "category": { "name": "Cash Deposit" },
    "currentToken": null,
    "currentDisplayNumber": null,
    "nextTokens": [{ "tokenNumber": 1, "displayNumber": "A-001" }],
    "totalWaiting": 1,
    "lastTokenNumber": 1,
    "averageServiceTime": 5
  }
}
```

---

### Step 13: Login as Staff

**Request:**

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "staff@test.com",
  "password": "password123"
}
```

📌 **Save the staff token** for queue operations!

---

### Step 14: Call Next Token (Staff)

**Request:**

```
POST http://localhost:5000/api/queue/next
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "branchId": "65f333333333333333333333",
  "categoryId": "65f555555555555555555555"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Token 1 has been called",
  "data": {
    "token": {
      "tokenId": "65f777777777777777777777",
      "tokenNumber": 1,
      "displayNumber": "A-001",
      "status": "CALLED",
      "user": { "name": "John Customer" }
    },
    "queueInfo": {
      "currentToken": 1,
      "currentDisplayNumber": "A-001",
      "waitingCount": 0
    }
  }
}
```

---

### Step 15: Complete Token (Staff)

**Request:**

```
POST http://localhost:5000/api/tokens/65f777777777777777777777/complete
Authorization: Bearer <staff_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token 1 completed successfully",
  "data": {
    "tokenId": "65f777777777777777777777",
    "tokenNumber": 1,
    "displayNumber": "A-001",
    "status": "COMPLETED"
  }
}
```

---

### Step 16: Cancel Token (Customer)

If you want to cancel a WAITING token:

**Request:**

```
PATCH http://localhost:5000/api/tokens/<tokenId>/cancel
Authorization: Bearer <customer_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Token cancelled successfully",
  "data": {
    "tokenId": "65f...",
    "tokenNumber": 2,
    "displayNumber": "A-002",
    "status": "CANCELLED"
  }
}
```

---

## 5. API Reference

### Authentication APIs

| Method | Endpoint          | Auth | Description              |
| ------ | ----------------- | ---- | ------------------------ |
| POST   | /api/auth/signup  | No   | Register new user        |
| POST   | /api/auth/login   | No   | Login and get token      |
| GET    | /api/auth/profile | Yes  | Get current user profile |

### Service APIs

| Method | Endpoint      | Auth  | Description      |
| ------ | ------------- | ----- | ---------------- |
| GET    | /api/services | Yes   | Get all services |
| POST   | /api/services | Admin | Create service   |

### Branch APIs

| Method | Endpoint                 | Auth  | Description              |
| ------ | ------------------------ | ----- | ------------------------ |
| GET    | /api/branches?serviceId= | Yes   | Get branches for service |
| POST   | /api/branches            | Admin | Create branch            |

### Category APIs

| Method | Endpoint                  | Auth  | Description               |
| ------ | ------------------------- | ----- | ------------------------- |
| GET    | /api/categories?branchId= | Yes   | Get categories for branch |
| POST   | /api/categories           | Admin | Create category           |

### Slot APIs

| Method | Endpoint                         | Auth | Description                 |
| ------ | -------------------------------- | ---- | --------------------------- |
| GET    | /api/slots/:branchId/:categoryId | Yes  | Preview slot before booking |

### Token APIs

| Method | Endpoint                 | Auth  | Description            |
| ------ | ------------------------ | ----- | ---------------------- |
| POST   | /api/tokens              | Yes   | Book a token           |
| GET    | /api/tokens/:id          | Yes   | Get token details      |
| GET    | /api/tokens/my           | Yes   | Get user's tokens      |
| PATCH  | /api/tokens/:id/cancel   | Yes   | Cancel own token       |
| POST   | /api/tokens/:id/complete | Staff | Complete a token       |
| POST   | /api/tokens/:id/skip     | Staff | Skip a token           |
| POST   | /api/tokens/:id/requeue  | Staff | Re-queue skipped token |

### Queue APIs

| Method | Endpoint                         | Auth  | Description             |
| ------ | -------------------------------- | ----- | ----------------------- |
| GET    | /api/queue/:branchId/:categoryId | No    | Get live queue (public) |
| POST   | /api/queue/next                  | Staff | Call next token         |
| GET    | /api/queue/status                | Staff | Get queue status        |
| GET    | /api/queue/waiting               | Staff | Get waiting tokens list |

---

## 6. Troubleshooting

### Error: "No token, authorization denied"

**Solution:** Add Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Error: "Invalid token"

**Solution:** Login again to get a new token.

### Error: "You already have an active token in this queue"

**Solution:** You can only book one token per queue per day. Cancel existing token or wait.

### Error: "Booking is only allowed for today, tomorrow, or day after tomorrow"

**Solution:** Use valid date within 3-day range.

### Error: "Cannot complete token with status 'WAITING'"

**Solution:** Token must be CALLED before it can be completed. Call the token first.

### MongoDB Connection Error

**Solution:**

1. Check if MongoDB is running
2. Verify MONGO_URI in .env file
3. Check network connectivity

---

## 🎉 Testing Complete!

You have successfully tested the entire Queue Management System.

For automated testing, run:

```bash
node testing/testApis.js
```

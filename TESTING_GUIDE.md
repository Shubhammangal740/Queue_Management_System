# Smart Queue Management System – API Testing Guide

This guide explains how to test every part of the backend using Postman / Thunder Client / Insomnia.

---

## 1. User Signup (POST /api/auth/signup)

**URL:**  
POST http://localhost:5000/api/auth/signup

**BODY (JSON):**
```json
{
  "name": "Shubham",
  "email": "shubham@example.com",
  "password": "123456"
}
```

**Expected Response:**  
- User details  
- JWT token

---

## 2. User Login (POST /api/auth/login)

**URL:**  
POST http://localhost:5000/api/auth/login

**BODY:**
```json
{
  "email": "shubham@example.com",
  "password": "123456"
}
```

Copy the token from response → required for all protected routes.

---

## 3. Insert Data Manually in MongoDB

Open MongoDB Compass and insert sample data:

### Insert Services
Collection: `services`
```json
[
  { "name": "Hospital" },
  { "name": "Bank" }
]
```

### Insert Branches
Collection: `branches`
```json
[
  { "name": "Sawai Man Singh Hospital", "address": "Jaipur", "service": ObjectId("SERVICE_ID") },
  { "name": "SBI Main Branch", "address": "Tonk Road", "service": ObjectId("SERVICE_ID") }
]
```

### Insert Categories
Collection: `categories`
```json
[
  { "name": "OPD", "service": ObjectId("SERVICE_ID"), "branch": ObjectId("BRANCH_ID") },
  { "name": "Cash Deposit", "service": ObjectId("SERVICE_ID"), "branch": ObjectId("BRANCH_ID") }
]
```

Replace `"SERVICE_ID"` and `"BRANCH_ID"` with actual IDs.

---

## 4. Get Services (GET /api/services)

URL:  
GET http://localhost:5000/api/services

**Expected:** List of services

---

## 5. Get Branches for a Service (GET /api/branches)

URL:  
GET http://localhost:5000/api/branches?serviceId=SERVICE_ID

---

## 6. Get Categories for a Branch

URL:  
GET http://localhost:5000/api/categories?branchId=BRANCH_ID

---

## 7. Create Token (POST /api/tokens)

**URL:**  
POST http://localhost:5000/api/tokens

**HEADERS:**
```
Authorization: Bearer <your_token_here>
```

**BODY:**
```json
{
  "serviceId": "SERVICE_ID",
  "branchId": "BRANCH_ID",
  "categoryId": "CATEGORY_ID"
}
```

**Expected Response:** token details

---

## 8. Get Token Details + Queue Position (GET /api/tokens/:id)

URL:  
GET http://localhost:5000/api/tokens/TOKEN_ID

**HEADERS:**
```
Authorization: Bearer <your_token_here>
```

**Expected:**
- token object
- current queue position

---


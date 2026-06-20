# 🌳 OrchardLease

OrchardLease is a full-stack MERN platform for renting orchards and fruit gardens.

## Tech Stack

* React + Vite + TypeScript
* Node.js + Express
* MongoDB + Mongoose
* Tailwind CSS
* JWT Authentication

---

# Project Structure

```txt
orchard_lease/

client/
admin/
server/

server/src/
├── config
├── controllers
├── middleware
├── models
├── routes
├── services
├── utils
```

---

# Architecture

```mermaid
flowchart TD

A[Seller]
B[Renter]
C[Admin]

A --> D[User Portal]
B --> D

D --> E[Backend API]

C --> F[Admin Portal]

F --> E

E --> G[(MongoDB)]
```

---

# Core Modules

* Authentication
* User Management
* Orchard Management
* Booking System
* Admin Analytics
* Notifications
* Dashboard

---

# Roles

Seller

* Manage orchards
* View bookings

Renter

* Browse and book

Admin

* Manage users
* Moderate orchards
* View analytics

---

# Features

## User

* Signup
* Login
* Profile
* Notifications

## Seller

* Create Orchard
* Manage Listings
* Analytics

## Renter

* Search
* Wishlist
* Booking

## Admin

* Dashboard
* Moderation
* Reports

---

# Status Workflow

```mermaid
stateDiagram-v2

Draft --> Pending

Pending --> Approved

Pending --> Rejected

Approved --> Booked
```

---

# Booking Flow

```mermaid
sequenceDiagram

Seller->>Admin:
Submit Orchard

Admin->>Seller:
Approve

Renter->>Seller:
Request Booking

Seller->>Renter:
Accept
```

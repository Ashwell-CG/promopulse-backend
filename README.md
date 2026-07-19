# PromoPulse – Digital Coupon & Campaign Management Platform

PromoPulse is a web application that helps businesses manage their marketing campaigns and create digital coupons. It allows users to generate coupon codes, validate them, and track how many coupons were used in a simple dashboard.

## Features
- Authentication (Login and Register)
- Campaign Management (Create, View, Update, Delete)
- Coupon Generation (Generate random coupon codes)
- Coupon Validation (Check if coupon is valid, expired, or already used)
- Dashboard (Overview of total campaigns and coupons)
- Analytics (Simple charts showing coupon usage)

## Tech Stack
| Technology | Description |
|---|---|
| Node.js | Server environment |
| Express.js | Web framework for Node.js |
| MongoDB | Database to store user, campaign, and coupon data |
| Mongoose | Object Modeling tool for MongoDB |
| EJS | Template engine for HTML pages |
| Bootstrap 5 | CSS framework for styling |
| Chart.js | JavaScript library for drawing charts |
| bcryptjs | For password hashing |

## Prerequisites
- Node.js installed on your computer
- MongoDB installed and running locally

## Installation Steps
1. Clone the repository
2. cd into the project
3. npm install
4. Make sure MongoDB is running
5. npm start
6. Open http://localhost:3000

## Folder Structure
```
PromoPulse/
├── config/
│   └── db.js
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Campaign.js
│   └── Coupon.js
├── routes/
│   ├── auth.js
│   ├── campaigns.js
│   └── coupons.js
├── public/
│   └── css/
│       └── style.css
├── views/
│   ├── navbar.ejs
│   ├── home.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── dashboard.ejs
│   ├── campaigns.ejs
│   ├── campaign-form.ejs
│   ├── coupons.ejs
│   └── analytics.ejs
├── .env
├── app.js
├── package.json
└── README.md
```

## Screenshots
Screenshots will be added after deployment.

## Future Improvements
- Email notifications
- Admin panel
- QR code coupons
- Export reports

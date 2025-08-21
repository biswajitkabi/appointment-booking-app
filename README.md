# 🏥 Appointment Booking (Full-Stack)

Minimal clinic appointment booking app per take-home spec.

- **Patients**: Register/Login, view 7-day slots (09:00–17:00 UTC, 30-min), book, view my bookings  
- **Admin**: Login (seeded), view all bookings  
- **Auth**: JWT + Role-based access (patient/admin)  
- **DB**: PostgreSQL (Neon). Double booking prevented with unique index.  
- **Times**: Stored/served in UTC, frontend renders in browser’s timezone  

---

## 🌐 Live URLs

- **Frontend**: https://appointment-booking-app-theta.vercel.app 
- **API**: https://appointment-booking-app-nl50.onrender.com  

### Test Accounts
- Patient → `patient@example.com / Passw0rd!`  
- Admin → `admin@example.com / Passw0rd!`  

---

## 🛠️ Tech Stack

- **Backend**: Node.js + Express + Prisma + PostgreSQL  
- **Frontend**: React (Vite) + Tailwind CSS  
- **Hosting**: Render (API) + Vercel (UI) + Neon (DB)  
- **Auth**: JWT with role claims  

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
DATABASE_URL=postgresql://USER:PASSWORD@HOST/dbname?sslmode=require
JWT_SECRET=super-secret-key
FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Passw0rd!
PATIENT_EMAIL=patient@example.com
PATIENT_PASSWORD=Passw0rd!

## ✅ Submission Checklist

- Frontend URL: https://appointment-booking-app-theta.vercel.app
- API URL: https://appointment-booking-app-nl50.onrender.com
- Patient: patient@example.com / Passw0rd!
- Admin: admin@example.com / Passw0rd!
- Repo URL: https://github.com/biswajitkabi/appointment-booking-app.git


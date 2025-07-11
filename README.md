# 🎓 AdSchool Management System

A full-stack **MERN** (MongoDB, Express.js, React, Node.js) based **School Management System** powered by **MySQL** as the relational database. Deployed live on **Netlify** for frontend and ready for scalable school operations.

🔗 **Live App:** [AdSchool Management System](https://adschool-mangement.netlify.app/login)

---

## 🚀 Features

- 🔐 **Authentication:** Secure login system (Admin/Principal/Teachers/Students)
- 🏫 **Student & Teacher Management:** CRUD operations for admissions, onboarding, and management
- 📂 **Class & Section Management:** Dynamic forms for class, section, and subject mapping
- 📝 **Result Management:** CSV upload & preview system for student results
- 📢 **Notice Board:** Upload and display notices (with PDF or text)
- 📊 **Dashboard:** Real-time summary of key metrics and announcements
- 📄 **Audit Logging:** Track critical actions (e.g., result uploads)

---

## 🔧 Tech Stack

### **Frontend:**
- React.js (Vite)
- React Router DOM
- Tailwind CSS
- React Hook Form
- Axios
- Lucide Icons

### **Backend:**
- Node.js
- Express.js
- MySQL (Relational DB)
- Sequelize ORM or raw queries (depending on your setup)
- JWT for Authentication
- bcrypt for Password Hashing

### **Deployment:**
- Netlify (Frontend)
- Backend (e.g., Render, Heroku, or custom VPS)
- MySQL Database hosted (e.g., AWS RDS, ClearDB, or self-hosted)

---

## ⚙️ Local Development Setup

⚙️ Local Development Setup

1️⃣ Clone the Repo

2️⃣ Frontend Setup

3️⃣ Backend Setup

4️⃣ Environment Variables

Create .env files for both client/ and server/

client/.env

server/.env

🧹 Folder Structure (Simplified)

🗄 Database

MySQL relational database

Tables: users, students, teachers, results, notices, audit_logs

🌟 To-Do / Improvements

Role-based permissions for finer access control

Email notifications (for notices or result uploads)

Better analytics on dashboard

Export to PDF (student records, results)

Unit & integration tests (Jest / Supertest)

📜 License

This project is licensed under the MIT License.


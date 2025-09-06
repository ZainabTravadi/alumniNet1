---

# 🎓 AlumniNet

AlumniNet is a full-stack web application with two separate parts:

* **Frontend** → main user interface (React + Vite)
* **RecommendationSystem** → recommendation engine (React + Vite)

Both projects need to be installed and run separately.

---

## 🚀 Getting Started

### 1. Clone the Repository

```powershell
git clone https://github.com/VikashRaj-cmd/alumniNet.git
cd alumniNet
```

---

### 2. Install Dependencies

From the root of the repo:

```powershell
npm install
```

---

## ▶️ Running the Applications

⚠️ **Important:** You must run each project with the exact commands shown below.
Using the wrong command can cause port conflicts and crash the apps.

---

### 🔹 Run the Frontend (port 8081)

```powershell
cd Frontend
$env:PORT=8081; npm start
```

This will start the frontend on:
👉 [http://localhost:8081/](http://localhost:8081/)

---

### 🔹 Run the RecommendationSystem (port 8080)

```powershell
cd RecommendationSystem
$env:PORT=8080; npm start
```

This will start the recommendation system on:
👉 [http://localhost:8080/](http://localhost:8080/)

---

## 💡 Notes

* Always start **Frontend** on **8081**.
* Always start **RecommendationSystem** on **8080**.
* Do **not** swap or omit ports, or the apps may fail to run correctly.

---

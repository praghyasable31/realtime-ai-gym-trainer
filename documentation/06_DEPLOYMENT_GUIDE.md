# 06. Production Deployment Guide

This guide details the deployment of all three services to modern cloud providers.

---

## 1. Cloud Architecture Overview

| Component | Technology | Target Host | Environment Type |
|---|---|---|---|
| **Frontend** | React 18, Vite | **Vercel** / **Netlify** | Static Edge CDN |
| **Backend** | Node.js, Express | **Render** / **Railway** | Web Service |
| **AI Service** | Python 3.11, FastAPI | **Render** / **Railway** / **AWS EC2** | Python Web Service with WebSocket |
| **Database** | MongoDB | **MongoDB Atlas** | Managed Cloud Cluster |

---

## 2. Database Deployment: MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new **M0 Free Cluster**.
3. Under **Database Access**, create a user with read/write privileges (e.g., `gym_admin`).
4. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere).
5. Copy your connection string:
   ```env
   mongodb+srv://gym_admin:<PASSWORD>@cluster0.abcde.mongodb.net/ai-gym-trainer?retryWrites=true&w=majority
   ```

---

## 3. Backend Deployment: Render / Railway

### Deploying to Render:
1. Go to [Render.com](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong random 64-character string>`
   - `JWT_EXPIRE`: `30d`
   - `NODE_ENV`: `production`
5. Click **Deploy Web Service**. Note your backend URL (e.g., `https://ai-gym-backend.onrender.com`).

---

## 4. AI Service Deployment: Render / Railway

### Deploying to Render:
1. Click **New Web Service** on Render.
2. Select the same repository.
3. Configure:
   - **Root Directory**: `ai-service`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy the service and obtain the public URL (e.g., `ai-gym-ai.onrender.com`).
   *Note: WebSocket connections will connect to `wss://ai-gym-ai.onrender.com/ws/pose/{exercise}`.*

---

## 5. Frontend Deployment: Vercel

1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variables:
   - `VITE_API_URL`: `https://ai-gym-backend.onrender.com/api`
   - `VITE_AI_WS_URL`: `wss://ai-gym-ai.onrender.com/ws/pose`
5. Click **Deploy**. Your app is now live with global edge SSL.

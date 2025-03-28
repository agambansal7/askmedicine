# Deploying AskMedicine

This guide explains how to deploy AskMedicine to production using Render and Vercel.

## Backend Deployment (Render)

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your repository
4. Configure the service:
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && gunicorn medinquire_web:app`
   - Environment Variables:
     - `DEEPSEEK_API_KEY`: Your DeepSeek API key

## Frontend Deployment (Vercel)

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Create a new project
3. Connect your repository
4. Configure:
   - Framework Preset: Vite
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/dist`
   - Environment Variables:
     - `VITE_API_URL`: Your Render backend URL (e.g., https://askmedicine-backend.onrender.com)

## After Deployment

1. Update the frontend's `.env.production` with your actual backend URL
2. If needed, update CORS settings in the backend to allow your Vercel domain 
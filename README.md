# Weefly Cab - Project Structure

The project has been separated into a distinct **Frontend** and **Backend**.

## 📁 Directory Structure
- `frontend/`: Next.js application (Port 3000)
- `backend/`: Express Server (Port 5000)
- `package.json`: Root manager for coordinated scripts.

## 🚀 How to Run

### 1. Automatic (Both Services)
From the **root directory**, run:
```powershell
npm run dev
```
*Note: This uses `concurrently` to start both the Next.js frontend and the Express backend.*

### 2. Manual (Individual Services)

**To run the Backend:**
```powershell
cd backend
npm run dev
```

**To run the Frontend:**
```powershell
cd frontend
npm run dev
```

## 🛠️ Technology Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, Leaflet Maps, Framer Motion.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Google Genkit (Gemini AI).
- **Database**: MongoDB (Localhost:27017 by default).

## 🔌 API Interaction
The frontend is configured to call the backend at `http://localhost:5000/api`. Ensure the backend is running for search, fare, and authentication features.

## ❓ Troubleshooting

### 'npm' is not recognized
If you see the error `The term 'npm' is not recognized`, it means your terminal needs to refresh its environment variables after the Node.js installation.

**Solution:**
1. **Restart your terminal** or VS Code.
2. If it still fails, run this command in your PowerShell to refresh the PATH for the current session:
   ```powershell
   $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
   ```

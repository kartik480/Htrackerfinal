# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud database)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd HabbitTracker
npm run install-all
```

### 2. Configure Backend
Create a `.env` file in the `backend` folder:
```env
MONGODB_URI=mongodb://localhost:27017/habit-tracker
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### 3. Start MongoDB
**Local MongoDB:**
```bash
# Start MongoDB service
mongod
```

**MongoDB Atlas (Cloud):**
- Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a cluster and get your connection string
- Replace `MONGODB_URI` in `.env` with your Atlas connection string

### 4. Start the Application

**Option A: Use the startup script**
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

**Option B: Manual start**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 6. Create Your First Account
1. Open http://localhost:3000
2. Click "Sign Up"
3. Create your account
4. Start building habits!

## 🔧 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill process on port 3000 (Frontend)
npx kill-port 3000

# Kill process on port 5000 (Backend)
npx kill-port 5000
```

**MongoDB connection failed:**
- Check if MongoDB is running
- Verify connection string in `.env`
- For Atlas: Check IP whitelist and credentials

**Dependencies issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Need Help?
- Check the main [README.md](README.md) for detailed documentation
- Create an issue in the GitHub repository
- Email: nisakshtechnologiespvtltd@gmail.com

## 🎯 Next Steps

1. **Explore Features:**
   - Create your first habit
   - Track daily progress
   - View analytics and charts
   - Customize your profile

2. **Customize:**
   - Modify colors and themes
   - Add new habit categories
   - Customize validation rules

3. **Deploy:**
   - Frontend: Deploy to Vercel
   - Backend: Deploy to Heroku
   - Database: Use MongoDB Atlas

---

**Happy Habit Building! 🚀**

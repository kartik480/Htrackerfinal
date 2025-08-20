# 🚀 HabitTracker - Professional Habit Management System

A fully-featured, real-time habit tracking application built with modern web technologies. Transform your daily routines into powerful, sustainable habits with intelligent tracking, advanced analytics, and live updates.

## ✨ Features

### 🎯 Core Functionality
- **Habit Management**: Create, edit, delete, and organize habits by categories
- **Progress Tracking**: Daily progress logging with detailed completion data
- **Smart Analytics**: Advanced charts and insights for habit performance
- **Real-time Updates**: Live synchronization across all devices and users
- **Responsive Design**: Beautiful, modern UI that works on all devices

### 🔄 Real-time Capabilities
- **WebSocket Integration**: Instant updates without page refresh
- **Live Progress Tracking**: See habit completion in real-time
- **Multi-device Sync**: Changes sync instantly across all connected devices
- **Connection Status**: Visual indicator of real-time connection status
- **Automatic Reconnection**: Seamless connection management

### 📊 Advanced Analytics
- **Progress Visualization**: Bar charts, line charts, and pie charts
- **Streak Tracking**: Monitor your consistency and build momentum
- **Performance Insights**: Detailed analytics and trend analysis
- **Custom Time Ranges**: Week, month, and quarter views
- **Habit Comparison**: Compare performance across different habits

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with backdrop blur effects
- **Gradient Accents**: Sophisticated color schemes and visual hierarchy
- **Smooth Animations**: Engaging micro-interactions and transitions
- **Responsive Layout**: Optimized for mobile, tablet, and desktop
- **Dark/Light Themes**: Professional color schemes

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **Redux Toolkit**: Efficient state management with RTK Query
- **Material-UI (MUI)**: Professional UI component library
- **Socket.io Client**: Real-time WebSocket communication
- **Recharts**: Beautiful and responsive charts
- **Date-fns**: Modern date manipulation library

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Socket.io**: Real-time, bidirectional communication
- **JWT**: Secure authentication with JSON Web Tokens

### Development Tools
- **Concurrently**: Run multiple servers simultaneously
- **Nodemon**: Automatic server restart during development
- **ESLint**: Code quality and consistency

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HabbitTracker
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cd ../backend
   cp env.example .env
   ```
   
   Edit `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/habit-tracker
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```

4. **Start the application**
   ```bash
   # Start backend server (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📱 Usage Guide

### Creating Habits
1. Navigate to the Habits section
2. Click "Add New Habit"
3. Fill in habit details (name, category, frequency, target)
4. Set reminder preferences
5. Save your habit

### Tracking Progress
1. Go to the Progress section
2. Select a habit and date
3. Enter your completion value
4. Add optional notes
5. Save progress

### Viewing Analytics
1. Visit the Analytics section
2. Choose your preferred time range
3. Explore different chart types
4. Analyze your habit performance

### Real-time Features
- **Live Updates**: All changes appear instantly across devices
- **Connection Status**: Green indicator shows real-time connection
- **Automatic Sync**: No manual refresh needed
- **Multi-user Support**: Real-time updates for team environments

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

### Habit Model
```javascript
{
  user: ObjectId (ref: User),
  name: String,
  description: String,
  category: String,
  frequency: String,
  target: Number,
  unit: String,
  color: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Progress Model
```javascript
{
  user: ObjectId (ref: User),
  habit: ObjectId (ref: Habit),
  date: Date,
  value: Number,
  notes: String,
  completion: {
    isCompleted: Boolean,
    completedAt: Date,
    completedTime: String,
    duration: Number,
    startTime: String,
    endTime: String
  },
  mood: String,
  difficulty: String,
  location: String,
  weather: String,
  tags: [String],
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Habits
- `GET /api/habits` - Fetch user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `GET /api/habits/stats/overview` - Get habit statistics

### Progress
- `GET /api/progress` - Fetch user progress
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress
- `DELETE /api/progress/:id` - Delete progress

### Real-time Events
- `habitCreated` - New habit created
- `habitUpdated` - Habit updated
- `habitDeleted` - Habit deleted
- `progressCreated` - Progress entry created
- `progressUpdated` - Progress updated
- `progressDeleted` - Progress deleted

## 🎨 Customization

### Theme Configuration
The application uses a sophisticated theme system with:
- Custom color palettes
- Typography scales
- Component overrides
- Animation configurations

### Styling
- CSS-in-JS with Material-UI
- Custom CSS animations
- Responsive breakpoints
- Glassmorphism effects

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the production version
   ```bash
   npm run build
   ```
2. Deploy the `build` folder to your hosting platform

### Backend (Heroku/Railway)
1. Set environment variables
2. Deploy to your preferred platform
3. Update frontend API URLs

### Database
- Use MongoDB Atlas for cloud hosting
- Configure connection strings
- Set up proper security rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- **Mobile App**: React Native version
- **Team Features**: Collaborative habit tracking
- **AI Insights**: Machine learning for habit optimization
- **Integration**: Calendar and productivity app connections
- **Offline Support**: Progressive Web App features

---

**Built with ❤️ using modern web technologies**

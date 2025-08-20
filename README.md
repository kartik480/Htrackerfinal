# Habit Tracker Application

A comprehensive habit tracking application built with React.js, Redux Toolkit, and Node.js/Express backend. Track your daily habits, monitor progress, and visualize your journey to better habits with beautiful charts and analytics.

## 🚀 Features

### Frontend (React.js)
- **Modern UI/UX**: Built with Material-UI for a beautiful, responsive design
- **State Management**: Redux Toolkit for efficient state management
- **Authentication**: JWT-based user authentication with login/register
- **Habit Management**: Create, edit, delete, and categorize habits
- **Progress Tracking**: Daily progress tracking with notes and validation
- **Analytics Dashboard**: Beautiful charts using Recharts library
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Real-time Updates**: Instant feedback with toast notifications

### Backend (Node.js/Express)
- **RESTful API**: Clean, well-structured API endpoints
- **Authentication**: JWT token-based authentication
- **Data Validation**: Input validation and error handling
- **MongoDB Integration**: Mongoose ODM for database operations
- **Security**: Password hashing, CORS, and helmet middleware

### Key Features
- ✅ **User Authentication**: Secure login/registration system
- ✅ **Habit CRUD**: Full habit management capabilities
- ✅ **Progress Tracking**: Daily progress with date validation
- ✅ **Advanced Analytics**: Charts, streaks, and performance metrics
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Real-time Updates**: Instant state synchronization
- ✅ **Data Visualization**: Multiple chart types and insights
- ✅ **Filtering & Sorting**: Advanced habit organization
- ✅ **User Profiles**: Account management and settings

## 🛠️ Technologies Used

### Frontend
- **React.js 18** - Modern React with hooks
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - UI component library
- **React Router** - Navigation and routing
- **Recharts** - Data visualization charts
- **Date-fns** - Date manipulation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

## 📁 Project Structure

```
HabbitTracker/
├── backend/                 # Backend API server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Auth/       # Authentication components
│   │   │   ├── Dashboard/  # Dashboard component
│   │   │   ├── Habits/     # Habit management
│   │   │   ├── Progress/   # Progress tracking
│   │   │   ├── Analytics/  # Charts and analytics
│   │   │   ├── Profile/    # User profile
│   │   │   └── Layout/     # Main layout
│   │   ├── store/          # Redux store and slices
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
└── README.md               # Project documentation
```

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, unique),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date (default: now)
}
```

### Habit Model
```javascript
{
  userId: ObjectId (ref: User, required),
  name: String (required),
  description: String,
  category: String (default: 'General'),
  frequency: String (default: 'daily'),
  target: Number (default: 1),
  unit: String,
  color: String (default: '#3B82F6'),
  reminder: Boolean,
  startDate: Date (default: now),
  isActive: Boolean (default: true),
  createdAt: Date (default: now)
}
```

### Progress Model
```javascript
{
  habitId: ObjectId (ref: Habit, required),
  userId: ObjectId (ref: User, required),
  date: Date (required),
  value: Number (required),
  notes: String,
  createdAt: Date (default: now)
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/habit-tracker
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm run dev    # Development mode with nodemon
   # or
   npm start      # Production mode
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 Usage

### 1. Authentication
- Register a new account or login with existing credentials
- JWT tokens are automatically managed for authenticated requests

### 2. Habit Management
- Create new habits with custom categories, targets, and colors
- Set frequency (daily, weekly, monthly)
- Enable/disable habits as needed
- Filter and sort habits by various criteria

### 3. Progress Tracking
- Record daily progress for each habit
- Add notes and observations
- View progress history and trends
- Validate that progress cannot be recorded for future dates

### 4. Analytics & Insights
- View completion rates and streaks
- Analyze habit performance over time
- Category-based insights
- Beautiful charts and visualizations

### 5. User Profile
- Manage account information
- Change password securely
- Customize notification preferences
- App settings and theme options

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile

### Habits
- `GET /api/habits` - Get all user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit
- `GET /api/habits/stats/overview` - Get habit statistics

### Progress
- `GET /api/progress` - Get all progress entries
- `POST /api/progress` - Create progress entry
- `PUT /api/progress/:id` - Update progress
- `DELETE /api/progress/:id` - Delete progress

## 🎨 Customization

### Themes
The application uses Material-UI theming system. Customize colors, typography, and components in `src/App.js`.

### Charts
Charts are built with Recharts library. Modify chart configurations in the Analytics component.

### Validation
Form validation rules can be customized in each component's validation functions.

## 🚀 Deployment

### Frontend (Vercel)
1. Build the production version: `npm run build`
2. Deploy to Vercel or any static hosting service

### Backend (Heroku)
1. Set environment variables in Heroku dashboard
2. Deploy using Heroku CLI or GitHub integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Material-UI for the beautiful component library
- Recharts for the excellent charting capabilities
- Redux Toolkit for efficient state management
- The React and Node.js communities for amazing tools and libraries

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: nisakshtechnologiespvtltd@gmail.com

---

**Built with ❤️ for better habits and personal growth**

# SkillSprint - Hackathon & Coding Challenge Arena

![SkillSprint Banner](https://via.placeholder.com/1200x300/2563eb/ffffff?text=SkillSprint+-+Competitive+Coding+Platform)

## 🚀 Overview

SkillSprint is a comprehensive MERN stack platform designed for hosting coding competitions, hackathons, and collaborative coding challenges. It features real-time leaderboards, automated code grading, team collaboration, and an extensive discussion system.

## ✨ Features

### 🏆 Core Features
- **User Authentication**: JWT-based authentication with OAuth support (GitHub, Google)
- **Challenge Management**: Create, edit, and manage coding challenges with multiple difficulty levels
- **Real-time Code Editor**: Monaco Editor integration with syntax highlighting
- **Automated Grading**: Secure sandboxed code execution and automated scoring
- **Live Leaderboards**: Real-time global and challenge-specific rankings
- **1v1 & Group Competitions**: Challenge friends to coding duels and group competitions
- **Real-time Competition Arena**: Live competitions with chat, leaderboards, and instant scoring
- **Team Collaboration**: Create teams, join challenges together, and compete as groups
- **Discussion Forums**: Challenge-specific discussions with threaded replies
- **File Upload System**: Support for challenge materials, avatars, and submission files
- **Admin Dashboard**: Comprehensive platform management and analytics
- **Real-time Notifications**: Socket.IO powered live updates

### 🛠 Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching support
- **Progressive Web App**: PWA capabilities for mobile installation
- **Real-time Updates**: Socket.IO integration for live features
- **State Management**: Redux Toolkit for efficient state handling
- **API Rate Limiting**: Protection against abuse
- **Security**: Helmet.js, CORS, input validation, and SQL injection prevention
- **Performance**: Optimized queries, pagination, and caching strategies

## 🏗 Architecture

### Frontend (React + Vite)
```
src/
├── components/         # Reusable UI components
├── pages/             # Page components
├── store/             # Redux store and slices
│   └── slices/        # Feature-specific state slices
├── services/          # API services and utilities
│   └── api/           # API endpoint functions
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
└── styles/            # Global styles and Tailwind config
```

### Backend (Node.js + Express)
```
backend/
├── models/            # MongoDB schemas
├── routes/            # API route handlers
├── middleware/        # Authentication, validation, etc.
├── config/            # Database and Socket.IO configuration
├── uploads/           # File storage directory
└── server.js          # Main server file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/skillsprint.git
   cd skillsprint
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the backend directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/skillsprint
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   
   # OAuth (Optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Email (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start the development servers**
   
   Backend (from backend directory):
   ```bash
   npm run dev
   ```
   
   Frontend (from root directory):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Health Check: http://localhost:5000/api/health

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/stats` - Get user statistics

### Challenges
- `GET /api/challenges` - List challenges
- `POST /api/challenges` - Create challenge
- `GET /api/challenges/:id` - Get challenge details
- `PUT /api/challenges/:id` - Update challenge
- `DELETE /api/challenges/:id` - Delete challenge
- `POST /api/challenges/:id/join` - Join challenge
- `GET /api/challenges/featured` - Get featured challenges

### Submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/user` - Get user submissions
- `GET /api/submissions/challenge/:id` - Get challenge submissions

### Leaderboards
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/challenge/:id` - Challenge leaderboard

### Teams
- `GET /api/teams` - List public teams
- `POST /api/teams` - Create team
- `GET /api/teams/my-teams` - Get user's teams
- `POST /api/teams/:id/join` - Join team
- `POST /api/teams/:id/leave` - Leave team

### Discussions
- `GET /api/discussions/challenge/:id` - Get challenge discussions
- `POST /api/discussions/challenge/:id` - Create discussion post
- `POST /api/discussions/:id/like` - Like/unlike post
- `POST /api/discussions/:id/dislike` - Dislike post

### File Uploads
- `POST /api/uploads/avatar` - Upload user avatar
- `POST /api/uploads/challenge-files` - Upload challenge files
- `POST /api/uploads/submission-files` - Upload submission files

### Competitions
- `GET /api/competitions` - List competitions (public and user's)
- `POST /api/competitions` - Create new competition
- `GET /api/competitions/:id` - Get competition details
- `POST /api/competitions/:id/join` - Join public competition
- `POST /api/competitions/:id/invite` - Invite user to competition
- `POST /api/competitions/:id/invitation/respond` - Accept/decline invitation
- `POST /api/competitions/:id/start` - Start competition (creator only)
- `POST /api/competitions/:id/submit` - Submit solution for competition
- `GET /api/competitions/:id/leaderboard` - Get competition leaderboard
- `POST /api/competitions/:id/chat` - Send chat message
- `GET /api/competitions/user/my-competitions` - Get user's competitions

### Admin (Admin Only)
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/challenges` - Manage challenges
- `GET /api/admin/analytics` - Platform analytics

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Dark/Light Theme**: Automatic and manual theme switching
- **Responsive Layout**: Mobile-first responsive design
- **Accessibility**: WCAG compliant with keyboard navigation
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages and fallbacks

### Key Pages
- **Dashboard**: Personalized overview with stats and quick actions
- **Challenges**: Browse, filter, and search coding challenges
- **Competitions**: 1v1 and group competition arena with real-time features
- **Code Editor**: Full-featured editor with syntax highlighting
- **Leaderboards**: Real-time rankings with filters
- **Teams**: Create and manage collaborative teams
- **Discussions**: Threaded discussions for each challenge
- **Profile**: User profile management and statistics
- **Admin Panel**: Platform management and analytics

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Joi-based request validation
- **Rate Limiting**: API abuse prevention
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: Security headers and protection
- **File Upload Security**: Safe file handling and validation
- **SQL Injection Prevention**: Mongoose ODM protection

## 📊 Real-time Features

### Socket.IO Events
- **Leaderboard Updates**: Live ranking changes
- **New Submissions**: Real-time submission notifications
- **Challenge Updates**: Live challenge status changes
- **Competition Events**: Real-time 1v1 and group competition updates
- **Competition Chat**: Live messaging during competitions
- **Score Updates**: Instant scoring and leaderboard changes
- **Competition Invitations**: Real-time challenge invitations
- **Team Activities**: Team member actions and updates
- **Discussion Activity**: New posts and replies
- **System Notifications**: Platform-wide announcements

## 🚀 Current Status

### ✅ Completed Features
- ✅ Complete backend API with all routes
- ✅ User authentication system
- ✅ Challenge CRUD operations
- ✅ Submission handling
- ✅ Leaderboard system
- ✅ 1v1 & Group competition system
- ✅ Real-time competition features (chat, leaderboards, invitations)
- ✅ Team management
- ✅ Discussion forums
- ✅ File upload system
- ✅ Admin dashboard
- ✅ Frontend Redux store setup
- ✅ Dashboard page with real API integration
- ✅ Teams page implementation
- ✅ Real-time Socket.IO integration

### 🚧 In Progress
- 🚧 Code execution engine integration
- 🚧 Complete frontend page implementations
- 🚧 OAuth authentication
- 🚧 Email notification system

### 📋 Planned
- 📋 Mobile responsive optimizations
- 📋 Advanced analytics
- 📋 Contest scheduling
- 📋 Plagiarism detection

---

**Built with ❤️ for competitive coding and collaboration.**

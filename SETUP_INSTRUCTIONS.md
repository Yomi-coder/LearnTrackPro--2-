# EduMaster - Setup Instructions

## Prerequisites

- Node.js 20.x or later
- MongoDB Atlas account
- npm package manager

## Required Environment Variables

Create a `.env` file in the project root with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
SESSION_SECRET=your-secure-random-session-secret
```

## Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edumaster
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Set `SESSION_SECRET` to a secure random string

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open your browser to `http://localhost:5000`
   - The application serves both frontend and backend on the same port

## Admin Access

**Default Administrator Account:**
- Email: `admin@edumaster.com`
- Password: `admin123`

## User Account Management

- **Account Creation**: Only administrators can create new user accounts
- **Contact for New Accounts**: admin@edumaster.com
- **Supported Roles**: Admin, Lecturer, Student

## Project Structure

```
edumaster/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utility functions
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── auth.ts            # Authentication middleware
│   ├── mongodb.ts         # Database connection
│   └── routes.ts          # API routes
├── shared/                 # Shared types and schemas
└── package.json
```

## Key Features

- **Authentication**: Session-based authentication with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **UI**: React with shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state

## Development Notes

- The application uses TypeScript for type safety
- MongoDB models are defined in `server/models/`
- Authentication routes are in `server/auth.ts`
- Frontend pages are in `client/src/pages/`
- Shared types and schemas are in `shared/schema.ts`

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- Admin-only user creation
- Role-based access control
- Environment variable configuration

## Troubleshooting

1. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network connectivity
   - Ensure database user has proper permissions

2. **Authentication Problems**
   - Clear browser cookies/session storage
   - Verify admin credentials: admin@edumaster.com / admin123
   - Check console for authentication errors

3. **Build Issues**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify TypeScript compilation

## Contact

For technical support or new account requests:
- Email: admin@edumaster.com
- System Administrator: EduMaster Support Team
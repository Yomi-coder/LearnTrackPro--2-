import bcrypt from 'bcryptjs';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { mongoStorage } from './mongoStorage';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  app.use(session(sessionSettings));

  // Register endpoint
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, role, ...userData } = req.body;

      // Check if user exists
      const existingUser = await mongoStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await mongoStorage.createUser({
        email,
        password: hashedPassword,
        role: role || 'student',
        ...userData,
      });

      // Set session
      req.session.userId = newUser.id;
      req.session.user = newUser;

      res.status(201).json({
        message: 'Account created successfully',
        user: { ...newUser, password: undefined },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Login endpoint
  app.post('/api/auth/signin', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await mongoStorage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = user;

      res.json({
        message: 'Sign in successful',
        user: { ...user, password: undefined },
      });
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const user = await mongoStorage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Auth middleware
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

// Role-based middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user || !roles.includes(req.session.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import riskRoutes from './routes/riskRoutes.js';
import investigationRoutes from './routes/investigationRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import ruleRoutes from './routes/ruleRoutes.js';
import userRoutes from './routes/userRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Load Config
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request Logger
app.use(morgan('dev'));

// Parse JSON Bodies
app.use(express.json());

// Centralized Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: {
    success: false,
    message: 'Too many compliance requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Specific Authentication throttling (brute-force defense)
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit to 20 attempts
  message: {
    success: false,
    message: 'Too many authentication handshakes. Access blocked for 5 minutes.'
  }
});
app.use('/api/auth/login', authLimiter);

// Central API Routes Table
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/investigations', investigationRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/audit-logs', auditRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'UP', client: 'Sentinel-Fin System' }));

// Global error fallbacks
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Sentinel System Exception'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SENTINEL-FIN API Server running on port ${PORT}`);
});

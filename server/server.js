import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from '../src/backend/config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import residentRoutes from './routes/residents.js';
import violationRoutes from './routes/violations.js';
import billRoutes from './routes/bills.js';
import paymentRoutes from './routes/payments.js';
import auditRoutes from './routes/audit.js';
import notificationRoutes from './routes/notifications.js';
import dashboardRoutes from './routes/dashboard.js';

// ============ MIDDLEWARE ============

// Simple in-memory rate limiter with cleanup and size limit
const rateLimitStore = new Map();
const MAX_STORE_SIZE = 10000;
const MAX_AGE_MS = 60000; // 1 minute max age for entries

// Cleanup stale entries every 30 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  // If store is still too large after cleanup, clear oldest entries
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    const entries = Array.from(rateLimitStore.entries());
    rateLimitStore.clear();
    // Keep newest entries up to half of max
    entries.slice(-MAX_STORE_SIZE / 2).forEach(([k, v]) => rateLimitStore.set(k, v));
  }
}, 30000);

const rateLimit = (maxRequests = 5, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'];
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    record.count++;
    next();
  };
};

const app = express();

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.) in development
    // Also allow exact matches
    const isAllowed = !origin || origin === 'null' || allowedOrigins.includes(origin);
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User'],
  maxAge: 86400,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handler for PayloadTooLargeError
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed' || err.message.includes('request entity too large')) {
    console.error('Payload too large error:', err.message);
    return res.status(413).json({ error: 'Request entity too large. Please use a smaller image.' });
  }
  next(err);
});

// ============ ROUTES ============

// Apply rate limit to auth routes - increased for testing
app.use('/api', rateLimit(50, 60000));

// Authentication routes (login, register, logout)
app.use('/api', authRoutes);

// Profile routes
app.use('/api/profile', profileRoutes);

// Resident routes
app.use('/api/residents', residentRoutes);

// Violation routes
app.use('/api/violations', violationRoutes);

// Bill routes
app.use('/api/bills', billRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Audit routes
app.use('/api/audit-logs', auditRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Legacy route for send-notice (for backward compatibility)
app.post('/api/send-notice', async (req, res) => {
  // Forward to notifications router
  const { lot_number, block, resident_name, resident_email, title, message, send_to_all } = req.body;
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT,
        status VARCHAR(20) DEFAULT 'unread',
        related_id INTEGER,
        related_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }
    
    if (send_to_all) {
      // Get all residents
      const residents = await pool.query('SELECT id FROM residents');
      
      if (residents.rows.length === 0) {
        return res.status(404).json({ error: 'No residents found' });
      }
      
      // Insert notification for each resident
      for (const resident of residents.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, type, title, message, status, related_type) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [resident.id, 'announcement', title, message, 'unread', 'bulk_announcement']
        );
      }
      
      res.json({ 
        success: true, 
        message: `Announcement sent to ${residents.rows.length} residents!`,
        count: residents.rows.length
      });
    } else {
      // Single resident notification - find by lot_number and block
      if (!lot_number || !block) {
        return res.status(400).json({ error: 'Lot number and block are required for single notice' });
      }
      
      const resident = await pool.query(
        'SELECT id FROM residents WHERE lot_number = $1 AND block = $2',
        [lot_number, block]
      );
      
      if (resident.rows.length === 0) {
        return res.status(404).json({ error: 'Resident not found' });
      }
      
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, message, status, related_type) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [resident.rows[0].id, 'notice', title, message, 'unread', 'violation_notice']
      );
      
      res.json({ success: true, message: 'Notice sent successfully!' });
    }
  } catch (error) {
    console.error('Error sending notice:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add legacy route for dashboard-stats (hyphenated)
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const totalResidents = await pool.query('SELECT COUNT(*) as count FROM residents');
    const totalViolations = await pool.query('SELECT COUNT(*) as count FROM violations');
    const totalBills = await pool.query('SELECT COUNT(*) as count FROM bills');
    const totalPayments = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['approved']);
    const pendingPayments = await pool.query('SELECT COUNT(*) as count FROM payments WHERE status = $1', ['pending']);
    const pendingBills = await pool.query('SELECT COUNT(*) as count FROM bills WHERE status IN ($1, $2)', ['unpaid', 'overdue']);
    const pendingViolations = await pool.query('SELECT COUNT(*) as count FROM violations WHERE status = $1', ['pending']);
    
    res.json({
      totalResidents: parseInt(totalResidents.rows[0].count),
      totalViolations: parseInt(totalViolations.rows[0].count),
      totalBills: parseInt(totalBills.rows[0].count),
      totalPayments: parseInt(totalPayments.rows[0].count),
      pendingPayments: parseInt(pendingPayments.rows[0].count),
      pendingBills: parseInt(pendingBills.rows[0].count),
      pendingViolations: parseInt(pendingViolations.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============ SERVER START ============
app.listen(3001, '0.0.0.0', () => {
  console.log('✅ Server is online and ready!');
});

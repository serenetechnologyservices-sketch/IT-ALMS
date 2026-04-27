const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const allocationRoutes = require('./routes/allocations');
const qrRoutes = require('./routes/qr');
const agentRoutes = require('./routes/agent');
const intelligenceRoutes = require('./routes/intelligence');
const financialRoutes = require('./routes/financial');
const vendorRoutes = require('./routes/vendors');
const contractRoutes = require('./routes/contracts');
const catalogRoutes = require('./routes/catalog');
const requestRoutes = require('./routes/requests');
const approvalRoutes = require('./routes/approvals');
const ticketRoutes = require('./routes/tickets');
const servicePartnerRoutes = require('./routes/servicePartners');
const serviceEngineerRoutes = require('./routes/serviceEngineers');
const dashboardRoutes = require('./routes/dashboard');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const subMasterRoutes = require('./routes/subMasters');
const slaRoutes = require('./routes/sla');
const agentSettingsRoutes = require('./routes/agentSettings');
const entityAttachmentRoutes = require('./routes/entityAttachments');
const monitorRoutes = require('./routes/monitor');

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(require('./middleware/validate').sanitizeBody);

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { success: false, error: 'Too many requests, please try again later.' } });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, error: 'Too many login attempts.' } });
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 2000) console.warn(`SLOW: ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Asset Platform API is running', uptime: process.uptime() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.post('/api/agent/register', require('./controllers/agentController').register);

// Protected routes
app.use('/api/assets', auth, assetRoutes);
app.use('/api/allocations', auth, allocationRoutes);
app.use('/api/qr', auth, qrRoutes);
app.use('/api/agent', auth, agentRoutes);
app.use('/api/intelligence', auth, intelligenceRoutes);
app.use('/api/financial', auth, financialRoutes);
app.use('/api/vendors', auth, vendorRoutes);
app.use('/api/contracts', auth, contractRoutes);
app.use('/api/catalog', auth, catalogRoutes);
app.use('/api/requests', auth, requestRoutes);
app.use('/api/approvals', auth, approvalRoutes);
app.use('/api/tickets', auth, ticketRoutes);
app.use('/api/service-partners', auth, servicePartnerRoutes);
app.use('/api/service-engineers', auth, serviceEngineerRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/users', auth, userRoutes);
app.use('/api/sub-masters', auth, subMasterRoutes);
app.use('/api/sla', auth, slaRoutes);
app.use('/api/agent-settings', auth, agentSettingsRoutes);
app.use('/api', auth, entityAttachmentRoutes);
app.use('/api/monitor', auth, monitorRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

app.use(errorHandler);

module.exports = app;

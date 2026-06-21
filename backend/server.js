const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// ============ LOGGING SETUP ============
// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for logging
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);
const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom morgan format for logging
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// ============ MIDDLEWARE ============

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: "deny" },
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/clients/submit', limiter);
app.use(limiter);

// Logging
app.use(morgan(morganFormat, { stream: accessLogStream }));
app.use(morgan(morganFormat, { 
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400 
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization against XSS
app.use(xss());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Compression
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600, // 10 minutes
}));

app.use(cookieParser());

// ============ ENCRYPTION SETUP ============
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error('❌ ENCRYPTION_KEY must be 32 characters long');
  process.exit(1);
}

const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

function decrypt(text) {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text;
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption error:', error);
    return text;
  }
}

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required');
  process.exit(1);
}

mongoose.connect(MONGODB_URI || 'mongodb+srv://<db_username>:ObAGo8oUEE4EHxOj@cluster0.mo3qjuo.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// ============ MODELS ============

// Activity Log Schema
const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

// User Model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  isActive: { type: Boolean, default: true },
  refreshToken: { type: String },
  refreshTokenExpiry: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  lastLoginIP: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Client Form Model
const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  panCardNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  educationLevel: { type: String, required: true },
  professionalQualification: { type: String },
  clientType: { type: String, enum: ['Retail', 'Corporate'], required: true },
  debtLoanAmount: { type: Number, default: 0 },
  investmentAmount: { type: Number, required: true },
  incomeTypes: { type: [String], default: [] },
  annualIncome: { type: Number, required: true },
  totalNetWorth: { type: Number, required: true },
  assets: {
    realEstate: { type: Number, default: 0 },
    equity: { type: Number, default: 0 },
    alternatives: { type: Number, default: 0 },
    fixedIncomeAndCash: { type: Number, default: 0 }
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Contacted', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  notes: { type: String },
  submittedAt: { type: Date, default: Date.now },
  contactedAt: { type: Date },
  ipAddress: { type: String },
  userAgent: { type: String }
}, {
  timestamps: true
});

// Encrypt sensitive fields before saving
ClientSchema.pre('save', function(next) {
  if (this.isModified('panCardNumber')) {
    this.panCardNumber = encrypt(this.panCardNumber);
  }
  if (this.isModified('aadharNumber')) {
    this.aadharNumber = encrypt(this.aadharNumber);
  }
  next();
});

// Method to decrypt sensitive fields
ClientSchema.methods.decryptFields = function() {
  const obj = this.toObject();
  if (obj.panCardNumber) {
    obj.panCardNumber = decrypt(obj.panCardNumber);
  }
  if (obj.aadharNumber) {
    obj.aadharNumber = decrypt(obj.aadharNumber);
  }
  return obj;
};

const User = mongoose.model('User', UserSchema);
const Client = mongoose.model('Client', ClientSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// ============ HELPER FUNCTIONS ============

// Log activity
const logActivity = async (userId, action, details, req) => {
  try {
    const log = new ActivityLog({
      userId,
      action,
      details,
      ip: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.headers?.['user-agent']
    });
    await log.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
  
  return { accessToken, refreshToken };
};

// Set cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  // Access token cookie (short-lived)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_EXPIRY_MS) || 15 * 60 * 1000 // 15 minutes
  });
  
  // Refresh token cookie (long-lived)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_REFRESH_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// ============ MIDDLEWARE ============

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// Check account lockout
const checkAccountLockout = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  
  if (user.lockUntil && user.lockUntil > Date.now()) {
    return user;
  }
  return null;
};

// Session timeout middleware (1 hour inactivity)
const sessionTimeout = async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user.id);
    if (user && user.lastLogin) {
      const inactiveTime = Date.now() - new Date(user.lastLogin).getTime();
      const maxInactiveTime = parseInt(process.env.SESSION_TIMEOUT_MS) || 60 * 60 * 1000; // 1 hour
      
      if (inactiveTime > maxInactiveTime) {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
      }
    }
  }
  next();
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Validate email
    if (!email || !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    
    if (!/[!@#$%^&*]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'client'
    });
    
    await user.save();
    
    // Log activity
    await logActivity(user._id, 'REGISTER', { email: user.email, role: user.role }, req);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if account is locked
    const lockedUser = await checkAccountLockout(email);
    if (lockedUser) {
      const remainingMinutes = Math.ceil((lockedUser.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ 
        message: `Account locked. Try again in ${remainingMinutes} minutes.` 
      });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Reset login attempts
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip || req.connection?.remoteAddress;
    await user.save();
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    // Store refresh token in database
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();
    
    // Set cookies
    setAuthCookies(res, accessToken, refreshToken);
    
    // Log activity
    await logActivity(user._id, 'LOGIN', { email: user.email, ip: req.ip }, req);
    
    res.json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken || user.refreshTokenExpiry < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    
    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();
    
    setAuthCookies(res, accessToken, newRefreshToken);
    
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
app.post('/api/auth/logout', verifyToken, async (req, res) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken: null,
      refreshTokenExpiry: null
    });
    
    // Log activity
    await logActivity(req.user.id, 'LOGOUT', { email: req.user.email }, req);
    
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', verifyToken, sessionTimeout, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshToken -refreshTokenExpiry -loginAttempts -lockUntil');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ CLIENT FORM ROUTES ============

// Submit client form (public)
app.post('/api/clients/submit', async (req, res) => {
  try {
    const clientData = {
      ...req.body,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    // Check for duplicate submission
    const existingClient = await Client.findOne({
      $or: [
        { panCardNumber: clientData.panCardNumber },
        { aadharNumber: clientData.aadharNumber },
        { email: clientData.email },
        { phone: clientData.phone }
      ]
    });
    
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted your details. Our team will contact you shortly.',
        alreadySubmitted: true
      });
    }
    
    const client = new Client(clientData);
    await client.save();
    
    res.status(201).json({
      success: true,
      message: 'Form submitted successfully! We will contact you within 24-48 hours.',
      data: { id: client._id, submittedAt: client.submittedAt }
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
});

// Get all clients (Admin only)
app.get('/api/clients/all', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const clients = await Client.find().sort({ submittedAt: -1 });
    const decryptedClients = clients.map(client => client.decryptFields());
    
    // Log activity
    await logActivity(req.user.id, 'VIEW_ALL_CLIENTS', { count: decryptedClients.length }, req);
    
    res.json({
      success: true,
      data: decryptedClients
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get single client (Admin only)
app.get('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const decrypted = client.decryptFields();
    
    // Log activity
    await logActivity(req.user.id, 'VIEW_CLIENT', { clientId: client._id, clientName: client.name }, req);
    
    res.json({
      success: true,
      data: decrypted
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update client status (Admin only)
app.put('/api/clients/:id/status', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updateData = { status };
    
    if (status === 'Contacted') {
      updateData.contactedAt = new Date();
    }
    if (notes) {
      updateData.notes = notes;
    }
    
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    const decrypted = client.decryptFields();
    
    // Log activity
    await logActivity(req.user.id, 'UPDATE_CLIENT_STATUS', { 
      clientId: client._id, 
      clientName: client.name, 
      oldStatus: client.status,
      newStatus: status 
    }, req);
    
    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: decrypted
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete client (Admin only)
app.delete('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }
    
    // Log activity
    await logActivity(req.user.id, 'DELETE_CLIENT', { 
      clientId: client._id, 
      clientName: client.name 
    }, req);
    
    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get statistics (Admin only)
app.get('/api/clients/stats/summary', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const total = await Client.countDocuments();
    const pending = await Client.countDocuments({ status: 'Pending' });
    const contacted = await Client.countDocuments({ status: 'Contacted' });
    const approved = await Client.countDocuments({ status: 'Approved' });
    const rejected = await Client.countDocuments({ status: 'Rejected' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await Client.countDocuments({
      submittedAt: { $gte: today }
    });
    
    res.json({
      success: true,
      data: {
        total,
        pending,
        contacted,
        approved,
        rejected,
        todaySubmissions
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get activity logs (Admin only)
app.get('/api/admin/logs', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email');
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Log to error file
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  };
  fs.appendFileSync(
    path.join(logsDir, 'error.log'),
    JSON.stringify(errorLog) + '\n'
  );
  
  // Send appropriate response
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// ============ CREATE DEFAULT ADMIN ============
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@poseidon.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin@2024#Secure', salt);
      
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@poseidon.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      
      await admin.save();
      console.log('✅ Default admin created successfully');
      console.log('📧 Email: admin@poseidon.com');
      console.log('🔑 Password: Admin@2024#Secure');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Wait for MongoDB connection then create admin
mongoose.connection.once('open', () => {
  createDefaultAdmin();
});
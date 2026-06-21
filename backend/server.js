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

// Trust reverse proxy (Render/Railway/Nginx) so req.ip is the real client IP
app.set('trust proxy', 1);

// ============ LOGGING SETUP ============
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

// ============ MIDDLEWARE ============

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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/clients/submit', submitLimiter);
app.use(limiter);

app.use(morgan(morganFormat, { stream: accessLogStream }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(xss());
app.use(mongoSanitize());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600,
}));

app.use(cookieParser());

// ============ ENCRYPTION SETUP ============
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY || Buffer.byteLength(ENCRYPTION_KEY, 'utf8') !== 32) {
  console.error('❌ ENCRYPTION_KEY must be exactly 32 BYTES (not characters — watch multi-byte chars)');
  process.exit(1);
}
const ENCRYPTION_KEY_BUFFER = Buffer.from(ENCRYPTION_KEY, 'utf8');
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive field');
  }
}

function decrypt(text) {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text;
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Deterministic hash used ONLY for duplicate-detection lookups
// (encryption is randomized via IV, so we can't query encrypted fields directly)
function hashForLookup(text) {
  if (!text) return text;
  return crypto.createHmac('sha256', ENCRYPTION_KEY_BUFFER).update(text).digest('hex');
}

// ============ MONGODB CONNECTION ============
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is required in .env');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// ============ MODELS ============

const ActivityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
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
}, { timestamps: true });

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 18, max: 120 },
  panCardNumber: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  // Deterministic hashes used only for duplicate lookups — never expose these
  panCardHash: { type: String, index: true },
  aadharHash: { type: String, index: true },
  educationLevel: { type: String, required: true },
  professionalQualification: { type: String },
  clientType: { type: String, enum: ['Retail', 'Corporate'], required: true },
  debtLoanAmount: { type: Number, default: 0, min: 0 },
  investmentAmount: { type: Number, required: true, min: 0 },
  incomeTypes: { type: [String], default: [] },
  annualIncome: { type: Number, required: true, min: 0 },
  totalNetWorth: { type: Number, required: true },
  assets: {
    realEstate: { type: Number, default: 0, min: 0 },
    equity: { type: Number, default: 0, min: 0 },
    alternatives: { type: Number, default: 0, min: 0 },
    fixedIncomeAndCash: { type: Number, default: 0, min: 0 }
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
}, { timestamps: true });

// Encrypt sensitive fields + compute lookup hashes before saving
ClientSchema.pre('save', function (next) {
  if (this.isModified('panCardNumber')) {
    this.panCardHash = hashForLookup(this.panCardNumber);
    this.panCardNumber = encrypt(this.panCardNumber);
  }
  if (this.isModified('aadharNumber')) {
    this.aadharHash = hashForLookup(this.aadharNumber);
    this.aadharNumber = encrypt(this.aadharNumber);
  }
  next();
});

ClientSchema.methods.decryptFields = function () {
  const obj = this.toObject();
  if (obj.panCardNumber) obj.panCardNumber = decrypt(obj.panCardNumber);
  if (obj.aadharNumber) obj.aadharNumber = decrypt(obj.aadharNumber);
  delete obj.panCardHash;
  delete obj.aadharHash;
  return obj;
};

const User = mongoose.model('User', UserSchema);
const Client = mongoose.model('Client', ClientSchema);
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// ============ HELPER FUNCTIONS ============

const logActivity = async (userId, action, details, req) => {
  try {
    const log = new ActivityLog({
      userId,
      action,
      details,
      ip: req?.ip,
      userAgent: req?.headers?.['user-agent']
    });
    await log.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

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

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_EXPIRY_MS) || 15 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: parseInt(process.env.JWT_REFRESH_EXPIRY_MS) || 7 * 24 * 60 * 60 * 1000
  });
};

// ============ AUTH MIDDLEWARE ============

const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

const checkAccountLockout = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return user;
  }
  return null;
};

const sessionTimeout = async (req, res, next) => {
  if (req.user) {
    const user = await User.findById(req.user.id);
    if (user && user.lastLogin) {
      const inactiveTime = Date.now() - new Date(user.lastLogin).getTime();
      const maxInactiveTime = parseInt(process.env.SESSION_TIMEOUT_MS) || 60 * 60 * 1000;

      if (inactiveTime > maxInactiveTime) {
        return res.status(401).json({ message: 'Session expired. Please login again.' });
      }
    }
  }
  next();
};

// ============ AUTH ROUTES ============

// Register — role is NEVER taken from request body. New accounts are always 'client'.
// Promote someone to admin manually in the DB, never via this public endpoint.
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

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
      role: 'client' // hardcoded — never trust client-supplied role
    });

    await user.save();

    await logActivity(user._id, 'REGISTER', { email: user.email }, req);

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

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

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

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }

      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    user.lastLoginIP = req.ip;

    const { accessToken, refreshToken } = generateTokens(user);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    await logActivity(user._id, 'LOGIN', { email: user.email }, req);

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
    await User.findByIdAndUpdate(req.user.id, {
      refreshToken: null,
      refreshTokenExpiry: null
    });

    await logActivity(req.user.id, 'LOGOUT', { email: req.user.email }, req);

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

// Submit client form (PUBLIC — this is the "Try Now" form submission)
app.post('/api/clients/submit', async (req, res) => {
  try {
    const {
      name, email, phone, age, panCardNumber, aadharNumber,
      educationLevel, professionalQualification, clientType,
      debtLoanAmount, investmentAmount, incomeTypes, annualIncome,
      totalNetWorth, assets
    } = req.body;

    // Basic required-field validation
    if (!name || !email || !phone || !age || !panCardNumber || !aadharNumber ||
        !educationLevel || !clientType || !investmentAmount || !annualIncome) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    if (!['Retail', 'Corporate'].includes(clientType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid client type.'
      });
    }

    // Check for duplicates using deterministic hashes (encrypted fields can't be queried directly)
    const panHash = hashForLookup(panCardNumber);
    const aadharHash = hashForLookup(aadharNumber);

    const existingClient = await Client.findOne({
      $or: [
        { panCardHash: panHash },
        { aadharHash: aadharHash },
        { email: email.toLowerCase() },
        { phone }
      ]
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted your details. Our team will contact you shortly.',
        alreadySubmitted: true
      });
    }

    const client = new Client({
      name, email: email.toLowerCase(), phone, age,
      panCardNumber, aadharNumber, educationLevel,
      professionalQualification, clientType,
      debtLoanAmount, investmentAmount, incomeTypes,
      annualIncome, totalNetWorth, assets,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    await client.save();

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully! We will contact you within 24-48 hours.',
      data: { id: client._id, submittedAt: client.submittedAt }
    });
  } catch (error) {
    console.error('Submission error:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map(e => e.message).join(', ')
      });
    }

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

    await logActivity(req.user.id, 'VIEW_ALL_CLIENTS', { count: decryptedClients.length }, req);

    res.json({ success: true, data: decryptedClients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single client (Admin only)
app.get('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const decrypted = client.decryptFields();

    await logActivity(req.user.id, 'VIEW_CLIENT', { clientId: client._id, clientName: client.name }, req);

    res.json({ success: true, data: decrypted });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update client status (Admin only)
app.put('/api/clients/:id/status', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!['Pending', 'Contacted', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { status };
    if (status === 'Contacted') updateData.contactedAt = new Date();
    if (notes) updateData.notes = notes;

    const client = await Client.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const decrypted = client.decryptFields();

    await logActivity(req.user.id, 'UPDATE_CLIENT_STATUS', {
      clientId: client._id,
      clientName: client.name,
      newStatus: status
    }, req);

    res.json({ success: true, message: `Status updated to ${status}`, data: decrypted });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete client (Admin only)
app.delete('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    await logActivity(req.user.id, 'DELETE_CLIENT', { clientId: client._id, clientName: client.name }, req);

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get statistics (Admin only)
app.get('/api/clients/stats/summary', verifyToken, verifyAdmin, sessionTimeout, async (req, res) => {
  try {
    const [total, pending, contacted, approved, rejected] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ status: 'Pending' }),
      Client.countDocuments({ status: 'Contacted' }),
      Client.countDocuments({ status: 'Approved' }),
      Client.countDocuments({ status: 'Rejected' }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = await Client.countDocuments({ submittedAt: { $gte: today } });

    res.json({
      success: true,
      data: { total, pending, contacted, approved, rejected, todaySubmissions }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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

    res.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============ ERROR HANDLING ============

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err);

  const errorLog = {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  };
  fs.appendFile(
    path.join(logsDir, 'error.log'),
    JSON.stringify(errorLog) + '\n',
    () => {}
  );

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
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// ============ CREATE DEFAULT ADMIN ============
// Credentials come from .env — never hardcode them in source.
const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD not set — skipping default admin creation');
      return;
    }

    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      await User.create({
        name: 'Super Admin',
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      console.log('✅ Default admin created from .env credentials');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

mongoose.connection.once('open', () => {
  createDefaultAdmin();
});
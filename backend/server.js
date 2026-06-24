const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// ============ LOGGING SETUP ============
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
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
  windowMs: 15 * 60 * 1000, max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true, legacyHeaders: false,
});
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: 'Too many submissions from this IP, please try again later.',
  standardHeaders: true, legacyHeaders: false,
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 3,
  message: 'Too many password reset requests. Please try again later.',
  standardHeaders: true, legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/clients/submit', submitLimiter);
app.use(limiter);

app.use(morgan(morganFormat, { stream: accessLogStream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xss());
app.use(compression());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  try {
    const [ivHex, dataHex] = text.split(':');
    if (!ivHex || !dataHex) return text;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(dataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY_BUFFER, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

function hashForLookup(text) {
  if (!text) return text;
  return crypto.createHmac('sha256', ENCRYPTION_KEY_BUFFER).update(text).digest('hex');
}

// ============ EMAIL SETUP (for password reset) ============
let mailer = null;
if (process.env.SMTP_EMAIL && process.env.SMTP_APP_PASSWORD) {
  mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_APP_PASSWORD,
    },
  });
  console.log('✅ Email transporter configured (Gmail SMTP)');
} else {
  console.warn('⚠️  SMTP_EMAIL / SMTP_APP_PASSWORD not set — password reset emails will not be sent');
}

async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!mailer) {
    console.warn('⚠️  Email not configured — reset link would have been:', resetUrl);
    throw new Error('Email service is not configured on this server.');
  }

  await mailer.sendMail({
    from: `"PlanPoseidon" <${process.env.SMTP_EMAIL}>`,
    to: toEmail,
    subject: 'Reset your PlanPoseidon admin password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#0A1C14;">Password Reset Request</h2>
        <p>We received a request to reset your PlanPoseidon admin password.</p>
        <p>Click the button below to choose a new password. This link expires in 30 minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#CCFF00;color:#0A1C14;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email — your password will not change.</p>
        <p style="color:#999;font-size:12px;word-break:break-all;">Or paste this link into your browser: ${resetUrl}</p>
      </div>
    `,
  });
}

// ============ SQLITE SETUP ============
const DB_PATH = process.env.SQLITE_PATH || path.join(__dirname, 'planposeidon.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');   // better concurrent read/write behavior
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client' CHECK(role IN ('admin','client')),
    isActive INTEGER NOT NULL DEFAULT 1,
    refreshToken TEXT,
    refreshTokenExpiry TEXT,
    loginAttempts INTEGER NOT NULL DEFAULT 0,
    lockUntil TEXT,
    lastLogin TEXT,
    lastLoginIP TEXT,
    setupComplete INTEGER NOT NULL DEFAULT 0,
    resetToken TEXT,
    resetTokenExpiry TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    age INTEGER NOT NULL CHECK(age >= 18 AND age <= 120),
    panCardNumber TEXT NOT NULL,
    aadharNumber TEXT NOT NULL,
    panCardHash TEXT,
    aadharHash TEXT,
    educationLevel TEXT NOT NULL,
    professionalQualification TEXT,
    clientType TEXT NOT NULL CHECK(clientType IN ('Retail','Corporate')),
    debtLoanAmount REAL NOT NULL DEFAULT 0,
    investmentAmount REAL NOT NULL,
    incomeTypes TEXT NOT NULL DEFAULT '[]',
    annualIncome REAL NOT NULL,
    totalNetWorth REAL NOT NULL,
    assetRealEstate REAL NOT NULL DEFAULT 0,
    assetEquity REAL NOT NULL DEFAULT 0,
    assetAlternatives REAL NOT NULL DEFAULT 0,
    assetFixedIncomeAndCash REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Contacted','Approved','Rejected')),
    notes TEXT,
    submittedAt TEXT NOT NULL DEFAULT (datetime('now')),
    contactedAt TEXT,
    ipAddress TEXT,
    userAgent TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_clients_panHash ON clients(panCardHash);
  CREATE INDEX IF NOT EXISTS idx_clients_aadharHash ON clients(aadharHash);
  CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
  CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);

  CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    userId TEXT,
    action TEXT NOT NULL,
    details TEXT,
    ip TEXT,
    userAgent TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

console.log('✅ SQLite connected:', DB_PATH);

// ============ HELPER: ROW <-> DTO TRANSFORMS ============

// Convert a client row from SQLite into the shape the frontend expects
// (decrypts PAN/Aadhar, parses incomeTypes JSON, nests assets back into an object)
function clientRowToDTO(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    panCardNumber: decrypt(row.panCardNumber),
    aadharNumber: decrypt(row.aadharNumber),
    educationLevel: row.educationLevel,
    professionalQualification: row.professionalQualification,
    clientType: row.clientType,
    debtLoanAmount: row.debtLoanAmount,
    investmentAmount: row.investmentAmount,
    incomeTypes: JSON.parse(row.incomeTypes || '[]'),
    annualIncome: row.annualIncome,
    totalNetWorth: row.totalNetWorth,
    assets: {
      realEstate: row.assetRealEstate,
      equity: row.assetEquity,
      alternatives: row.assetAlternatives,
      fixedIncomeAndCash: row.assetFixedIncomeAndCash,
    },
    status: row.status,
    notes: row.notes,
    submittedAt: row.submittedAt,
    contactedAt: row.contactedAt,
  };
}

function userRowToSafeDTO(row) {
  if (!row) return null;
  const { password, refreshToken, refreshTokenExpiry, loginAttempts, lockUntil, ...safe } = row;
  return safe;
}

// ============ PREPARED STATEMENTS ============
const stmts = {
  insertUser: db.prepare(`INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`),
  findUserByEmail: db.prepare(`SELECT * FROM users WHERE email = ?`),
  findUserById: db.prepare(`SELECT * FROM users WHERE id = ?`),
  updateUserLogin: db.prepare(`
    UPDATE users SET loginAttempts = ?, lockUntil = ?, lastLogin = ?, lastLoginIP = ?,
      refreshToken = ?, refreshTokenExpiry = ?, updatedAt = datetime('now') WHERE id = ?
  `),
  updateUserLoginAttempts: db.prepare(`
    UPDATE users SET loginAttempts = ?, lockUntil = ?, updatedAt = datetime('now') WHERE id = ?
  `),
  clearUserRefreshToken: db.prepare(`
    UPDATE users SET refreshToken = NULL, refreshTokenExpiry = NULL, updatedAt = datetime('now') WHERE id = ?
  `),
  completeAdminSetup: db.prepare(`
    UPDATE users SET email = ?, password = ?, setupComplete = 1, updatedAt = datetime('now')
    WHERE id = ? AND role = 'admin'
  `),
  setResetToken: db.prepare(`
    UPDATE users SET resetToken = ?, resetTokenExpiry = ?, updatedAt = datetime('now') WHERE id = ?
  `),
  findUserByResetToken: db.prepare(`
    SELECT * FROM users WHERE resetToken = ?
  `),
  resetPasswordAndClearToken: db.prepare(`
    UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL,
      loginAttempts = 0, lockUntil = NULL, updatedAt = datetime('now') WHERE id = ?
  `),

  insertClient: db.prepare(`
    INSERT INTO clients (
      id, name, email, phone, age, panCardNumber, aadharNumber, panCardHash, aadharHash,
      educationLevel, professionalQualification, clientType, debtLoanAmount, investmentAmount,
      incomeTypes, annualIncome, totalNetWorth,
      assetRealEstate, assetEquity, assetAlternatives, assetFixedIncomeAndCash,
      ipAddress, userAgent
    ) VALUES (
      @id, @name, @email, @phone, @age, @panCardNumber, @aadharNumber, @panCardHash, @aadharHash,
      @educationLevel, @professionalQualification, @clientType, @debtLoanAmount, @investmentAmount,
      @incomeTypes, @annualIncome, @totalNetWorth,
      @assetRealEstate, @assetEquity, @assetAlternatives, @assetFixedIncomeAndCash,
      @ipAddress, @userAgent
    )
  `),
  findClientDuplicate: db.prepare(`
    SELECT * FROM clients WHERE panCardHash = ? OR aadharHash = ? OR email = ? OR phone = ? LIMIT 1
  `),
  findAllClients: db.prepare(`SELECT * FROM clients ORDER BY submittedAt DESC`),
  findClientById: db.prepare(`SELECT * FROM clients WHERE id = ?`),
  updateClientStatus: db.prepare(`
    UPDATE clients SET status = ?, notes = COALESCE(?, notes), contactedAt = COALESCE(?, contactedAt) WHERE id = ?
  `),
  deleteClient: db.prepare(`DELETE FROM clients WHERE id = ?`),
  countAllClients: db.prepare(`SELECT COUNT(*) AS c FROM clients`),
  countClientsByStatus: db.prepare(`SELECT COUNT(*) AS c FROM clients WHERE status = ?`),
  countClientsSince: db.prepare(`SELECT COUNT(*) AS c FROM clients WHERE submittedAt >= ?`),

  insertLog: db.prepare(`INSERT INTO activity_logs (id, userId, action, details, ip, userAgent) VALUES (?, ?, ?, ?, ?, ?)`),
  findLogs: db.prepare(`SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT ?`),
};

// ============ HELPER FUNCTIONS ============
const logActivity = (userId, action, details, req) => {
  try {
    stmts.insertLog.run(
      randomUUID(), userId || null, action,
      details ? JSON.stringify(details) : null,
      req?.ip || null, req?.headers?.['user-agent'] || null
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
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
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = stmts.findUserById.get(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive' });

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied. Admin only.' });
  next();
};

const sessionTimeout = (req, res, next) => {
  if (req.user) {
    const user = stmts.findUserById.get(req.user.id);
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

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    if (!/[0-9]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number' });
    if (!/[!@#$%^&*]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });

    const existing = stmts.findUserByEmail.get(email.toLowerCase());
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const id = randomUUID();
    stmts.insertUser.run(id, name.trim(), email.toLowerCase(), hashedPassword, 'client');

    logActivity(id, 'REGISTER', { email: email.toLowerCase() }, req);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id, name: name.trim(), email: email.toLowerCase(), role: 'client' }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = stmts.findUserByEmail.get(email.toLowerCase());
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.lockUntil) - Date.now()) / 60000);
      return res.status(429).json({ message: `Account locked. Try again in ${remainingMinutes} minutes.` });
    }

    if (!user.isActive) return res.status(401).json({ message: 'Account deactivated. Contact admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const lockUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null;
      stmts.updateUserLoginAttempts.run(attempts, lockUntil, user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    stmts.updateUserLogin.run(
      0, null, new Date().toISOString(), req.ip,
      refreshToken, refreshTokenExpiry, user.id
    );

    setAuthCookies(res, accessToken, refreshToken);
    logActivity(user.id, 'LOGIN', { email: user.email }, req);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        setupComplete: !!user.setupComplete
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ============ FIRST-LOGIN ADMIN SETUP ============
// This route is the ONLY way credentials can change without re-supplying
// the current password — and it only works ONCE per admin account, ever.
// Once setupComplete flips to 1 in the DB, this route permanently rejects
// further attempts for that account. There is no way to re-trigger it
// short of an operator manually resetting the flag in the database.
app.post('/api/auth/complete-admin-setup', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { newEmail, newPassword } = req.body;

    const user = stmts.findUserById.get(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.setupComplete) {
      return res.status(403).json({ message: 'Setup has already been completed for this account.' });
    }

    if (!newEmail || !newEmail.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
    }

    if (newEmail.toLowerCase() !== user.email) {
      const existing = stmts.findUserByEmail.get(newEmail.toLowerCase());
      if (existing) return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    stmts.completeAdminSetup.run(newEmail.toLowerCase(), hashedPassword, user.id);

    // Invalidate current session — admin must log in fresh with new credentials
    stmts.clearUserRefreshToken.run(user.id);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    logActivity(user.id, 'COMPLETE_ADMIN_SETUP', { newEmail: newEmail.toLowerCase() }, req);

    res.json({ message: 'Admin credentials updated. Please log in again with your new credentials.' });
  } catch (error) {
    console.error('Complete admin setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ FORGOT PASSWORD ============
// Always returns the same generic success message regardless of whether
// the email exists, so this endpoint can't be used to enumerate valid
// admin/client accounts.
app.post('/api/auth/forgot-password', async (req, res) => {
  const genericResponse = {
    message: 'If an account with that email exists, a password reset link has been sent.'
  };

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = stmts.findUserByEmail.get(email.toLowerCase());

    // Don't reveal whether the account exists — always respond the same way.
    if (!user || !user.isActive) {
      return res.json(genericResponse);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    stmts.setResetToken.run(resetToken, resetTokenExpiry, user.id);

    const resetUrl = `${process.env.RESET_PASSWORD_URL_BASE || 'http://localhost:5173/reset-password'}?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetUrl);
      logActivity(user.id, 'FORGOT_PASSWORD_REQUEST', { email: user.email }, req);
    } catch (emailError) {
      // Email service genuinely not configured / failed to send.
      // Log it server-side, but still return the generic response —
      // don't leak that something went wrong to the client.
      console.error('Failed to send reset email:', emailError.message);
    }

    res.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ RESET PASSWORD ============
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one number' });
    }
    if (!/[!@#$%^&*]/.test(newPassword)) {
      return res.status(400).json({ message: 'Password must contain at least one special character (!@#$%^&*)' });
    }

    const user = stmts.findUserByResetToken.get(token);

    if (!user || !user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired. Please request a new one.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    stmts.resetPasswordAndClearToken.run(hashedPassword, user.id);

    // Invalidate any existing session so old tokens can't linger
    stmts.clearUserRefreshToken.run(user.id);

    logActivity(user.id, 'PASSWORD_RESET_COMPLETED', { email: user.email }, req);

    res.json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = stmts.findUserById.get(decoded.id);

    if (!user || user.refreshToken !== refreshToken || new Date(user.refreshTokenExpiry) < new Date()) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    stmts.updateUserLogin.run(
      user.loginAttempts, user.lockUntil, user.lastLogin, user.lastLoginIP,
      newRefreshToken, refreshTokenExpiry, user.id
    );

    setAuthCookies(res, accessToken, newRefreshToken);
    res.json({ message: 'Token refreshed' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.post('/api/auth/logout', verifyToken, (req, res) => {
  try {
    stmts.clearUserRefreshToken.run(req.user.id);
    logActivity(req.user.id, 'LOGOUT', { email: req.user.email }, req);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', verifyToken, sessionTimeout, (req, res) => {
  try {
    const user = stmts.findUserById.get(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(userRowToSafeDTO(user));
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ============ CLIENT FORM ROUTES ============

app.post('/api/clients/submit', (req, res) => {
  try {
    const {
      name, email, phone, age, panCardNumber, aadharNumber,
      educationLevel, professionalQualification, clientType,
      debtLoanAmount, investmentAmount, incomeTypes, annualIncome,
      totalNetWorth, assets
    } = req.body;

    if (!name || !email || !phone || !age || !panCardNumber || !aadharNumber ||
        !educationLevel || !clientType || !investmentAmount || !annualIncome) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }
    if (!['Retail', 'Corporate'].includes(clientType)) {
      return res.status(400).json({ success: false, message: 'Invalid client type.' });
    }

    const panHash = hashForLookup(panCardNumber);
    const aadharHash = hashForLookup(aadharNumber);
    const normalizedEmail = email.toLowerCase();

    const existing = stmts.findClientDuplicate.get(panHash, aadharHash, normalizedEmail, phone);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted your details. Our team will contact you shortly.',
        alreadySubmitted: true
      });
    }

    const id = randomUUID();
    const a = assets || {};

    stmts.insertClient.run({
      id,
      name,
      email: normalizedEmail,
      phone,
      age: Number(age),
      panCardNumber: encrypt(panCardNumber),
      aadharNumber: encrypt(aadharNumber),
      panCardHash: panHash,
      aadharHash: aadharHash,
      educationLevel,
      professionalQualification: professionalQualification || null,
      clientType,
      debtLoanAmount: Number(debtLoanAmount) || 0,
      investmentAmount: Number(investmentAmount),
      incomeTypes: JSON.stringify(incomeTypes || []),
      annualIncome: Number(annualIncome),
      totalNetWorth: Number(totalNetWorth),
      assetRealEstate: Number(a.realEstate) || 0,
      assetEquity: Number(a.equity) || 0,
      assetAlternatives: Number(a.alternatives) || 0,
      assetFixedIncomeAndCash: Number(a.fixedIncomeAndCash) || 0,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
    });

    const saved = stmts.findClientById.get(id);

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully! We will contact you within 24-48 hours.',
      data: { id, submittedAt: saved.submittedAt }
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
});

app.get('/api/clients/all', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const rows = stmts.findAllClients.all();
    const data = rows.map(clientRowToDTO);
    logActivity(req.user.id, 'VIEW_ALL_CLIENTS', { count: data.length }, req);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const row = stmts.findClientById.get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: 'Client not found' });

    const data = clientRowToDTO(row);
    logActivity(req.user.id, 'VIEW_CLIENT', { clientId: row.id, clientName: row.name }, req);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.put('/api/clients/:id/status', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!['Pending', 'Contacted', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const existing = stmts.findClientById.get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Client not found' });

    const contactedAt = status === 'Contacted' ? new Date().toISOString() : null;
    stmts.updateClientStatus.run(status, notes || null, contactedAt, req.params.id);

    const updated = stmts.findClientById.get(req.params.id);
    logActivity(req.user.id, 'UPDATE_CLIENT_STATUS', { clientId: updated.id, clientName: updated.name, newStatus: status }, req);

    res.json({ success: true, message: `Status updated to ${status}`, data: clientRowToDTO(updated) });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.delete('/api/clients/:id', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const existing = stmts.findClientById.get(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Client not found' });

    stmts.deleteClient.run(req.params.id);
    logActivity(req.user.id, 'DELETE_CLIENT', { clientId: existing.id, clientName: existing.name }, req);

    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/clients/stats/summary', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const total = stmts.countAllClients.get().c;
    const pending = stmts.countClientsByStatus.get('Pending').c;
    const contacted = stmts.countClientsByStatus.get('Contacted').c;
    const approved = stmts.countClientsByStatus.get('Approved').c;
    const rejected = stmts.countClientsByStatus.get('Rejected').c;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySubmissions = stmts.countClientsSince.get(today.toISOString()).c;

    res.json({ success: true, data: { total, pending, contacted, approved, rejected, todaySubmissions } });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/admin/logs', verifyToken, verifyAdmin, sessionTimeout, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const rows = stmts.findLogs.all(limit);
    const data = rows.map(r => ({ ...r, details: r.details ? JSON.parse(r.details) : null }));
    res.json({ success: true, data });
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
    error: err.message, stack: err.stack,
    url: req.originalUrl, method: req.method, ip: req.ip
  };
  fs.appendFile(path.join(logsDir, 'error.log'), JSON.stringify(errorLog) + '\n', () => {});

  if (err.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid token' });
  if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });

  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  createDefaultAdmin();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    db.close();
    console.log('SQLite connection closed');
    process.exit(0);
  });
});

// ============ CREATE DEFAULT ADMIN ============
function createDefaultAdmin() {
  try {
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.warn('⚠️  DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD not set — skipping default admin creation');
      return;
    }

    const existing = stmts.findUserByEmail.get(adminEmail.toLowerCase());
    if (existing) return;

    bcrypt.hash(adminPassword, 12).then((hashedPassword) => {
      stmts.insertUser.run(randomUUID(), 'Super Admin', adminEmail.toLowerCase(), hashedPassword, 'admin');
      console.log('✅ Default admin created from .env credentials');
    });
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}
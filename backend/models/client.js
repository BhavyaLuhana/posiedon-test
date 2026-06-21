const mongoose = require('mongoose');
const crypto = require('crypto');

// Encryption functions
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here';
const IV_LENGTH = 16;

function encrypt(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const clientSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 18,
    max: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  panCardNumber: {
    type: String,
    required: [true, 'PAN Card number is required'],
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN card number']
  },
  aadharNumber: {
    type: String,
    required: [true, 'Aadhar number is required'],
    trim: true,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  
  // Education & Professional
  educationLevel: {
    type: String,
    required: [true, 'Education level is required'],
    enum: ['High School', 'Graduate', 'Post Graduate', 'Doctorate', 'Other']
  },
  professionalQualification: {
    type: String,
    trim: true
  },
  
  // Financial Information
  clientType: {
    type: String,
    required: [true, 'Client type is required'],
    enum: ['Retail', 'Corporate']
  },
  debtLoanAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  investmentAmount: {
    type: Number,
    required: [true, 'Investment amount is required'],
    min: 0
  },
  incomeTypes: {
    type: [String],
    enum: ['Salary', 'Business', 'Investments', 'Rental', 'Pension', 'Other']
  },
  annualIncome: {
    type: Number,
    required: [true, 'Annual income is required'],
    min: 0
  },
  totalNetWorth: {
    type: Number,
    required: [true, 'Total net worth is required'],
    min: 0
  },
  
  // Asset Classes
  assets: {
    realEstate: { type: Number, default: 0, min: 0 },
    equity: { type: Number, default: 0, min: 0 },
    alternatives: { type: Number, default: 0, min: 0 },
    fixedIncomeAndCash: { type: Number, default: 0, min: 0 }
  },
  
  // Status & Timestamps
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  contactedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for total assets
clientSchema.virtual('totalAssets').get(function() {
  return this.assets.realEstate + 
         this.assets.equity + 
         this.assets.alternatives + 
         this.assets.fixedIncomeAndCash;
});

// Indexes for faster queries
clientSchema.index({ panCardNumber: 1 });
clientSchema.index({ aadharNumber: 1 });
clientSchema.index({ email: 1 });
clientSchema.index({ phone: 1 });
clientSchema.index({ status: 1 });
clientSchema.index({ submittedAt: -1 });

// Encrypt sensitive data before saving
clientSchema.pre('save', function(next) {
  if (this.isModified('panCardNumber')) {
    this.panCardNumber = encrypt(this.panCardNumber);
  }
  if (this.isModified('aadharNumber')) {
    this.aadharNumber = encrypt(this.aadharNumber);
  }
  next();
});

// Method to decrypt sensitive data
clientSchema.methods.decryptFields = function() {
  const obj = this.toObject();
  if (obj.panCardNumber) {
    obj.panCardNumber = decrypt(obj.panCardNumber);
  }
  if (obj.aadharNumber) {
    obj.aadharNumber = decrypt(obj.aadharNumber);
  }
  return obj;
};

module.exports = mongoose.model('Client', clientSchema);